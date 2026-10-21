'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),errors=[],downloads=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
 w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:test'};w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){assert(this.download.endsWith('.json')||this.download.endsWith('.csv'));};
}});
const w=dom.window,d=w.document,run=source=>w.eval(source),el=id=>d.getElementById(id),click=id=>el(id).click();
const plain=v=>JSON.parse(JSON.stringify(v));
function close(actual,expected,tol=1e-7){assert(Math.abs(actual-expected)<=tol,`${actual} != ${expected} (tol ${tol})`)}
function change(id,value){el(id).value=value;el(id).dispatchEvent(new w.Event('change',{bubbles:true}));}
let checks=0;
function test(name,fn){fn();checks++;console.log('✓ '+name)}
try{
 test('offline initialization, Chinese default and complete translation keys',()=>{
  assert.equal(errors.length,0);assert.equal(d.documentElement.lang,'zh-CN');assert(el('title')===null);
  assert(el('orderTab').textContent.includes('有序度'));assert.equal(el('orderMode').value,'two');
  assert.equal(d.querySelectorAll('script[src],link[rel=stylesheet]').length,0);
  assert.deepEqual(run('Object.keys(I18N.zh).sort().join()'),run('Object.keys(I18N.en).sort().join()'));
  for(const e of d.querySelectorAll('[data-i18n]'))assert(e.textContent.trim(),e.dataset.i18n);
 });
 test('text/JSON import, descending scans, scientific notation, metadata and XYE',()=>{
  const s='Angle Intensity\n40 1\n41 2\n42 3\n43 2\n44 1';w.text=s;
  assert.deepEqual(plain(run('parse(text)')),{x:[40,41,42,43,44],y:[1,2,3,2,1]});
  w.text='44 1\n43 2\n42 3\n41 2\n40 1';assert.equal(run('parse(text).x[0]'),40);
  w.text='\uFEFF*RAS_HEADER_START\n# comment\n40,1e2,.5\n41,2e2,.5\n42,3e2,.5\n43,2e2,.5\n44,1e2,.5';assert.equal(run('parse(text).y[2]'),300);
  for(const input of [{x:[40,41,42,43,44],y:[1,2,3,2,1]},[[40,1],[41,2],[42,3],[43,2],[44,1]],Array.from({length:5},(_,i)=>({x:40+i,y:i+1}))]){w.text=JSON.stringify(input);assert.equal(run('parse(text).x.length'),5)}
 });
 test('malformed, duplicate, nonfinite, nonmonotonic and all-zero inputs fail',()=>{
  for(const text of ['40 1\n40 2\n41 3\n42 2\n43 1','40 1\n42 2\n41 3\n43 2\n44 1','40 0\n41 0\n42 0\n43 0\n44 0','40 1\n41 NaN\n42 1\n43 1\n44 1','40 1\n41 1e999\n42 1\n43 1\n44 1','40 1\n41 2','{"x":[1,2],"y":[3]}','40 1\n41 2\n42 3\n43 2\n180 1']){w.text=text;assert.throws(()=>run('parse(text)'),text)}
 });
 test('the two supplied formulas give independently correct percentages',()=>{
  const result=run(`['two','four'].map(mode=>orderingMetrics({'110':12.8,'111':100,'200':20,'002':10},{'110':20,'111':100,'200':55,'002':45},mode))`);
  close(result[0].ordering_percent,64);close(result[1].ordering_percent,100*(12.8/130)/(.1));
  assert.equal(result[0].long_range_order_percent,null);
  close(run(`orderingMetrics({'110':12.8,'111':100},{'110':20,'111':100},'two',true,true,'verified').long_range_order_percent`),80);
  assert.throws(()=>run(`orderingMetrics({'110':12.8,'111':100},{'110':20,'111':100},'two',true)`));
  assert.throws(()=>run(`orderingMetrics({'110':12.8,'111':0},{'110':20,'111':100},'two')`));
  assert.throws(()=>run(`orderingMetrics({'110':12.8,'111':100,'200':20,'002':10},{'110':20,'111':100,'200':0,'002':45},'four')`));
  assert(run(`orderingMetrics({'110':30,'111':100},{'110':20,'111':100},'two').ordering_percent`)>100);
  close(run(`orderingMetrics({'110':0,'111':100},{'110':20,'111':100},'two').ordering_percent`),0);
 });
 test('manual-area UI, calibration gating and full source provenance',()=>{
  change('areaSource','manual');change('a110','12.8');change('a111','100');click('ptCalc');close(run('state.ordering.metric.ordering_percent'),64);
  assert.equal(run('state.ordering.synthetic'),false);assert.equal(run('state.ordering.source'),'manual_integrated_areas');
  change('reportLRO','on');el('reportLRO').checked=true;click('ptCalc');assert.equal(run('state.ordering'),null);
  change('referenceSource','Test reference');el('referenceVerified').checked=true;click('ptCalc');close(run('state.ordering.metric.long_range_order_percent'),80);
  el('reportLRO').checked=false;el('referenceVerified').checked=false;change('referenceSource','');change('a111','');click('ptCalc');assert.equal(run('state.ordering'),null);
  change('a111','1000');change('a110','128');change('areaSource','fit');
 });
 test('correct Gaussian Jacobian agrees with finite differences, including intensity scaling',()=>{
  const error=run(`(()=>{const p=[320,40.3,.74,28,.12],x=40.8,J=peakJac(x,p,1,40,true);return Math.max(...p.map((v,j)=>{const q=p.slice(),r=p.slice(),h=1e-5;q[j]+=h;r[j]-=h;return Math.abs(J[j]-(peakModel(x,q,1,40,true)-peakModel(x,r,1,40,true))/(2*h));}));})()`);
  assert(error<1e-5,error);
  for(const scale of [.002,1,1000]){w.scale=scale;run(`state.x=[];state.y=[];for(let i=0;i<=800;i++){const x=37+i*.008;state.x.push(x);state.y.push(scale*(20+.4*(x-40)+250*Math.exp(-.5*((x-40.3)/.56)**2)));}`);const p=run(`fitPeaks(37,43.4,[40.3],'linear').peaks[0]`);close(p.peak,40.3,1e-5);close(p.fwhm,.56*2*Math.sqrt(2*Math.log(2)),1e-5);assert(Math.abs(p.area/(scale*250*.56*Math.sqrt(2*Math.PI))-1)<1e-5)}
 });
 test('overlapping double-peak LM recovers known areas, centers and widths',()=>{
  run(`state.x=[];state.y=[];for(let i=0;i<=1000;i++){const x=44+i*.01;state.x.push(x);state.y.push(60+.5*(x-49)+gaussian(x,400,47.12,.81)+gaussian(x,250,49.01,.64));}`);
  const f=run(`fitPeaks(44,54,[47.1,49],'linear')`);
  close(f.peaks[0].peak,47.12,2e-5);close(f.peaks[1].peak,49.01,2e-5);
  close(f.peaks[0].area,400*.81*Math.sqrt(2*Math.PI),.002);close(f.peaks[1].area,250*.64*Math.sqrt(2*Math.PI),.002);
  assert.throws(()=>run(`fitPeaks(44,54,[49,47],'linear')`));
 });
 test('Mode 1 works on a truncated 110/111-only scan and ignores unused reference fields',()=>{
  run('demo();state.x=state.x.filter(x=>x<=44.2);state.y=state.y.slice(0,state.x.length);onLoaded()');
  change('r200','');change('r002','');change('orderMode','two');click('ptCalc');assert(run('state.ordering'));close(run('state.ordering.metric.ordering_percent'),100,.05);
  change('orderMode','four');click('ptCalc');assert.equal(run('state.ordering'),null);
  change('r200','55');change('r002','45');run('demo()');click('ptCalc');close(run('state.ordering.metric.ordering_percent'),100,.05);
  assert.equal(run('state.orderFits.length'),3);assert.equal(run('state.ordering.peaks.length'),4);
 });
 test('SNIP fitting is available and rejects irregular scan spacing',()=>{
  const p=run(`fitPeaks(37,44.2,[40.304],'snip').peaks[0]`);assert(p.area>0);assert(p.rms>=0);
  run('state.x[1500]+=.003');assert.throws(()=>run(`fitPeaks(37,44.2,[40.304],'snip')`));run('demo()');
 });
 test('analytic Scherrer FWHM, integral breadth and instrumental correction models',()=>{
  run(`state.x=[];state.y=[];for(let i=0;i<=2000;i++){const x=38+i*.002;state.x.push(x);state.y.push(10+100*Math.exp(-4*Math.log(2)*((x-40)/.5)**2));}onLoaded();`);
  change('sizeBaseline','linear');change('left','38');change('right','42');change('K','.9');change('lambda','1.5406');change('inst','0');change('widthMode','fwhm');
  const expected=.9*.15406/(.5*Math.PI/180*Math.cos(40*Math.PI/360));click('calc');close(run('state.size.peaks[0].D_nm'),expected,.001);
  change('widthMode','integral');change('inst','.1');change('broadeningModel','gaussian');click('calc');let p=run('state.size.peaks[0]');close(p.corrected_width_deg**2,p.integralBreadth**2-.01,1e-9);close(p.integralBreadth,.5*Math.sqrt(Math.PI/(4*Math.log(2))),.0001);
  change('broadeningModel','cauchy');click('calc');p=run('state.size.peaks[0]');close(p.corrected_width_deg,p.integralBreadth-.1,1e-10);
  change('inst','100');click('calc');assert.equal(run('state.size'),null);change('inst','0');change('sizeBaseline','fit');click('calc');assert(run('state.size.peaks[0].D_nm')>0);
  change('K','');click('calc');assert.equal(run('state.size'),null);change('K','.9');change('lambda','-1');click('calc');assert.equal(run('state.size'),null);change('lambda','1.5406');
 });
 test('flat/incomplete peaks and instrument limits are rejected',()=>{
  const settings={K:.9,lambda_A:1.5406,instrument_width_deg:1,instrument_profile:'gaussian'};w.settings=settings;
  assert.throws(()=>run('scherrer(40,.5,settings)'));assert.throws(()=>run('scherrer(0,2,settings)'));
  run('state.x=[38,39,40,41,42,43,44,45];state.y=[1,1,1,1,1,1,1,1]');assert.throws(()=>run(`directPeak(38,45,'linear')`));assert.throws(()=>run(`fitPeaks(38,45,[41],'linear')`));
  assert.throws(()=>run(`fitPeaks(35,46,[40],'linear')`));
 });
 test('Williamson–Hall analytic size/strain recovery and nonphysical cases',()=>{
  const make=`[40,60,80].map(peak=>{const theta=peak*Math.PI/360;return{peak,beta_rad:(.9*.15406/50+.001*4*Math.sin(theta))/Math.cos(theta)};})`;
  const wh=run(`williamsonHall(${make},.9,1.5406)`);close(wh.D_nm,50,1e-8);close(wh.strain,.001,1e-10);close(wh.r2,1,1e-10);
  assert.equal(run(`williamsonHall([{peak:40,beta_rad:.01}],.9,1.5406).D_nm`),null);
  assert.equal(run(`williamsonHall([40,40,80].map(peak=>({peak,beta_rad:.01})),.9,1.5406).status`),'whDistinct');
  assert.equal(run(`williamsonHall([40,60,80].map(peak=>({peak,beta_rad:(.02-.001*4*Math.sin(peak*Math.PI/360))/Math.cos(peak*Math.PI/360)})),.9,1.5406).D_nm`),null);
 });
 test('shared demo computes both results; language/display changes preserve them',()=>{
  run('demo()');change('orderMode','four');click('ptCalc');click('calc');assert(run('state.ordering&&state.size'));
  const previous=run('JSON.stringify(currentAnalysis().ordering)');change('language','en');assert.equal(d.documentElement.lang,'en');assert.equal(el('ptCalc').textContent,'Calculate ordering');assert.equal(run('JSON.stringify(currentAnalysis().ordering)'),previous);
  change('sqrt','on');assert(run('state.ordering&&state.size'));change('language','zh');
  click('multiCalc');assert.equal(run('state.size.peaks.length'),3);assert(run('state.size.williamson_hall.D_nm')>0);
 });
 test('TEM calibration is explicit, positive, traceable, and does not replace Scherrer size',()=>{
  el('useCalibration').checked=true;change('cptco','1.2');click('calc');assert.equal(run('state.size'),null);
  change('calibrationSource','TEM-2026-test');click('calc');close(run('state.size.peaks[0].empirical_size_nm/state.size.peaks[0].D_nm'),1.2);
  el('useCalibration').checked=false;click('calc');
 });
 test('combined exports include method, reference, widths, units and UTF-8 CSV BOM',()=>{
  click('ptCalc');assert.equal(el('exportJSON').disabled,false);click('exportJSON');click('exportCSV');assert.equal(downloads.length,2);
  const a=run('currentAnalysis()');assert(a.ordering&&a.size);assert.equal(a.tool_version,'2.0.0');assert.equal(a.size.units.size,'nm');assert(a.ordering.settings.peak_regions.length===3);
  const csv=run('analysisCSV(currentAnalysis())');assert(csv.startsWith('\uFEFF'));assert(csv.includes('instrument_profile'));assert(csv.includes('ordering'));assert(csv.includes('size'));
  const lines=csv.trim().split('\r\n');for(const line of lines)assert.equal((line.match(/(?:^|,)"(?:[^"]|"")*"/g)||[]).length,39);
  assert.equal(run(`csvCell('=HYPERLINK("evil")')`),'"\'=HYPERLINK(""evil"")"');
 });
 test('scope-aware input invalidation and sample change prevent stale exports',()=>{
  change('r110','21');assert.equal(run('state.ordering'),null);assert(run('state.size'));assert.equal(el('exportCSV').disabled,false);
  change('K','.91');assert.equal(run('state.size'),null);assert.equal(el('exportCSV').disabled,true);
  click('ptCalc');click('calc');run('demo()');assert.equal(run('state.ordering'),null);assert.equal(run('state.size'),null);
 });
 test('untrusted names render as text; tab navigation and empty export state',()=>{
  change('areaSource','manual');change('manualName','<img src=x onerror=alert(1)>');click('ptCalc');assert.equal(el('ptResult').querySelectorAll('img').length,0);
  click('sizeTab');assert.equal(el('sizeTab').getAttribute('aria-selected'),'true');assert(el('orderPanel').classList.contains('hidden'));click('exportTab');assert(!el('exportPanel').classList.contains('hidden'));
 });
 assert.equal(errors.length,0,errors.map(e=>String(e)).join('\n'));
 console.log(`\n${checks} regression groups passed.`);
}finally{dom.window.close()}

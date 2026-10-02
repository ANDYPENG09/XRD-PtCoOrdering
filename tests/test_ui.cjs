const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom');
for(const tool of ['XRD-PtCoOrdering']){
 const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8'),errors=[];
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
  w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 }});
 const w=dom.window,doc=w.document,evalJS=s=>w.eval(s);
 assert.equal(errors.length,0,`${tool} initial script errors`);
 assert.deepEqual(JSON.parse(JSON.stringify(evalJS('parse("Angle Intensity\\n40 1\\n41 2\\n42 1")'))),{x:[40,41,42],y:[1,2,1]});
 assert.equal(evalJS('parse("42 1\\n41 2\\n40 1").x[0]'),40);
 assert.equal(evalJS('parse(\'{"x":[40,41,42],"y":[1,2,1]}\').x.length'),3);
 for(const text of ['40 1\n40 2\n41 1','40 1\n42 2\n41 1','40 0\n41 0\n42 0','40 1\n41 NaN\n42 1','40 1\n41 1e999\n42 1']){
  w.badText=text;assert.throws(()=>evalJS('parse(badText)'));
 }
 if(tool==='XRD-PtCoOrdering'){
  assert.equal(evalJS('orderingMetrics([12.8,100,55,45],[20,100,55,45]).value'),64);
  assert.equal(evalJS('orderingMetrics([12.8,100,55,45],[20,100,55,45],"lro",true,"reference calibration").value'),80);
  assert.throws(()=>evalJS('orderingMetrics([12.8,100,55,45],[20,100,55,45],"lro")'));
  assert(evalJS('orderingMetrics([30,100,55,45],[20,100,55,45]).value')>100);
  doc.getElementById('ptCalc').click();assert(evalJS('state.analysis.metric.value')>90);
  const legacy=evalJS('state.analysis.metric.value');
  doc.getElementById('orderMode').value='lro';doc.getElementById('orderMode').dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(evalJS('state.analysis'),null);doc.getElementById('ptCalc').click();assert.equal(evalJS('state.analysis'),null);
  doc.getElementById('referenceSource').value='test fully ordered reference';doc.getElementById('referenceVerified').checked=true;
  doc.getElementById('ptCalc').click();assert(Math.abs(evalJS('state.analysis.metric.value')-Math.sqrt(legacy/100)*100)<1e-8);
 }else{
  // Analytic Gaussian width gives the expected Scherrer domain size.
  evalJS('state.x=[];state.y=[];for(let i=0;i<=2000;i++){const x=38+i*.002;state.x.push(x);state.y.push(10+100*Math.exp(-4*Math.log(2)*((x-40)/.5)**2));}onLoaded();');
  const expected=.89*1.540598/(.5*Math.PI/180*Math.cos(40*Math.PI/360))/10;
  assert(Math.abs(evalJS('analyze(38,42).D')/expected-1)<1e-4);
  evalJS("$('mode').value='integral';$('inst').value=.1;$('broadeningModel').value='gaussian';");
  assert(Math.abs(evalJS('analyze(38,42).correctedDeg**2-(analyze(38,42).integralBreadth**2-.01)'))<1e-10);
  evalJS("$('broadeningModel').value='cauchy';");assert(Math.abs(evalJS('analyze(38,42).correctedDeg-(analyze(38,42).integralBreadth-.1)'))<1e-10);
  assert.throws(()=>evalJS("$('inst').value=100;analyze(38,42)"));evalJS("$('inst').value=0");
  evalJS("$('left').value=38;$('right').value=42;");doc.getElementById('calc').click();assert(evalJS('state.analysis.peaks[0].D')>0);
  const wh=evalJS('williamsonHall([40,60,80].map(peak=>{const theta=peak*Math.PI/360;return{peak,correctedDeg:(.89*.1540598/50+.001*4*Math.sin(theta))/Math.cos(theta)*180/Math.PI};}),.89,1.540598)');
  assert(Math.abs(wh.D_nm-50)<1e-8);assert(Math.abs(wh.strain-.001)<1e-10);assert(Math.abs(wh.r2-1)<1e-10);
  assert.equal(evalJS('williamsonHall([{peak:40,correctedDeg:1}],.89,1.540598).D_nm'),null);
  assert.equal(evalJS('williamsonHall([40,60,80].map(peak=>({peak,correctedDeg:(.02-.001*4*Math.sin(peak*Math.PI/360))/Math.cos(peak*Math.PI/360)*180/Math.PI})),.89,1.540598).D_nm'),null);
 }
 assert.equal(doc.getElementById('exportJSON').disabled,false);
 doc.getElementById('exportJSON').click();doc.getElementById('exportCSV').click();
 const input=doc.querySelector('input[type=number]');input.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(evalJS('state.analysis'),null);assert.equal(doc.getElementById('exportCSV').disabled,true);
 console.log(`${tool}: parsing, analytic metrics, constraints, exports and invalidation passed`);
 dom.window.close();
}

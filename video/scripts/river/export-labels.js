const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:480,height:270}});p.on('pageerror',e=>console.log('err',e.message));
await p.goto('http://localhost:8765/flow.html?w=480');await p.waitForFunction('window.ready',null,{timeout:180000});
const meta=await p.evaluate('window.labelsMeta()');const frames=[];
for(let k=0;k<2508;k++){frames.push(await p.evaluate(F=>window.labelsAt(F),k/3))}
fs.writeFileSync('g3/flowLabels.json',JSON.stringify({labels:meta,frames}));console.log('labels',meta.length,'frames',frames.length);await b.close()})()

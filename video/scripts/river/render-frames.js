const {chromium}=require('playwright');const fs=require('fs');
const [,, from, to, w='1920', out='g3/f2']=process.argv;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:+w,height:Math.round(+w*9/16)}});p.on('pageerror',e=>console.log('err',e.message));p.on('console',m=>{if(m.type()==='error')console.log('c:',m.text())});
await p.goto('http://localhost:8765/river2.html?w='+w);await p.waitForFunction('window.ready',null,{timeout:180000});
fs.mkdirSync(out,{recursive:true});const t0=Date.now();
for(let F=+from;F<+to;F+=(process.env.STEP?+process.env.STEP:1)){const f=`${out}/${String(F).padStart(4,'0')}.jpg`;if(fs.existsSync(f))continue;const u=await p.evaluate(t=>window.frame(t),F);fs.writeFileSync(f,Buffer.from(u.split(',')[1],'base64'));if(F%20==0)console.log(F,((Date.now()-t0)/1000).toFixed(0)+'s')}
console.log('done');await b.close()})()

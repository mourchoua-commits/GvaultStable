import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const URL=process.env.DUAL_CORE_BLOB_URL||'http://127.0.0.1:4173/alpha/dual-core-blob/';
const browser=await chromium.launch({headless:true});
const errors=[];
const profiles=[
  {id:'mobile',opts:{viewport:{width:360,height:663},deviceScaleFactor:3,isMobile:true,hasTouch:true}},
  {id:'desktop',opts:{viewport:{width:1365,height:768},deviceScaleFactor:1,isMobile:false,hasTouch:false}}
];
const runs=[];
try{
  for(const profile of profiles){
    const context=await browser.newContext(profile.opts);
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(`${profile.id}: pageerror: ${String(e.message||e)}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`${profile.id}: console: ${m.text()}`)});
    await page.goto(URL,{waitUntil:'domcontentloaded'});
    const probe=await page.evaluate(()=>window.GVaultDualCoreBlob?.probe());
    if(probe?.schema!=='GVAULT_PUBLIC_DUAL_CORE_BLOB_V1')throw new Error(`${profile.id}: schema missing`);
    if(!probe.blobWorkerSupported||probe.privateData!==false||probe.externalWrites!=='NONE')throw new Error(`${profile.id}: public safety contract failed`);
    await page.getByRole('button',{name:/LANCER MATRICE/}).click();
    await page.waitForFunction(()=>window.GVaultDualCoreBlob?.report()?.pass===true,null,{timeout:30000});
    const report=await page.evaluate(()=>window.GVaultDualCoreBlob.report());
    if(report.mode!=='FULL_BUDGET_SIMULATION'||report.artificialThrottle!==false)throw new Error(`${profile.id}: full-budget mode missing`);
    if(report.dualReady!==report.totalIterations)throw new Error(`${profile.id}: cross-core gap ${report.dualReady}/${report.totalIterations}`);
    if(report.scenarios.length!==5||!report.scenarios.every(x=>x.pass))throw new Error(`${profile.id}: scenario failure`);
    await fs.mkdir('alpha/dual-core-blob/qa',{recursive:true});
    await page.screenshot({path:`alpha/dual-core-blob/qa/${profile.id}.png`,fullPage:true});
    runs.push({profile:profile.id,probe,report});
    await context.close();
  }
  const totalIterations=runs.reduce((a,x)=>a+x.report.totalIterations,0);
  const totalDualReady=runs.reduce((a,x)=>a+x.report.dualReady,0);
  const recoveries=runs.reduce((a,x)=>a+x.report.recoveries,0);
  const out={schema:'GVAULT_PUBLIC_DUAL_CORE_BLOB_PLAYWRIGHT_QA_V1',at:new Date().toISOString(),url:URL,profiles:runs.map(x=>x.profile),runs,totalIterations,totalDualReady,recoveries,consoleErrors:errors,publicOnly:true,privateData:false,externalWrites:'NONE',canonicalMutation:false,pass:errors.length===0&&totalIterations===totalDualReady&&runs.every(x=>x.report.pass)};
  await fs.writeFile('alpha/dual-core-blob/qa/latest.json',JSON.stringify(out,null,2));
  console.log(JSON.stringify({schema:out.schema,pass:out.pass,totalIterations,totalDualReady,recoveries,profiles:out.profiles}));
  if(!out.pass)throw new Error('PUBLIC_DUAL_CORE_BLOB_QA_FAILED');
}finally{await browser.close()}

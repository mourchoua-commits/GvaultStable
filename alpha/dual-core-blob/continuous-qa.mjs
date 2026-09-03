import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const URL=process.env.CONTINUOUS_DUAL_CORE_URL||'http://127.0.0.1:4173/alpha/dual-core-blob/continuous.html';
const browser=await chromium.launch({headless:true});
const consoleErrors=[];const lateRequests=[];
try{
  const context=await browser.newContext({viewport:{width:360,height:663},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const page=await context.newPage();let armed=false;
  page.on('pageerror',e=>consoleErrors.push('pageerror: '+String(e.message||e)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push('console: '+m.text())});
  page.on('request',r=>{if(armed)lateRequests.push(r.url())});
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.GVaultContinuousDualCore?.probe()?.schema==='GVAULT_PUBLIC_DUAL_CORE_CONTINUOUS_V1',null,{timeout:10000});
  await page.waitForTimeout(100);armed=true;
  const probe=await page.evaluate(()=>window.GVaultContinuousDualCore?.probe());
  if(probe?.schema!=='GVAULT_PUBLIC_DUAL_CORE_CONTINUOUS_V1'||probe.mode!=='RUN_UNTIL_STOPPED'||probe.autoStart!==true)throw new Error('continuous contract missing');
  if(probe.artificialThrottle!==false||probe.boundedHistory!==64||probe.networkAfterLoad!=='NONE'||probe.privateData!==false||probe.externalWrites!=='NONE'||probe.canonicalMutation!==false)throw new Error('continuous safety contract failed');
  await page.waitForFunction(()=>{const r=window.GVaultContinuousDualCore?.report();return r?.running===true&&r.cycles>=40&&r.familiesSeen?.length===12&&r.restarts>=1},null,{timeout:30000});
  const a=await page.evaluate(()=>window.GVaultContinuousDualCore.report());
  await page.waitForTimeout(2500);
  const b=await page.evaluate(()=>window.GVaultContinuousDualCore.report());
  await page.waitForTimeout(2500);
  const c=await page.evaluate(()=>window.GVaultContinuousDualCore.report());
  const unexpected=(c.errors||[]).filter(x=>x.kind!=='WORKER_RECOVERY');
  const sustained=a.running&&b.running&&c.running&&b.cycles>a.cycles&&c.cycles>b.cycles&&c.dualReady===c.totalIterations&&c.egressRejects===c.cycles&&c.familiesSeen.length===12&&c.history.length<=64&&c.restarts>=1&&unexpected.length===0&&lateRequests.length===0&&consoleErrors.length===0;
  await page.evaluate(()=>window.GVaultContinuousDualCore.stop());
  const stopped1=await page.evaluate(()=>window.GVaultContinuousDualCore.report());
  await page.waitForTimeout(350);
  const stopped2=await page.evaluate(()=>window.GVaultContinuousDualCore.report());
  const manualStopWorks=stopped1.running===false&&stopped2.running===false&&stopped2.cycles===stopped1.cycles;
  await fs.mkdir('alpha/dual-core-blob/qa',{recursive:true});
  await page.screenshot({path:'alpha/dual-core-blob/qa/continuous.png',fullPage:true});
  const out={schema:'GVAULT_PUBLIC_DUAL_CORE_CONTINUOUS_PLAYWRIGHT_QA_V1',at:new Date().toISOString(),probe,samples:[a,b,c].map(x=>({cycles:x.cycles,totalIterations:x.totalIterations,dualReady:x.dualReady,proofRecoveries:x.proofRecoveries,restarts:x.restarts,egressRejects:x.egressRejects,familiesSeen:x.familiesSeen,lastFamily:x.lastFamily,historyLength:x.history.length,running:x.running})),unexpectedErrors:unexpected,consoleErrors,lateNetworkRequests:lateRequests.length,manualStopWorks,pass:sustained&&manualStopWorks};
  await fs.writeFile('alpha/dual-core-blob/qa/continuous-latest.json',JSON.stringify(out,null,2));
  console.log(JSON.stringify({schema:out.schema,pass:out.pass,cycles:c.cycles,totalIterations:c.totalIterations,dualReady:c.dualReady,restarts:c.restarts,proofRecoveries:c.proofRecoveries,egressRejects:c.egressRejects,familiesSeen:c.familiesSeen.length,lateNetworkRequests:out.lateNetworkRequests,consoleErrors:out.consoleErrors.length,manualStopWorks}));
  if(!out.pass)throw new Error('CONTINUOUS_DUAL_CORE_QA_FAILED');
  await context.close();
}finally{await browser.close()}

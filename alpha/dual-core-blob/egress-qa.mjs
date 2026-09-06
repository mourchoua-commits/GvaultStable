import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const URL=process.env.SOFT_EGRESS_URL||'http://127.0.0.1:4173/alpha/dual-core-blob/outward.html';
const browser=await chromium.launch({headless:true});
const errors=[];const lateRequests=[];
try{
 const page=await browser.newPage({viewport:{width:360,height:663}});
 let armed=false;
 page.on('pageerror',e=>errors.push(String(e.message||e)));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('request',r=>{if(armed)lateRequests.push(r.url())});
 await page.goto(URL,{waitUntil:'networkidle'});armed=true;
 const result=await page.evaluate(async()=>{
  const api=window.GVaultSoftEgress;if(!api)throw new Error('SOFT_EGRESS_API_MISSING');
  const probe=api.probe();
  const cases=[
   'MARKER_ALPHA_7314',{x:'MARKER_BETA_9182'},['MARKER_GAMMA_6841'],42,true,false,null,
   {nested:{value:'MARKER_DELTA_4732'}},'x'.repeat(32768),{url:'https://example.invalid/MARKER_URL'},
   {tokenLike:'sk-test-MARKER_TOKEN_NOT_REAL'},{mode:'PROFILE_FIELD',trace:'MARKER_TRACE'},
   {core1:{ready:1},core2:{ready:1},private:false},new Date(0).toISOString(),['α','β','γ','MARKER_UNICODE']
  ];
  const rows=[];
  for(const input of cases){
   let response,threw=false;try{response=api.send(input)}catch(e){threw=true;response={error:String(e)}}
   const text=JSON.stringify(response);
   const leaked=['MARKER_','sk-test-','PROFILE_FIELD'].some(x=>text.includes(x));
   const keys=Object.keys(response||{}).sort().join(',');
   rows.push({threw,leaked,keys,status:response?.status,allowed:response?.allowed,publicMessage:response?.publicMessage});
  }
  return {probe,rows};
 });
 await page.waitForTimeout(100);
 const expectedKeys='allowed,publicMessage,status';
 const pass=result.probe?.policy==='SOFT_DENY_ALL_INTERNAL_CONTENT'&&result.probe?.throwsOnReject===false&&result.probe?.outwardRawPayload===false&&result.probe?.outwardDerivedPayload===false&&result.probe?.outwardHash===false&&result.probe?.outwardSize===false&&result.rows.every(r=>!r.threw&&!r.leaked&&r.keys===expectedKeys&&r.allowed===false&&r.status==='SOFT_EGRESS_REJECT'&&r.publicMessage==='INDISPONIBLE_SUR_CETTE_SURFACE')&&lateRequests.length===0&&errors.length===0;
 const out={schema:'GVAULT_PUBLIC_SOFT_EGRESS_PLAYWRIGHT_QA_V1',at:new Date().toISOString(),cases:result.rows.length,rejected:result.rows.filter(r=>r.allowed===false).length,leaks:result.rows.filter(r=>r.leaked).length,throws:result.rows.filter(r=>r.threw).length,lateNetworkRequests:lateRequests.length,consoleErrors:errors,probe:result.probe,pass};
 await fs.mkdir('alpha/dual-core-blob/qa',{recursive:true});
 await fs.writeFile('alpha/dual-core-blob/qa/egress-latest.json',JSON.stringify(out,null,2));
 await page.screenshot({path:'alpha/dual-core-blob/qa/egress.png',fullPage:true});
 console.log(JSON.stringify(out));if(!pass)throw new Error('SOFT_EGRESS_QA_FAILED');
}finally{await browser.close()}

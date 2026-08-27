import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const URL=process.env.BUTTON_LAB_URL||'http://127.0.0.1:4173/alpha/button-lab/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:360,height:663},deviceScaleFactor:3,isMobile:true,hasTouch:true,acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
const smoke=[];
function rec(label,ok,detail=''){smoke.push({label,ok,detail});if(!ok)console.error('FAIL',label,detail);else console.log('PASS',label,detail)}
async function button(name){return page.getByRole('button',{name}).first()}
async function clickExpect(name,kind){const b=await button(name);await b.click();await page.waitForTimeout(40);const eff=await page.evaluate(()=>window.__GVAULT_QA_LAST_EFFECT__);const ok=eff?.kind===kind;rec(name,ok,`expected=${kind} got=${eff?.kind||'none'}`);if(!ok)throw new Error(`${name}: expected ${kind}, got ${eff?.kind||'none'}`)}

try{
 await page.goto(URL,{waitUntil:'domcontentloaded'});
 const contract=await page.evaluate(()=>window.GVaultButtonLab?.schema);if(contract!=='GVAULT_BUTTON_LAB_NOSAS_V1')throw new Error('Button Lab contract missing');
 rec('NO SAS bootstrap',true,contract);
 const auto=await page.evaluate(()=>window.GVaultButtonLab.runAudit());rec('Internal declared-effect audit',auto.broken===0,`${auto.total} controls · ${auto.broken} broken`);if(auto.broken)throw new Error('Internal audit reports broken controls');
 await page.evaluate(()=>document.querySelector('#auditPanel')?.classList.remove('open'));

 await clickExpect(/^☷ SYSTÈME$/,'view');
 await clickExpect(/ACTUALISER/,'state');
 await clickExpect(/CHECK-UP/,'state');
 for(const label of [/ZIP COMPLET/,/PACK COMPLET/]){const dl=page.waitForEvent('download');await (await button(label)).click();const d=await dl;rec(String(label),!!d.suggestedFilename(),d.suggestedFilename())}
 await clickExpect(/MAJ \+ DÉCOUVERTE/,'dialog');await clickExpect(/^×$/,'dialog');
 await clickExpect(/RAPPORT DE BUG/,'dialog');
 await clickExpect(/TRACE 2 MIN/,'state');await clickExpect(/STOP \+ CAPTURE/,'state');await clickExpect(/^GÉNÉRER$/,'state');
 {const dl=page.waitForEvent('download');await (await button(/^TÉLÉCHARGER$/)).click();const d=await dl;rec('Bug report download',!!d.suggestedFilename(),d.suggestedFilename())}
 await clickExpect(/^×$/,'dialog');
 for(const x of [/JEUX · 11/,/MODULES · 6/,/OUTILS · 75/,/QA · 19/])await clickExpect(x,'state');
 await clickExpect(/← VAULT/,'view');

 await clickExpect(/^▦ PROJETS$/,'view');
 const chooser=page.waitForEvent('filechooser');await (await button(/IMPORTER/)).click();const fc=await chooser;await fc.setFiles({name:'button-lab-fixture.html',mimeType:'text/html',buffer:Buffer.from('<!doctype html><title>QA</title>')});await page.waitForTimeout(40);const imported=await page.locator('#projectList').getByText(/button-lab-fixture/i).count();rec('Project file import',imported>0,`matches=${imported}`);if(!imported)throw new Error('Project import fixture missing');
 await clickExpect(/← VAULT/,'view');

 await clickExpect(/OUVRIR CONCEPTEUR/,'view');await clickExpect(/CRÉER UN ÉCRAN/,'state');await clickExpect(/PRÉVISUALISER/,'dialog');await clickExpect(/^×$/,'dialog');await clickExpect(/← VAULT/,'view');
 await clickExpect(/MIRROR AUDIT LAB/,'view');await clickExpect(/LANCER SCAN/,'state');await clickExpect(/← VAULT/,'view');
 await clickExpect(/PROFILE LAB/,'view');await clickExpect(/NOUVEAU PROFIL QA/,'state');await clickExpect(/← VAULT/,'view');
 await clickExpect(/ÉTAT ACTUEL \/ MAJ/,'view');await clickExpect(/RECALCULER ÉTAT QA/,'state');await clickExpect(/← VAULT/,'view');
 await clickExpect(/SYNCHRO CHATGPT/,'isolated');const iso=await page.locator('#modalBody').getByText(/BACKEND ISOLÉ/).count();rec('Private backend isolation',iso>0,`matches=${iso}`);if(!iso)throw new Error('Backend isolation notice absent');await clickExpect(/^×$/,'dialog');
 await clickExpect(/FICHIERS VAULT/,'view');await clickExpect(/CRÉER FICHIER QA/,'state');await clickExpect(/EFFACER SANDBOX QA/,'state');await clickExpect(/← VAULT/,'view');
 await clickExpect(/GAME FORGE/,'view');await clickExpect(/GÉNÉRER PROMPT QA/,'state');await clickExpect(/← VAULT/,'view');
 await clickExpect(/ASSISTANT CONFIG/,'view');await clickExpect(/ENREGISTRER CONFIG QA/,'state');await clickExpect(/← VAULT/,'view');
 await clickExpect(/GRID STUDIO/,'view');await clickExpect(/DÉPLACER BLOC QA/,'state');await clickExpect(/RÉINITIALISER GRID QA/,'state');await clickExpect(/← VAULT/,'view');

 const report=await page.evaluate(()=>window.GVaultButtonLab.report());
 const out={schema:'GVAULT_BUTTON_LAB_BROWSER_QA_V1',at:new Date().toISOString(),url:URL,noSas:true,privateData:false,consoleErrors:errors,internal:report,smoke,pass:errors.length===0&&smoke.every(x=>x.ok)&&report?.broken===0};
 await fs.mkdir('alpha/button-lab/qa',{recursive:true});await fs.writeFile('alpha/button-lab/qa/latest.json',JSON.stringify(out,null,2));
 if(!out.pass)throw new Error('Button Lab browser QA failed');
}finally{await browser.close()}

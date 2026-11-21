from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text().replace('<script src="catalogue.js"></script>','<script>'+(ROOT/'catalogue.js').read_text()+'</script>')
MOCK='''() => {
 window.__HADOCK_TEST_WORKER_FACTORY__ = () => {
   const callbacks = {};
   let terminated=false;
   const emit=(m)=>{if(!terminated)(callbacks.message||[]).forEach(f=>f({data:m}));};
   return {addEventListener(t,cb){(callbacks[t]||= []).push(cb)},
     postMessage(m){if(m.type==='init'){
       setTimeout(()=>emit({type:'progress',stage:'chargement SmolLM2 simulé',percent:40}),5);
       setTimeout(()=>emit({type:'ready',model:'SmolLM2 135M Instruct'}),85);
     }else if(m.type==='generate'){
       setTimeout(()=>emit({type:'delta',id:m.id,text:'Réponse ',full:'Réponse '}),25);
       setTimeout(()=>emit({type:'delta',id:m.id,text:'IA locale.',full:'Réponse IA locale.'}),60);
       setTimeout(()=>emit({type:'done',id:m.id,text:'Réponse IA locale.'}),80);
     }},terminate(){terminated=true}};
   };
 }'''
checks=[]
def check(c,l):checks.append(bool(c));print(('PASS' if c else 'FAIL'),l,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox'])
 for mobile in [False,True]:
  name='mobile' if mobile else 'desktop'
  ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':800},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errs=[];out=[];page.on('pageerror',lambda e:errs.append(str(e)));page.on('request',lambda r:out.append(r.url))
  page.goto('about:blank');page.evaluate('window.__memory={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>window.__memory[k]??null,setItem:(k,v)=>window.__memory[k]=v,removeItem:k=>delete window.__memory[k]}})')
  page.evaluate(MOCK)
  page.set_content(HTML,wait_until='domcontentloaded')
  check(page.locator('#provider').input_value()=='free',name+' modèle local par défaut')
  check(page.locator('#prompt').is_visible(),name+' champ de chat visible')
  page.locator('#prompt').fill('Bonjour !')
  page.locator('#send').click()
  check(page.locator('.message.user').count()==1,name+' réception immédiate')
  page.wait_for_function('document.querySelector("#thread")?.textContent?.includes("Réponse IA locale.")',timeout=6000)
  check(page.locator('.message.assistant').count()==1,name+' réponse Worker reçue')
  check(not page.locator('#settings').evaluate('(x)=>x.classList.contains("open")'),name+' aucun assistant de configuration')
  check(len(out)==0,name+' aucun appel réseau')
  check('sk-' not in str(page.evaluate('Object.values(window.__memory)')),name+' aucun secret enregistré')
  page.set_content(HTML,wait_until='domcontentloaded')
  check('Réponse IA locale.' in page.locator('#thread').inner_text(),name+' historique restauré')
  check(not errs,name+' aucune erreur JS '+str(errs))
  ctx.close()
 browser.close()
print('TOTAL',sum(checks),'PASS',len(checks)-sum(checks),'FAIL');raise SystemExit(0 if all(checks) else 1)
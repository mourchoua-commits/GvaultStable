from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text().replace('<script src="catalogue.js"></script>','<script>'+(ROOT/'catalogue.js').read_text()+'</script>')
MOCK='''() => {
 window.__HADOCK_TEST_WORKER_FACTORY__=()=>{
  const cb={};let gone=false;const emit=o=>{if(!gone)(cb.message||[]).forEach(f=>f({data:o}))};
  return {addEventListener(t,f){(cb[t]||=[]).push(f)},postMessage(m){
   if(m.type==='init')setTimeout(()=>emit({type:'ready',model:'SmolLM2 135M Instruct'}),20);
   else if(m.type==='generate')setTimeout(()=>emit({type:'done',id:m.id,text:'Je suis un modèle local.'}),30);
  },terminate(){gone=true}};
 };
}'''
checks=[]
def ck(k,v):checks.append((k,bool(v)));print(('PASS' if v else 'FAIL'),k,flush=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox'])
 for mobile in [False,True]:
  label='mobile' if mobile else 'desktop'
  ctx=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':800},is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
  page.goto('about:blank')
  page.evaluate('window.__store={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>window.__store[k]||null,setItem:(k,v)=>window.__store[k]=v,removeItem:k=>delete window.__store[k]}})')
  page.evaluate(MOCK)
  page.set_content(HTML,wait_until='domcontentloaded')
  ck(label+' mode gratuit par défaut',page.locator('#provider').input_value()=='free')
  ck(label+' pas de cloud par défaut',page.evaluate('window.__store["apiKey"]') is None)
  page.locator('#prompt').fill('Salut')
  page.locator('#send').click()
  page.wait_for_function("document.querySelector('#thread')?.textContent?.includes('Je suis un modèle local.')",timeout=5000)
  ck(label+' génération locale sans configuration',page.locator('.message.assistant').count()==1)
  ck(label+' pas de fenêtre réglages forcée','open' not in (page.locator('#settings').get_attribute('class') or '').split())
  # Cloud remains explicitly optional, and its secret must never persist.
  page.locator('#openSettings').click();page.locator('#freeKey').fill('TEST_EPHEMERAL_TOKEN');page.locator('#freeCloudButton').click()
  ck(label+' sélection cloud volontaire','Nemotron' in page.locator('#freeReady').inner_text())
  page.locator('#closeSettings').click()
  page.evaluate('''()=>{window.__cloudCalls=[];window.fetch=async (url,opts)=>{
    window.__cloudCalls.push({url,headers:opts.headers,model:JSON.parse(opts.body).model});
    return new Response(JSON.stringify({choices:[{message:{content:'Réponse du cloud simulé.'}}]}),{status:200,headers:{'content-type':'application/json'}})} }''')
  page.locator('#prompt').fill('Question avec Nemotron');page.locator('#send').click()
  page.wait_for_function("document.querySelector('#thread')?.textContent?.includes('Réponse du cloud simulé.')",timeout=5000)
  v=page.evaluate('window.__cloudCalls[0]')
  ck(label+' bon modèle distant',v['model']=='nvidia/nemotron-3-ultra-550b-a55b:free')
  ck(label+' clé éphémère transmise seulement après sélection',v['headers']['Authorization']=='Bearer TEST_EPHEMERAL_TOKEN')
  ck(label+' clé absente du stockage','TEST_EPHEMERAL_TOKEN' not in str(page.evaluate('Object.values(window.__store)')))
  ck(label+' aucune erreur JS',not errors)
  ctx.close()
 browser.close()
print('TOTAL',sum(v for _,v in checks),'PASS',sum(not v for _,v in checks),'FAIL');raise SystemExit(0 if all(v for _,v in checks) else 1)
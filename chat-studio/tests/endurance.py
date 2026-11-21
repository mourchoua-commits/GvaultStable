from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,traceback

src=Path(__file__).resolve().parents[1].joinpath('index.html').read_text()
cat=Path(__file__).resolve().parents[1].joinpath('catalogue.js').read_text()
assert '<script src="catalogue.js"></script>' in src
src=src.replace('<script src="catalogue.js"></script>','<script>'+cat+'</script>')
results=[]
def check(ok,name,details=''):
    results.append({'ok':bool(ok),'name':name,'details':details})
    if not ok: print('FAIL',name,details)
    else: print('PASS',name,details)

def make_page(browser,viewport):
    ctx=browser.new_context(viewport=viewport,device_scale_factor=1)
    page=ctx.new_page();errs=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content('<!doctype html><title>init</title>')
    page.evaluate('''() => {let map=window.__mockStore=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{setItem(k,v){map.set(k,String(v))},getItem(k){return map.get(k)||null},removeItem(k){map.delete(k)}}})}''')
    page.set_content(src,wait_until='domcontentloaded')
    return ctx,page,errs

def stress_local(page,count):
    return page.evaluate('''async count=>{const send=document.getElementById('send');const prompt=document.getElementById('prompt');const t=performance.now();let errors=0;for(let i=0;i<count;i++){prompt.value=i%3===0?'Bonjour '+i:i%3===1?'Quelles capacités possède HADOCK ?':'Comment tester Playwright ?';send.click();for(let z=0;z<500&&send.disabled;z++)await new Promise(r=>setTimeout(r,1));if(send.disabled)errors++}return {elapsed:Math.round(performance.now()-t),errors,history:JSON.parse(localStorage.getItem('gvault-stable.chat-studio.v1'))?.chats?.at(-1)?.messages?.length,dom:document.querySelectorAll('#thread .message').length}}''',count)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,viewport in [('desktop',{'width':1280,'height':860}),('mobile',{'width':390,'height':840})]:
        print('\n===',label,'===')
        ctx,page,errs=make_page(browser,viewport)
        check(page.locator('#depth').input_value()=='deep',label+' profondeur initiale approfondie')
        check(page.locator('#thread').is_visible(),label+' interface de chat visible')
        check(page.locator('#provider').input_value()=='local',label+' local prêt')
        count=130 if label=='desktop' else 80
        stress=stress_local(page,count)
        check(stress['errors']==0,label+' messages en rafale '+str(count),str(stress))
        check(stress['history']==50,label+' borne mémoire 50 messages',str(stress['history']))
        check(page.locator('#generationBar').is_hidden(),label+' pas de génération fantôme')
        page.locator('#prompt').fill('Comment répondre rapidement tout en réfléchissant ?')
        page.locator('#send').click()
        page.wait_for_function("!document.getElementById('send').disabled",timeout=2500)
        check('Ton message s’affiche dès l’envoi' in page.locator('#thread').inner_text(),label+' réponse locale liée au tempo, sans faux positif API')

        # reset and switch new chat
        page.locator('#newChat').evaluate('(el)=>el.click()')
        check(page.locator('#thread .welcome').is_visible(),label+' nouvelle discussion préserve ancienne')
        # selftest isolated
        page.locator('#runEnduranceSelftest').evaluate('(el)=>el.click()')
        check('10000 messages' in page.locator('#enduranceSelftestResult').inner_text(),label+' auto-test interne 200 cycles')
        if label=='mobile':
            # testing responsive; no horizontal page overflow
            over=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
            check(not over,'mobile sans débordement horizontal',str(over))
        # chat streaming with 7 tokens, stream supports long duration
        page.evaluate('''() => {window.__requests=[];window.fetch=(url,opts)=>{
          const req=JSON.parse(opts.body);window.__requests.push({url,req});
          const encoder=new TextEncoder();let ctrl=null,aborted=false;
          const stream=new ReadableStream({start(controller){ctrl=controller;
            opts.signal?.addEventListener('abort',()=>{aborted=true;try{controller.error(new DOMException('Aborted','AbortError'))}catch{}},{once:true});
            let n=0;const tokens=['Salut ','voici ','une ','réponse ','approfondie ','sur ','HADOCK.'];
            const next=()=>{if(aborted)return;if(n===tokens.length){controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));controller.close();return}
             const body=JSON.stringify({choices:[{delta:{content:tokens[n++]}}]});controller.enqueue(encoder.encode('data: '+body+'\\n\\n'));setTimeout(next,24)};setTimeout(next,40);
          }});return Promise.resolve(new Response(stream,{status:200,headers:{'Content-Type':'text/event-stream'}}));
        }}''')
        page.locator('#provider').select_option('bridge')
        page.locator('#bridgeUrl').evaluate("(el)=>{el.value='https://example.test/v1/chat/completions';el.dispatchEvent(new Event('input',{bubbles:true}))}")
        page.locator('#bridgeModel').evaluate("(el)=>{el.value='test-studio';el.dispatchEvent(new Event('input',{bubbles:true}))}")
        page.locator('#prompt').fill('Explique un long projet')
        page.evaluate('''() => {window.__sendAt=performance.now();window.__firstVisibleAt=null;
          const thread=document.querySelector('#thread');
          const observer=new MutationObserver(()=>{if(window.__firstVisibleAt!==null)return;
            if(thread.querySelector('.message.pending .bubble')?.textContent?.includes('Salut')){
              window.__firstVisibleAt=performance.now();observer.disconnect();
            }});
          observer.observe(thread,{childList:true,subtree:true,characterData:true});
          document.getElementById('send').click();window.__ackAt=performance.now();}''')
        check(page.locator('#generationBar').is_visible(),label+' accusé immédiat',str(round(page.evaluate('window.__ackAt-window.__sendAt')))+' ms internes')
        page.wait_for_function("window.__firstVisibleAt!==null",timeout=2500)
        elapsed=round(page.evaluate('window.__firstVisibleAt-window.__sendAt'))
        check(elapsed<1000,label+' premier fragment précoce (mesure interne)',str(elapsed)+' ms')
        # change conversation mid-stream
        old_title='Explique un long projet'
        page.locator('#newChat').evaluate('(el)=>el.click()')
        page.wait_for_function("!document.getElementById('send').disabled",timeout=2500)
        check(page.locator('#thread .welcome').is_visible(),label+' flux attribué à la discussion source')
        page.locator('#chatList .chatrow').filter(has_text=old_title).first.evaluate('(el)=>el.click()')
        check('Salut voici une réponse approfondie sur HADOCK.' in page.locator('#thread').inner_text(),label+' texte reçu au bon endroit')
        req=page.evaluate('window.__requests.at(-1)')
        check(req['req']['max_tokens']==3500 and req['req']['stream'] is True,label+' approfondi budget 3500 et flux SSE',str(req['req']['max_tokens']))
        page.evaluate('''() => {window.fetch=(url,opts)=>Promise.resolve(new Response(JSON.stringify({choices:[{message:{content:'Réponse en JSON sans streaming'}}]}),{status:200,headers:{'Content-Type':'application/json'}}))}''')
        page.locator('#prompt').fill('Réponse non streaming')
        page.locator('#send').click()
        page.wait_for_function("!document.getElementById('send').disabled",timeout=2500)
        check('Réponse en JSON sans streaming' in page.locator('#thread').inner_text(),label+' compatibilité fournisseur JSON classique')
        page.locator('#provider').select_option('ollama')
        page.locator('#ollamaUrl').evaluate("(el)=>{el.value='https://example.test/api/chat';el.dispatchEvent(new Event('input',{bubbles:true}))}")
        page.locator('#ollamaModel').evaluate("(el)=>{el.value='model-test';el.dispatchEvent(new Event('input',{bubbles:true}))}")
        page.evaluate('''() => {window.fetch=(url,opts)=>{const e=new TextEncoder(),payloads=['Ollama ','parle ','en direct'];const data=payloads.map(t=>JSON.stringify({message:{content:t},done:false})+'\\n').join('')+JSON.stringify({done:true})+'\\n';const stream=new ReadableStream({start(controller){controller.enqueue(e.encode(data));controller.close()}});return Promise.resolve(new Response(stream,{headers:{'Content-Type':'application/x-ndjson'}}))}}''')
        page.locator('#prompt').fill('Test Ollama flux')
        page.locator('#send').click()
        page.wait_for_function("!document.getElementById('send').disabled",timeout=2500)
        check('Ollama parle en direct' in page.locator('#thread').inner_text(),label+' flux Ollama NDJSON')
        page.locator('#provider').select_option('bridge')

        # cancellation during a long stream; partial must be preserved
        page.evaluate('''()=>{window.fetch=(url,opts)=>{const encoder=new TextEncoder();const stream=new ReadableStream({start(ctrl){let live=true;opts.signal.addEventListener('abort',()=>{live=false;try{ctrl.error(new DOMException('Aborted','AbortError'))}catch{}},{once:true});let i=0;const step=()=>{if(!live)return;ctrl.enqueue(encoder.encode('data: '+JSON.stringify({choices:[{delta:{content:'mot'+i+' '}}]})+'\\n\\n'));i++;setTimeout(step,70)};setTimeout(step,25)}});return Promise.resolve(new Response(stream,{headers:{'Content-Type':'text/event-stream'}}))}}''')
        page.locator('#prompt').fill('Réponse à interrompre')
        page.locator('#send').click()
        page.wait_for_function("document.querySelector('.message.pending .bubble')?.textContent?.includes('mot0')",timeout=2500)
        page.locator('#stopGeneration').click()
        page.wait_for_function("!document.getElementById('send').disabled",timeout=2500)
        check('Réponse interrompue' in page.locator('#thread').inner_text(),label+' Stop conserve le texte partiel')
        # test network fail graceful; immediately abort
        page.evaluate("() => {window.fetch=()=>Promise.reject(new TypeError('Failed to fetch')); return true}")
        page.locator('#prompt').fill('Test panne reseau')
        page.locator('#send').click()
        page.wait_for_function("!document.getElementById('send').disabled",timeout=2500)
        check('Connexion indisponible' in page.locator('#thread').inner_text(),label+' réseau indisponible explicite')
        # no secrets persisted in localStorage. Fake token typed to key DOM, saved not included
        page.locator('#openrouterKey').evaluate("(el)=>{el.value='sk-test-token-secret';el.dispatchEvent(new Event('input',{bubbles:true}))}")
        snapshot=page.evaluate("localStorage.getItem('gvault-stable.chat-studio.v1')")
        check('sk-test-token-secret' not in snapshot,label+' secret absent sauvegarde')
        check(not errs,label+' aucune erreur JavaScript',str(errs[:4]))
        # restart app from same page context storage
        page.set_content(src,wait_until='domcontentloaded')
        check(page.locator('#chatList .chatrow').count()>=2,label+' restauration historique après rechargement')
        check(page.locator('#depth').input_value()=='deep',label+' profondeur persistée')
        ctx.close()
    browser.close()

summary={'passed':sum(x['ok'] for x in results),'failed':sum(not x['ok'] for x in results),'checks':results}
report=Path(__file__).resolve().parent.joinpath('reports','endurance-results.json'); report.parent.mkdir(parents=True,exist_ok=True); report.write_text(json.dumps(summary,ensure_ascii=False,indent=2)); print('Report:',report)
print('\nTOTAL',summary['passed'],'PASS',summary['failed'],'FAIL')
if summary['failed']:raise SystemExit(1)
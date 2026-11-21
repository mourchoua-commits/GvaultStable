from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text()
catalog=(ROOT/'catalogue.js').read_text()
checks=[]
def check(ok,label):
    checks.append((bool(ok),label));print(('PASS' if ok else 'FAIL'),label)
def launch(browser,mobile=False):
    context=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1280,'height':800},is_mobile=mobile,has_touch=mobile)
    page=context.new_page();errors=[];api=[];network=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def route_handler(route):
        req=route.request
        if req.url.endswith('/chat-studio/'):
            route.fulfill(status=200,body=html,content_type='text/html')
        elif req.url.endswith('/chat-studio/catalogue.js'):
            route.fulfill(status=200,body=catalog,content_type='text/javascript')
        elif req.url.startswith('https://openrouter.ai/api/v1/chat/completions'):
            data=json.loads(req.post_data or '{}');api.append({'model':data.get('model'),'key':req.headers.get('authorization'),'content':data.get('messages',[])[-1]});
            route.fulfill(status=200,headers={'Content-Type':'text/event-stream','Access-Control-Allow-Origin':'*'},body='data: '+json.dumps({'choices':[{'delta':{'content':'Bonjour gratuit !'}}]})+'\n\ndata: [DONE]\n\n')
        else:
            network.append(req.url)
            route.abort()
    page.route('**/*',route_handler)
    page.add_init_script('window.__stored={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>window.__stored[k]||null,setItem:(k,v)=>window.__stored[k]=v,removeItem:k=>delete window.__stored[k]}})')
    page.goto('about:blank')
    page.evaluate('window.__stored={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>window.__stored[k]||null,setItem:(k,v)=>window.__stored[k]=v,removeItem:k=>delete window.__stored[k]}})')
    page.set_content(html.replace('<script src="catalogue.js"></script>','<script>'+catalog+'</script>'))
    return context,page,errors,api,network
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--disable-dev-shm-usage','--no-sandbox'])
    for mobile in [False,True]:
      label='mobile' if mobile else 'desktop'
      context,page,errors,api,network=launch(browser,mobile)
      check(page.locator('#provider').input_value()=='free',label+' default free')
      check('Nemotron' in page.locator('#provider').inner_text(),label+' model option')
      check(not api,label+' no outgoing on load')
      page.locator('#prompt').fill('Dis-moi bonjour')
      page.locator('#send').click()
      check(page.locator('#settings.open').is_visible(),label+' activation required')
      check(page.locator('#prompt').input_value()=='Dis-moi bonjour',label+' no lost draft while inactive')
      check(not api,label+' no call before opt-in')
      page.locator('#freeKey').fill('sk-or-test-secret')
      page.locator('#freeCloudButton').click()
      check('Nemotron' in page.locator('#freeReady').inner_text(),label+' activated provider')
      page.locator('#closeSettings').click()
      page.locator('#send').click()
      page.wait_for_function('document.querySelector("#thread")?.textContent?.includes("Bonjour gratuit !")',timeout=5000)
      check(bool(api) and api[-1]['model']=='nvidia/nemotron-3-ultra-550b-a55b:free',label+' fixed zero-cost large model')
      check(bool(api) and api[-1]['key']=='Bearer sk-or-test-secret',label+' attached ephemeral key')
      check('sk-or-test-secret' not in str(page.evaluate('Object.values(window.__stored)')),label+' secret never stored')
      check('Bonjour gratuit !' in page.locator('#thread').inner_text(),label+' streaming answer')
      check(not errors,label+' no JS crash '+str(errors))
      check(not page.evaluate('document.documentElement.scrollWidth>window.innerWidth+2'),label+' viewport fit')
      context.close()
    # Local model activation with mocked transformers.js, no actual model download in test
    context,page,errors,api,network=launch(browser)
    page.route('**/npm/@huggingface/transformers@3.8.1',lambda r:r.fulfill(body='export async function pipeline(type,model,opts){window.__model=model;return async()=>[{generated_text:[{role:"assistant",content:"Réponse IA locale"}]}]};',content_type='application/javascript',headers={'Access-Control-Allow-Origin':'*'}))
    page.add_init_script('Object.defineProperty(navigator,"gpu",{get:()=>({})})')
    page.evaluate('Object.defineProperty(navigator,"gpu",{get:()=>({})})')
    page.locator('#openSettings').click()
    page.locator('#freeLocalButton').click()
    page.wait_for_function('document.querySelector("#freeLocalStatus")?.textContent?.includes("chargé")',timeout=5000)
    check(page.evaluate('window.__model')=='onnx-community/Qwen3-0.6B-ONNX','Qwen3 local model first')
    page.locator('#closeSettings').click()
    page.locator('#prompt').fill('Réponds localement')
    page.locator('#send').click()
    page.wait_for_function('document.querySelector("#thread")?.textContent?.includes("Réponse IA locale")',timeout=5000)
    check(not api,'local mode no cloud calls')
    check(not errors,'local mock no JS crashes '+str(errors))
    context.close()
    browser.close()
print('TOTAL',sum(ok for ok,_ in checks),'PASS',sum(not ok for ok,_ in checks),'FAIL')
raise SystemExit(0 if all(ok for ok,_ in checks) else 1)
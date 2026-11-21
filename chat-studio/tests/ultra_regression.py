import os, json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(k,cond,why=''):
 checks.append([k,bool(cond),why]);print(('PASS' if cond else 'FAIL'),k,why)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None,args=['--no-sandbox','--disable-gpu'])
 for device,opts in [('desktop',{'viewport':{'width':1440,'height':900}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
  ctx=browser.new_context(**opts);page=ctx.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  # About:blank can execute local HTML without network access; mock storage to test lifecycle.
  page.goto('about:blank')
  page.evaluate("""() => {window._memory={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window._memory[k]??null,setItem:(k,v)=>window._memory[k]=String(v),removeItem:k=>delete window._memory[k]}})}""")
  markup=Path(ROOT/'index.html').read_text().replace('<script src="catalogue.js"></script>', '<script>'+Path(ROOT/'catalogue.js').read_text()+'</script>')
  page.set_content(markup, wait_until='domcontentloaded');page.wait_for_timeout(100)
  check(device+' loads',page.locator('h1').count()==1)
  check(device+' real catalog',page.locator('#capCount').inner_text().startswith('38 '),page.locator('#capCount').inner_text())
  check(device+' slim default',page.locator('body').get_attribute('class')=='ultra-slim')
  page.locator('#slimToggle').click();check(device+' toggles expanded','ultra-slim' not in (page.locator('body').get_attribute('class') or ''))
  page.locator('#slimToggle').click();check(device+' toggles slim','ultra-slim' in (page.locator('body').get_attribute('class') or ''))
  page.locator('#prompt').fill('Brouillon durable mobile et desktop');page.set_content(markup,wait_until='domcontentloaded');check(device+' draft survives',page.locator('#prompt').input_value()=='Brouillon durable mobile et desktop')
  page.locator('#provider').select_option('local');page.locator('#prompt').fill('Explique Playwright');page.locator('#send').click();page.wait_for_timeout(200)
  check(device+' user preserved',page.locator('.message.user').last.locator('.bubble').inner_text()=='Explique Playwright')
  check(device+' local answer',page.locator('.message.assistant').count()>0)
  check(device+' draft cleared',page.locator('#prompt').input_value()=='')
  page.locator('#openSettings').click();page.locator('#smartContext').uncheck();page.set_content(markup,wait_until='domcontentloaded');page.locator('#openSettings').click();check(device+' smart option stored',not page.locator('#smartContext').is_checked())
  page.locator('#smartContext').check();page.locator('#closeSettings').click()
  page.locator('#provider').select_option('bridge');page.locator('#openSettings').click();page.locator('#bridgeUrl').fill('https://example.com/v1/chat/completions');page.locator('#bridgeModel').fill('demo');page.locator('#bridgeKey').fill('VERY_SECRET_TOKEN')
  page.locator('#closeSettings').click()
  captured=[]
  def respond(route):
   captured.append(json.loads(route.request.post_data))
   route.fulfill(status=200,headers={'content-type':'text/event-stream','access-control-allow-origin':'*'},body='data: {"choices":[{"delta":{"content":"Bonjour "}}]}\n\ndata: {"choices":[{"delta":{"content":"depuis test."}}]}\n\ndata: [DONE]\n\n')
  page.route('https://example.com/v1/chat/completions',respond)
  page.locator('#prompt').fill('Aide-moi avec Playwright et les blobs');page.locator('#send').click();page.locator('.message.assistant .bubble').last.wait_for(timeout=5000);page.wait_for_timeout(150)
  check(device+' remote answer',page.locator('.message.assistant .bubble').last.inner_text().startswith('Bonjour depuis test.'))
  check(device+' smart documentary context',any('Playwright' in x['content'] for x in captured[-1]['messages'] if x['role']=='system'))
  ctxstate=page.evaluate('localStorage.getItem("gvault-stable.chat-studio.v1")')
  check(device+' secret non persisted','VERY_SECRET_TOKEN' not in ctxstate)
  check(device+' no javascript errors',not errs,str(errs[:2]))
  page.screenshot(path=str(ROOT / 'tests' / f'ultra-{device}.png'),full_page=True)
  ctx.close()
 browser.close()
print(json.dumps({'total':len(checks),'passed':sum(x[1] for x in checks),'failed':[x for x in checks if not x[1]]},ensure_ascii=False,indent=2))
if not all(x[1] for x in checks):raise SystemExit(1)
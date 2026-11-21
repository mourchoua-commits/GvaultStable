// Mini Moi · véritable modèle local sur Worker (aucune clé, aucune requête de chat distante)
// Source des poids : https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA
// Licence du modèle : Apache-2.0, consulter la fiche de modèle.
const MODEL='onnx-community/SmolLM2-135M-Instruct-ONNX-MHA';
const TRANSFORMERS='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
let pipelineInstance=null,pipelinePromise=null,TextStreamer=null,working=false;
const emit=(type,extra={})=>self.postMessage({type,...extra});
const safeError=e=>String(e?.message||e||'Erreur inconnue').slice(0,250);
async function load(){
 if(pipelineInstance)return pipelineInstance;
 if(!pipelinePromise)pipelinePromise=(async()=>{
   emit('progress',{stage:'Téléchargement du moteur Transformers.js'});
   const mod=await import(TRANSFORMERS);
   mod.env.useBrowserCache=true;
   mod.env.useWasmCache=true;
   TextStreamer=mod.TextStreamer;
   if(typeof WebAssembly!=='object')throw Error('WebAssembly indisponible');
   emit('progress',{stage:'SmolLM2 135M · chargement des poids ONNX (~182 Mo)'});
   pipelineInstance=await mod.pipeline('text-generation',MODEL,{
     device:'wasm',dtype:'q4',
     progress_callback:e=>{
       if(!e)return;
       const percent=Number.isFinite(e.progress)?Math.max(0,Math.min(100,Math.round(e.progress))):null;
       const file=String(e.file||e.name||'poids IA').split('/').pop().slice(0,60);
       if(e.status==='progress'||e.status==='download')emit('progress',{stage:'Téléchargement '+file,percent});
       else if(['initiate','ready','done'].includes(e.status))emit('progress',{stage:'Fichier '+file+' · '+e.status});
     }
   });
   emit('ready',{model:'SmolLM2 135M Instruct',origin:'on-device',remoteChat:false});
   return pipelineInstance;
 })().catch(e=>{pipelinePromise=null;throw e});
 return pipelinePromise;
}
async function generate({id,messages,maxNewTokens}){
 if(working){emit('error',{id,error:'Le modèle répond déjà à un autre message'});return;}
 working=true;
 try{
   const pipe=await load();let full='';
   const parsed=Array.isArray(messages)?messages.filter(x=>['system','user','assistant'].includes(x.role)).slice(-6).map(x=>({role:x.role,content:String(x.content||'').slice(0,2500)})):[];
   const options={max_new_tokens:Math.max(16,Math.min(224,Number(maxNewTokens)||128)),do_sample:false,return_full_text:false};
   if(TextStreamer){options.streamer=new TextStreamer(pipe.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:piece=>{if(!piece)return;full+=piece;emit('delta',{id,text:piece,full})}})}
   const result=await pipe(parsed,options);
   let text=result?.[0]?.generated_text||'';
   if(Array.isArray(text))text=text.filter(x=>x.role==='assistant').map(x=>x.content||'').join('\n');
   text=String(text||full).trim();
   if(!text)throw Error('Le modèle n’a produit aucun texte');
   emit('done',{id,text});
 }catch(e){emit('error',{id,error:safeError(e)})}
 finally{working=false}
}
self.addEventListener('message',e=>{
 const m=e.data||{};
 if(m.type==='init')load().catch(e=>emit('fatal',{error:safeError(e)}));
 else if(m.type==='generate')generate(m).catch(e=>emit('error',{id:m.id,error:safeError(e)}));
});
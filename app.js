'use strict';

const APP_VERSION = '2.0.0';
const HISTORY_KEY = 'gps-emotionnel-final-history-v2';
const SETTINGS_KEY = 'gps-emotionnel-final-settings-v2';

const STATES = {
  joy: {name:'Joie', kind:'Émotion', function:'Signale un environnement favorable ; pousse à l’approche et au partage.'},
  anger: {name:'Colère', kind:'Émotion', function:'Mobilise l’énergie pour lever un obstacle ou une menace perçue.'},
  fear: {name:'Peur', kind:'Émotion', function:'Prépare la fuite ou l’immobilisation rapide face à un danger.'},
  anxiety: {name:'Anxiété', kind:'Émotion', function:'Maintient une vigilance envers une menace anticipée, non présente.'},
  disgust: {name:'Dégoût', kind:'Émotion', function:'Protège d’une ingestion ou d’un contact potentiellement nocif.'},
  sadness: {name:'Tristesse', kind:'Émotion', function:'Favorise le retrait, la récupération et la demande de soutien.'},
  shame: {name:'Honte', kind:'Émotion', function:'Signale une transgression sociale perçue ; pousse à réparer ou se retirer.'},
  calm: {name:'Apaisement', kind:'État de régulation', function:'Restaure les ressources ; associe la sécurité et le lien.'},
  sensory: {name:'Surcharge sensorielle', kind:'État non émotionnel possible', function:'Les fiches ne précisent pas de fonction adaptative ; elles indiquent surtout le besoin de diminuer les stimulations.'},
  fatigue: {name:'Fatigue / vide', kind:'État non émotionnel possible', function:'Les fiches ne précisent pas de fonction adaptative ; elles décrivent l’épuisement, le vide et l’immobilité.'}
};

/*
Chaque question porte sur un seul indice ou une seule fonction.
Oui = poids complet ; Je ne sais pas = 20 % du poids, afin de conserver l’incertitude sans l’assimiler à Non.
Les poids ne sont PAS des coefficients cliniquement validés. Ils organisent les indices des trois fiches fournies.
Le résultat est un profil de compatibilité, pas une mesure biologique de la quantité d’émotion.
*/
const QUESTIONS = [
  {id:'sens1', section:'Distinguer les états corporels', q:'Les sons sont-ils perçus plus fortement que d’habitude ?', cues:['sons perçus plus forts'], w:{sensory:3}},
  {id:'sens2', section:'Distinguer les états corporels', q:'La lumière est-elle difficile à supporter ?', cues:['lumière difficile à supporter'], w:{sensory:3}},
  {id:'sens3', section:'Distinguer les états corporels', q:'Ai-je besoin de silence ou d’obscurité ?', cues:['besoin de silence ou d’obscurité'], w:{sensory:4}},
  {id:'sens4', section:'Distinguer les états corporels', q:'Un contact ou une texture est-il insupportable ?', cues:['contact ou texture insupportable'], w:{sensory:4,disgust:1}},

  {id:'fat1', section:'Distinguer les états corporels', q:'Une grande fatigue soudaine domine-t-elle ?', cues:['grande fatigue soudaine'], w:{fatigue:4,sadness:1}},
  {id:'fat2', section:'Distinguer les états corporels', q:'Mon corps est-il immobilisé ou « figé » ?', cues:['immobilité / corps figé'], w:{fatigue:3,fear:1}},
  {id:'fat3', section:'Distinguer les états corporels', q:'Ai-je une sensation de vide ou d’être « à plat » ?', cues:['vide','à plat, anesthésié·e'], w:{fatigue:4,sadness:1}},

  {id:'calm1', section:'Faible activation', q:'Ma respiration est-elle ample ?', cues:['respiration ample'], w:{calm:3,joy:2}},
  {id:'calm2', section:'Faible activation', q:'La chaleur est-elle douce et homogène ?', cues:['chaleur douce et homogène'], w:{calm:5}},
  {id:'sad1', section:'Faible activation', q:'Mon corps est-il lourd ?', cues:['corps lourd'], w:{sadness:3,fatigue:3}},
  {id:'sad2', section:'Faible activation', q:'Mes membres paraissent-ils « éteints » ?', cues:['membres éteints'], w:{sadness:3,fatigue:2}},
  {id:'sad3', section:'Faible activation', q:'Ma gorge est-elle nouée ?', cues:['gorge nouée'], w:{sadness:4,fear:1}},
  {id:'sad4', section:'Validation fonctionnelle', q:'Mon corps semble-t-il chercher le retrait, la récupération ou du soutien ?', cues:['fonction adaptative de la tristesse'], w:{sadness:5,fatigue:1}},

  {id:'joy1', section:'Activation et ouverture', q:'Ma poitrine ou ma tête semblent-elles activées ?', cues:['poitrine et tête activées'], w:{joy:3}},
  {id:'joy2', section:'Activation et ouverture', q:'Ai-je de l’énergie dans les membres ?', cues:['énergie dans les membres'], w:{joy:4,anger:1}},
  {id:'joy3', section:'Validation fonctionnelle', q:'Mon corps tend-il vers l’approche ou le partage ?', cues:['fonction adaptative de la joie'], w:{joy:5}},

  {id:'ang1', section:'Mobilisation', q:'Ma mâchoire est-elle serrée ?', cues:['mâchoire serrée'], w:{anger:4}},
  {id:'ang2', section:'Mobilisation', q:'Mes mains se ferment-elles ou mes poings sont-ils serrés ?', cues:['mains qui se ferment','poings fermés'], w:{anger:4}},
  {id:'ang3', section:'Mobilisation', q:'Y a-t-il une tension dans le thorax, les bras ou la tête ?', cues:['tension thorax / bras / tête'], w:{anger:4,anxiety:1}},
  {id:'ang4', section:'Validation fonctionnelle', q:'Mon corps mobilise-t-il de l’énergie pour lever un obstacle ou une menace ?', cues:['fonction adaptative de la colère'], w:{anger:5}},

  {id:'fear1', section:'Alerte', q:'Ma poitrine est-elle serrée ?', cues:['poitrine serrée'], w:{fear:3,anxiety:2}},
  {id:'fear2', section:'Alerte', q:'Mon souffle est-il court ou bloqué ?', cues:['souffle court','respiration bloquée'], w:{fear:4,anxiety:2}},
  {id:'fear3', section:'Alerte', q:'Mes jambes semblent-elles se dérober ?', cues:['jambes qui se dérobent'], w:{fear:5}},
  {id:'fear4', section:'Discrimination peur–anxiété', q:'Le danger paraît-il présent maintenant ?', cues:['danger présent'], w:{fear:6}},
  {id:'anx1', section:'Discrimination peur–anxiété', q:'Ma poitrine est-elle plutôt oppressée ?', cues:['poitrine oppressée'], w:{anxiety:4,fear:1}},
  {id:'anx2', section:'Discrimination peur–anxiété', q:'Mon ventre est-il noué ?', cues:['ventre noué'], w:{anxiety:4}},
  {id:'anx3', section:'Discrimination peur–anxiété', q:'La menace paraît-elle anticipée mais non présente ?', cues:['menace anticipée, non présente'], w:{anxiety:6}},

  {id:'dis1', section:'Rejet et retrait', q:'Ma gorge ou mon estomac sont-ils activés ?', cues:['gorge et estomac activés'], w:{disgust:4}},
  {id:'dis2', section:'Rejet et retrait', q:'Le reste de mon corps recule-t-il ?', cues:['recul du reste du corps'], w:{disgust:4,shame:1}},
  {id:'dis3', section:'Validation fonctionnelle', q:'Mon corps cherche-t-il à éviter un contact ou une ingestion perçue comme nocive ?', cues:['fonction adaptative du dégoût'], w:{disgust:6}},

  {id:'sha1', section:'Retrait social corporel', q:'Mon visage est-il chaud ou rouge ?', cues:['chaleur / rougeur au visage'], w:{shame:4,anger:1}},
  {id:'sha2', section:'Retrait social corporel', q:'Le reste de mon corps se retire-t-il ?', cues:['reste du corps qui se retire'], w:{shame:4,disgust:1}},
  {id:'sha3', section:'Validation fonctionnelle', q:'Ai-je la perception d’une transgression sociale ?', cues:['fonction adaptative de la honte'], w:{shame:6}}
];

const state = {
  view:'home', index:0, answers:{}, scores:{}, unknownCount:0, result:null,
  startedAt:null, intensity:5, note:'', context:''
};

const app = document.getElementById('app');
const settingsDialog = document.getElementById('settingsDialog');

function resetSession(){
  state.index=0; state.answers={}; state.scores=Object.fromEntries(Object.keys(STATES).map(k=>[k,0]));
  state.unknownCount=0; state.result=null; state.startedAt=new Date().toISOString(); state.intensity=5; state.note=''; state.context='';
}

function render(){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
  if(state.view==='home') renderHome();
  if(state.view==='question') renderQuestion();
  if(state.view==='result') renderResult();
  if(state.view==='history') renderHistory();
  if(state.view==='sources') renderSources();
}

function renderHome(){
  app.innerHTML=`<section class="card hero">
    <p class="eyebrow">Une seule question à la fois • Oui / Non / Je ne sais pas</p>
    <h2>Partir du corps pour formuler des hypothèses émotionnelles</h2>
    <p>Le parcours reprend les sensations et fonctions adaptatives des trois fiches fournies. Il explore toutes les familles afin d’afficher, à la fin, un panorama du mix émotionnel compatible avec vos réponses.</p>
    <div class="notice"><strong>Important :</strong> les pourcentages sont des <em>indices de compatibilité calculés par l’outil</em>. Ils ne mesurent pas biologiquement « combien » d’une émotion est présente et ne constituent pas un diagnostic.</div>
    <button id="startBtn" class="primary-btn" type="button">Commencer le parcours</button>
    <button id="quickInfoBtn" class="secondary-btn" type="button">Comment fonctionne le panorama ?</button>
  </section>`;
  document.getElementById('startBtn').addEventListener('click',()=>{resetSession();state.view='question';render();});
  document.getElementById('quickInfoBtn').addEventListener('click',()=>alert('Chaque réponse Oui ajoute des indices aux états compatibles. « Je ne sais pas » conserve une petite part d’incertitude. Les indices sont normalisés pour former un panorama à 100 %. Ce panorama est une aide à la réflexion, pas une mesure clinique validée.'));
}

function renderQuestion(){
  const item=QUESTIONS[state.index];
  const pct=Math.round((state.index/QUESTIONS.length)*100);
  app.innerHTML=`<section class="progress-wrap">
      <div class="progress-label"><span>Question ${state.index+1} sur ${QUESTIONS.length}</span><span>${pct}%</span></div>
      <div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>
    </section>
    <section class="card question-card">
      <p class="step">${escapeHtml(item.section)}</p>
      <h2>${escapeHtml(item.q)}</h2>
      <p>Répondez selon ce que votre corps fait <strong>maintenant</strong>, sans chercher la bonne étiquette.</p>
      <ul class="cue-list">${item.cues.map(c=>`<li>${escapeHtml(c)}</li>`).join('')}</ul>
      <div class="answers">
        <button class="answer-btn yes" data-answer="yes" type="button">Oui</button>
        <button class="answer-btn no" data-answer="no" type="button">Non</button>
        <button class="answer-btn unknown" data-answer="unknown" type="button">Je ne sais pas</button>
      </div>
      ${state.index>0?'<button id="backBtn" class="small-link" type="button">Revenir à la question précédente</button>':''}
    </section>`;
  document.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answer(item,btn.dataset.answer)));
  const back=document.getElementById('backBtn'); if(back) back.addEventListener('click',goBack);
}

function answer(item,value){
  state.answers[item.id]=value;
  if(value==='yes') Object.entries(item.w).forEach(([k,v])=>state.scores[k]+=v);
  if(value==='unknown') {state.unknownCount++; Object.entries(item.w).forEach(([k,v])=>state.scores[k]+=v*.2);}
  state.index++;
  if(state.index>=QUESTIONS.length){state.result=calculateMix();state.view='result';}
  render();
}

function recomputeUntil(indexExclusive){
  state.scores=Object.fromEntries(Object.keys(STATES).map(k=>[k,0]));state.unknownCount=0;
  QUESTIONS.slice(0,indexExclusive).forEach(q=>{
    const v=state.answers[q.id];
    if(v==='yes') Object.entries(q.w).forEach(([k,n])=>state.scores[k]+=n);
    if(v==='unknown'){state.unknownCount++;Object.entries(q.w).forEach(([k,n])=>state.scores[k]+=n*.2);}
  });
}
function goBack(){
  if(state.index===0)return; state.index--; delete state.answers[QUESTIONS[state.index].id]; recomputeUntil(state.index); render();
}

function calculateMix(){
  const entries=Object.entries(state.scores).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const total=entries.reduce((s,[,v])=>s+v,0);
  if(total===0) return {indeterminate:true,mix:[],confidence:'Faible'};
  const raw=entries.map(([key,v])=>({key,raw:v,p:(v/total)*100}));
  const floors=raw.map(x=>({...x,pct:Math.floor(x.p),rem:x.p-Math.floor(x.p)}));
  let missing=100-floors.reduce((s,x)=>s+x.pct,0);
  floors.sort((a,b)=>b.rem-a.rem).slice(0,missing).forEach(x=>x.pct++);
  floors.sort((a,b)=>b.pct-a.pct);
  const confidence=state.unknownCount<=2?'Élevée':state.unknownCount<=6?'Moyenne':'Faible';
  return {indeterminate:false,mix:floors,confidence};
}

function renderResult(){
  const r=state.result;
  if(r.indeterminate){
    app.innerHTML=`<section class="card result-header"><h2>État non déterminé pour le moment</h2><p>Les réponses ne permettent pas de dégager un profil suffisamment informatif.</p><button id="restartBtn" class="primary-btn" type="button">Recommencer plus tard</button></section>`;
    document.getElementById('restartBtn').addEventListener('click',()=>{state.view='home';render();});return;
  }
  const displayed=r.mix.slice(0,7);
  const principal=displayed[0]; const secondary=displayed[1];
  app.innerHTML=`<section class="card">
    <div class="result-header">
      <p class="eyebrow">Panorama indicatif du mix émotionnel</p>
      <h2>${escapeHtml(STATES[principal.key].name)} principalement compatible</h2>
      <span class="confidence">Confiance ergonomique : ${r.confidence}</span>
    </div>
    <div class="mix-list" role="img" aria-label="Composition indicative des états compatibles">
      ${displayed.map(x=>`<div class="mix-row"><div class="mix-name">${escapeHtml(STATES[x.key].name)}</div><div class="bar-track"><div class="bar-fill" style="width:${x.pct}%"></div></div><div class="mix-value">${x.pct}%</div></div>`).join('')}
    </div>
    <div class="result-note">Ces pourcentages représentent la part relative des indices compatibles recueillis dans ce parcours. Ils peuvent montrer un état mixte, mais ne constituent pas une mesure clinique de l’intensité réelle des émotions.</div>
    <div class="result-grid">
      <article class="mini-card"><h3>Hypothèse principale</h3><p><strong>${escapeHtml(STATES[principal.key].name)}</strong> — ${escapeHtml(STATES[principal.key].function)}</p></article>
      ${secondary?`<article class="mini-card"><h3>Hypothèse secondaire</h3><p><strong>${escapeHtml(STATES[secondary.key].name)}</strong> — ${escapeHtml(STATES[secondary.key].function)}</p></article>`:''}
    </div>
    <div class="field"><label for="intensity">Intensité globale ressentie : <span id="intensityValue">${state.intensity}</span>/10</label><input id="intensity" type="range" min="0" max="10" value="${state.intensity}"></div>
    <div class="field"><label for="context">Situation ou moment</label><input id="context" maxlength="120" placeholder="Ex. après une réunion, au réveil…"></div>
    <div class="field"><label for="note">Ce que je remarque ou ce dont j’ai besoin</label><textarea id="note" placeholder="Note facultative"></textarea></div>
    <button id="saveBtn" class="primary-btn" type="button">Enregistrer ce panorama</button>
    <button id="againBtn" class="secondary-btn" type="button">Rechercher une autre configuration corporelle</button>
  </section>`;
  const intensity=document.getElementById('intensity'); intensity.addEventListener('input',()=>{state.intensity=Number(intensity.value);document.getElementById('intensityValue').textContent=state.intensity;});
  document.getElementById('saveBtn').addEventListener('click',saveResult);
  document.getElementById('againBtn').addEventListener('click',()=>{resetSession();state.view='question';render();});
}

function saveResult(){
  state.context=document.getElementById('context').value.trim();state.note=document.getElementById('note').value.trim();
  const history=getHistory();
  history.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),date:new Date().toISOString(),version:APP_VERSION,intensity:state.intensity,context:state.context,note:state.note,confidence:state.result.confidence,unknownCount:state.unknownCount,mix:state.result.mix.map(x=>({key:x.key,pct:x.pct}))});
  localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,200)));
  alert('Panorama enregistré sur cet appareil.');state.view='history';render();
}

function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}}
function renderHistory(){
  const history=getHistory();
  app.innerHTML=`<section class="card"><h2>Historique local</h2><p class="eyebrow">Les données restent dans ce navigateur, sauf export volontaire.</p>
    ${history.length?history.map(h=>`<article class="history-item"><div class="history-top"><strong>${new Date(h.date).toLocaleString('fr-FR')}</strong><span>${h.intensity}/10</span></div><div class="history-mix">${h.mix.slice(0,4).map(x=>`${STATES[x.key]?.name||x.key} ${x.pct}%`).join(' · ')}</div>${h.context?`<div class="history-mix">${escapeHtml(h.context)}</div>`:''}</article>`).join(''):'<div class="empty">Aucun panorama enregistré.</div>'}
    ${history.length?'<button id="exportBtn" class="secondary-btn" type="button">Exporter en JSON</button>':''}
  </section>`;
  const exportBtn=document.getElementById('exportBtn');if(exportBtn)exportBtn.addEventListener('click',()=>downloadJSON(history));
}

function renderSources(){
  app.innerHTML=`<section class="card"><h2>Fondements et limites</h2>
    <div class="notice">Cet outil d’auto-observation ne remplace pas une évaluation clinique. Les cartes corporelles décrivent des profils moyens ; une même sensation peut accompagner plusieurs émotions.</div>
    <div class="result-grid">
      <article class="mini-card"><h3>Documents de référence</h3><p>Les questions reprennent les manifestations corporelles, la banque de mots émotionnels, la grille quotidienne et les fonctions adaptatives présentes dans les trois fiches fournies.</p></article>
      <article class="mini-card"><h3>Interoception</h3><p>La recherche distingue la détection d’un signal, son interprétation et la confiance accordée à cette interprétation. Ces dimensions peuvent diverger.</p></article>
      <article class="mini-card"><h3>TSA et alexithymie</h3><p>L’alexithymie est fréquente mais non universelle chez les adultes autistes. Les difficultés d’identification émotionnelle ne doivent donc pas être attribuées automatiquement au TSA.</p></article>
      <article class="mini-card"><h3>Mix émotionnel</h3><p>Plusieurs états peuvent coexister. Le panorama normalise les indices recueillis pour faciliter la comparaison, sans prétendre quantifier biologiquement les émotions.</p></article>
    </div>
    <h3>Références principales</h3>
    <ul>
      <li>Nummenmaa et al. (2014), <em>Bodily maps of emotions</em>, PNAS.</li>
      <li>Kinnaird et al. (2019), revue systématique sur l’alexithymie dans l’autisme.</li>
      <li>Garfinkel et al. (2016), dimensions de l’interoception dans l’autisme.</li>
      <li>Quadt et al. (2021), essai ADIE d’entraînement interoceptif chez l’adulte autiste.</li>
      <li>Costache et al. (2024), évaluation écologique des émotions chez des adultes autistes.</li>
      <li>Khalsa et al. (2018), feuille de route sur interoception et santé mentale.</li>
    </ul>
  </section>`;
}

function downloadJSON(data){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='gps-emotionnel-historique.json';a.click();URL.revokeObjectURL(url);
}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function applySettings(){
  const s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');document.body.classList.toggle('font-large',s.font==='large');document.body.classList.toggle('font-xlarge',s.font==='xlarge');document.body.classList.toggle('high-contrast',!!s.contrast);document.body.classList.toggle('reduce-motion',!!s.motion);
  document.getElementById('fontSizeSelect').value=s.font||'normal';document.getElementById('contrastToggle').checked=!!s.contrast;document.getElementById('motionToggle').checked=!!s.motion;
}
function saveSettings(){const s={font:document.getElementById('fontSizeSelect').value,contrast:document.getElementById('contrastToggle').checked,motion:document.getElementById('motionToggle').checked};localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));applySettings();}

document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{state.view=btn.dataset.view;render();}));
document.getElementById('settingsBtn').addEventListener('click',()=>settingsDialog.showModal());
document.getElementById('closeSettings').addEventListener('click',()=>settingsDialog.close());
['fontSizeSelect','contrastToggle','motionToggle'].forEach(id=>document.getElementById(id).addEventListener('change',saveSettings));
document.getElementById('clearHistoryBtn').addEventListener('click',()=>{if(confirm('Effacer tout l’historique enregistré sur cet appareil ?')){localStorage.removeItem(HISTORY_KEY);settingsDialog.close();state.view='history';render();}});

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
applySettings();render();

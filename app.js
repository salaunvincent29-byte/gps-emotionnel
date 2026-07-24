'use strict';
const STATES={"joy": {"name": "Joie", "kind": "Émotion probable", "icon": "☀", "function": "Signale une situation favorable et peut favoriser l’approche, l’exploration ou le partage.", "needs": ["continuer", "profiter", "partager"]}, "anger": {"name": "Colère", "kind": "Émotion probable", "icon": "⚡", "function": "Mobilise l’énergie face à un obstacle, une injustice ou une limite dépassée.", "needs": ["limite", "espace", "justice", "action claire"]}, "fear": {"name": "Peur", "kind": "Émotion probable", "icon": "△", "function": "Prépare à se protéger rapidement face à un danger présent.", "needs": ["sécurité", "distance", "aide immédiate"]}, "anxiety": {"name": "Anxiété", "kind": "Émotion probable", "icon": "≈", "function": "Maintient la vigilance face à une menace possible ou anticipée.", "needs": ["prévisibilité", "information", "plan", "réassurance"]}, "disgust": {"name": "Dégoût", "kind": "Émotion probable", "icon": "⊘", "function": "Protège d’un contact, d’une odeur, d’un goût ou d’une situation perçue comme nocive.", "needs": ["éloignement", "arrêt", "protection"]}, "sadness": {"name": "Tristesse", "kind": "Émotion probable", "icon": "☂", "function": "Favorise le ralentissement, la récupération et la recherche de soutien.", "needs": ["repos", "soutien", "temps", "réconfort"]}, "shame": {"name": "Honte", "kind": "Émotion probable", "icon": "○", "function": "Peut apparaître lors d’une exposition sociale difficile et favoriser le retrait ou la réparation.", "needs": ["respect", "sécurité relationnelle", "réparation"]}, "calm": {"name": "Apaisement", "kind": "État de régulation probable", "icon": "≈", "function": "Correspond à une baisse de l’activation et à une restauration des ressources.", "needs": ["maintenir le calme", "repos", "sécurité"]}, "sensory": {"name": "Surcharge sensorielle", "kind": "État non émotionnel possible", "icon": "✦", "function": "Indique surtout que les stimulations dépassent les capacités disponibles du moment.", "needs": ["silence", "obscurité", "distance", "réduction des stimulations"]}, "fatigue": {"name": "Fatigue / vide", "kind": "État non émotionnel possible", "icon": "◐", "function": "Décrit principalement un manque de ressources, un ralentissement ou un épuisement.", "needs": ["pause", "repos", "sommeil", "réduction de la demande"]}};
const ALL_QUESTIONS=[{"id": "medical", "stage": "Sécurité", "q": "Ai-je maintenant un malaise, une forte douleur dans la poitrine ou beaucoup de mal à respirer ?", "help": "Si oui, le questionnaire s’arrête. Ces signes doivent être évalués médicalement.", "safety": true, "mode": "short"}, {"id": "sound", "stage": "Sens", "q": "Les sons me gênent-ils plus que d’habitude ?", "tier": "core", "mode": "short", "w": {"sensory": 5}}, {"id": "light", "stage": "Sens", "q": "La lumière me gêne-t-elle maintenant ?", "tier": "core", "mode": "short", "w": {"sensory": 5}}, {"id": "touch", "stage": "Sens", "q": "Un vêtement, un contact ou une texture est-il difficile à supporter ?", "tier": "core", "mode": "full", "w": {"sensory": 5, "disgust": 1}}, {"id": "silence", "stage": "Sens", "q": "Ai-je besoin de silence maintenant ?", "tier": "core", "mode": "short", "w": {"sensory": 6}}, {"id": "dark", "stage": "Sens", "q": "Ai-je besoin de moins de lumière maintenant ?", "tier": "core", "mode": "full", "w": {"sensory": 5}}, {"id": "sudden_fatigue", "stage": "Énergie", "q": "Suis-je soudain très fatigué ?", "tier": "core", "mode": "short", "w": {"fatigue": 6, "sadness": 1}}, {"id": "heavy_body", "stage": "Corps entier", "q": "Mon corps me paraît-il lourd ?", "tier": "core", "mode": "short", "w": {"fatigue": 5, "sadness": 4}}, {"id": "low_limbs", "stage": "Bras et jambes", "q": "Mes bras ou mes jambes manquent-ils d’énergie ?", "tier": "core", "mode": "full", "w": {"fatigue": 4, "sadness": 4}}, {"id": "still_body", "stage": "Corps entier", "q": "Ai-je du mal à mettre mon corps en mouvement ?", "tier": "core", "mode": "full", "w": {"fatigue": 4, "sadness": 2}}, {"id": "empty", "stage": "Corps entier", "q": "Est-ce que je ressens une sensation de vide ?", "tier": "core", "mode": "short", "w": {"fatigue": 6, "sadness": 2}}, {"id": "easy_breath", "stage": "Respiration", "q": "Est-ce que je respire facilement ?", "tier": "core", "mode": "short", "w": {"calm": 5, "joy": 2}}, {"id": "wide_breath", "stage": "Respiration", "q": "Ma respiration est-elle ample et régulière ?", "tier": "core", "mode": "full", "w": {"calm": 5, "joy": 2}}, {"id": "soft_warmth", "stage": "Corps entier", "q": "Est-ce que je sens une chaleur douce dans mon corps ?", "tier": "core", "mode": "short", "w": {"calm": 6, "joy": 2}}, {"id": "relaxed_muscles", "stage": "Muscles", "q": "Mes muscles sont-ils relâchés ?", "tier": "research", "mode": "full", "w": {"calm": 3}}, {"id": "pleasant_energy", "stage": "Bras et jambes", "q": "Ai-je une énergie agréable dans les bras ou les jambes ?", "tier": "core", "mode": "short", "w": {"joy": 6}}, {"id": "upper_warmth", "stage": "Poitrine et tête", "q": "Est-ce que je sens une chaleur agréable dans la poitrine ou la tête ?", "tier": "core", "mode": "full", "w": {"joy": 5, "calm": 2}}, {"id": "spont_smile", "stage": "Visage", "q": "Est-ce que les coins de ma bouche remontent sans que je le décide ?", "tier": "research", "mode": "full", "w": {"joy": 2}}, {"id": "jaw", "stage": "Visage", "q": "Ma mâchoire est-elle serrée ?", "tier": "core", "mode": "short", "w": {"anger": 6}}, {"id": "fists", "stage": "Mains", "q": "Mes mains sont-elles fermées ou très serrées ?", "tier": "core", "mode": "full", "w": {"anger": 6}}, {"id": "arm_tension", "stage": "Bras", "q": "Mes bras sont-ils tendus ?", "tier": "core", "mode": "full", "w": {"anger": 5}}, {"id": "head_tension", "stage": "Tête", "q": "Est-ce que je sens une forte tension dans la tête ?", "tier": "core", "mode": "full", "w": {"anger": 4}}, {"id": "body_heat", "stage": "Corps entier", "q": "Est-ce que j’ai chaud alors que la pièce n’est pas plus chaude ?", "tier": "core", "mode": "short", "w": {"anger": 4, "shame": 1}}, {"id": "heart_fast_activation", "stage": "Poitrine", "q": "Mon cœur bat-il plus vite que d’habitude ?", "tier": "research", "mode": "short", "w": {"anger": 2, "fear": 3, "anxiety": 3, "shame": 1}}, {"id": "fast_breath", "stage": "Respiration", "q": "Est-ce que je respire plus vite que d’habitude ?", "tier": "research", "mode": "full", "w": {"anger": 2, "fear": 3, "anxiety": 3}}, {"id": "tight_chest", "stage": "Poitrine", "q": "Ma poitrine est-elle serrée ?", "tier": "core", "mode": "short", "w": {"fear": 5, "anxiety": 4}}, {"id": "short_breath", "stage": "Respiration", "q": "Mon souffle est-il court ?", "tier": "core", "mode": "short", "w": {"fear": 6, "anxiety": 4}}, {"id": "weak_legs", "stage": "Jambes", "q": "Mes jambes semblent-elles faibles ou prêtes à lâcher ?", "tier": "core", "mode": "short", "w": {"fear": 7}}, {"id": "tremble", "stage": "Corps ou mains", "q": "Est-ce que mes mains ou mon corps tremblent ?", "tier": "research", "mode": "full", "w": {"fear": 4, "anxiety": 3}}, {"id": "cold_sweat", "stage": "Peau", "q": "Est-ce que je transpire ou que j’ai des frissons sans raison évidente ?", "tier": "research", "mode": "full", "w": {"fear": 3, "anxiety": 3}}, {"id": "belly_knot", "stage": "Ventre", "q": "Est-ce que je sens un nœud dans le ventre ?", "tier": "core", "mode": "short", "w": {"anxiety": 6}}, {"id": "chest_pressure", "stage": "Poitrine", "q": "Est-ce que je sens une pression dans la poitrine ?", "tier": "core", "mode": "full", "w": {"anxiety": 5, "fear": 3}}, {"id": "dry_mouth", "stage": "Bouche", "q": "Ma bouche est-elle plus sèche que d’habitude ?", "tier": "research", "mode": "full", "w": {"anxiety": 2, "fear": 1}}, {"id": "nausea", "stage": "Ventre", "q": "Ai-je la nausée ou l’estomac retourné ?", "tier": "research", "mode": "full", "w": {"disgust": 4, "anxiety": 3, "fear": 1}}, {"id": "general_tension", "stage": "Muscles", "q": "Plusieurs muscles de mon corps sont-ils tendus en même temps ?", "tier": "research", "mode": "full", "w": {"anxiety": 3, "anger": 2}}, {"id": "throat_reaction", "stage": "Gorge", "q": "Est-ce que ma gorge se serre ou réagit fortement ?", "tier": "core", "mode": "full", "w": {"disgust": 5, "fear": 1}}, {"id": "stomach_reaction", "stage": "Estomac", "q": "Est-ce que mon estomac réagit fortement ?", "tier": "core", "mode": "short", "w": {"disgust": 6, "anxiety": 2}}, {"id": "recoil", "stage": "Mouvement", "q": "Est-ce que mon corps recule tout seul ?", "tier": "core", "mode": "full", "w": {"disgust": 6, "shame": 1}}, {"id": "bad_taste_saliva", "stage": "Bouche", "q": "Ai-je un goût désagréable ou plus de salive dans la bouche ?", "tier": "research", "mode": "full", "w": {"disgust": 3}}, {"id": "throat_knot", "stage": "Gorge", "q": "Ma gorge est-elle nouée ?", "tier": "core", "mode": "short", "w": {"sadness": 6, "fear": 1}}, {"id": "eyes_wet", "stage": "Yeux", "q": "Mes yeux sont-ils humides ou ai-je envie de pleurer ?", "tier": "research", "mode": "full", "w": {"sadness": 4}}, {"id": "slow_movement", "stage": "Mouvement", "q": "Est-ce que mes mouvements sont plus lents que d’habitude ?", "tier": "research", "mode": "full", "w": {"sadness": 3, "fatigue": 3}}, {"id": "chest_ache", "stage": "Poitrine", "q": "Est-ce que je sens une douleur diffuse ou un poids dans la poitrine ?", "tier": "research", "mode": "full", "w": {"sadness": 3, "anxiety": 2}}, {"id": "face_hot", "stage": "Visage", "q": "Mon visage est-il chaud ?", "tier": "core", "mode": "short", "w": {"shame": 6, "anger": 1}}, {"id": "face_red", "stage": "Visage", "q": "Mon visage est-il plus rouge que d’habitude ?", "tier": "core", "mode": "full", "w": {"shame": 5, "anger": 1}}, {"id": "body_shrink", "stage": "Corps entier", "q": "Est-ce que mon corps se replie ou prend moins de place ?", "tier": "core", "mode": "full", "w": {"shame": 6, "sadness": 1}}, {"id": "stomach_shame", "stage": "Ventre", "q": "Est-ce que mon ventre devient inconfortable quand je pense au regard des autres ?", "tier": "research", "mode": "full", "w": {"shame": 3, "anxiety": 2}}, {"id": "danger_now", "stage": "Situation", "q": "Un danger est-il présent ici, maintenant ?", "tier": "context", "mode": "short", "w": {"fear": 8}}, {"id": "future_threat", "stage": "Situation", "q": "Est-ce que je pense à un problème qui pourrait arriver plus tard ?", "tier": "context", "mode": "short", "w": {"anxiety": 8}}, {"id": "obstacle_limit", "stage": "Situation", "q": "Quelqu’un ou quelque chose bloque-t-il ce que je veux faire, ou dépasse-t-il une limite ?", "tier": "context", "mode": "short", "w": {"anger": 8}}, {"id": "loss", "stage": "Situation", "q": "Est-ce que je viens de perdre quelque chose d’important, ou d’être déçu ?", "tier": "context", "mode": "full", "w": {"sadness": 8}}, {"id": "social_exposure", "stage": "Situation", "q": "Est-ce que je pense avoir fait une erreur devant quelqu’un ?", "tier": "context", "mode": "short", "w": {"shame": 8}}, {"id": "noxious", "stage": "Situation", "q": "Est-ce que quelque chose me paraît sale, mauvais, contaminé ou impossible à avaler ?", "tier": "context", "mode": "full", "w": {"disgust": 8}}, {"id": "favorable", "stage": "Situation", "q": "Est-ce que quelque chose d’agréable ou d’attendu vient de se produire ?", "tier": "context", "mode": "full", "w": {"joy": 8}}];
const SHORT_IDS=new Set(["belly_knot", "body_heat", "danger_now", "easy_breath", "empty", "face_hot", "future_threat", "heart_fast_activation", "heavy_body", "jaw", "light", "medical", "obstacle_limit", "pleasant_energy", "short_breath", "silence", "social_exposure", "soft_warmth", "sound", "stomach_reaction", "sudden_fatigue", "throat_knot", "tight_chest", "weak_legs"]);
const HISTORY_KEY='gps-emotionnel-v5-history',SETTINGS_KEY='gps-emotionnel-v5-settings';
const MAP_VISUAL={"joy": {"icon": "☀", "v": 0.78, "a": 0.72, "zones": ["chest", "head", "arms", "legs"], "action": "continuer ou partager"}, "anger": {"icon": "⚡", "v": -0.72, "a": 0.88, "zones": ["face", "chest", "arms", "head"], "action": "poser une limite"}, "fear": {"icon": "△", "v": -0.82, "a": 0.92, "zones": ["chest", "breath", "legs"], "action": "chercher la sécurité"}, "anxiety": {"icon": "≈", "v": -0.67, "a": 0.72, "zones": ["chest", "belly", "breath"], "action": "rendre la suite prévisible"}, "disgust": {"icon": "⊘", "v": -0.78, "a": 0.46, "zones": ["throat", "belly", "mouth"], "action": "s’éloigner"}, "sadness": {"icon": "☂", "v": -0.72, "a": -0.62, "zones": ["throat", "chest", "body", "arms", "legs", "eyes"], "action": "ralentir ou demander du soutien"}, "shame": {"icon": "○", "v": -0.68, "a": 0.22, "zones": ["face", "belly", "body"], "action": "se protéger ou réparer"}, "calm": {"icon": "≈", "v": 0.72, "a": -0.62, "zones": ["breath", "body"], "action": "maintenir les conditions"}, "sensory": {"icon": "✦", "v": -0.58, "a": 0.82, "zones": ["senses", "head", "body"], "action": "réduire les stimulations"}, "fatigue": {"icon": "◐", "v": -0.22, "a": -0.88, "zones": ["body", "arms", "legs", "head"], "action": "faire une pause"}};
const BODY_FRONT_IMAGE="assets/body-front-neutral.png";
const COMPASS_BG_IMAGE="assets/compass-background.png";
const app=document.getElementById('app');
const S={view:'home',mode:'short',questions:[],i:0,answers:{},unknown:0,result:null,stopped:false,mapKey:null};
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const history=()=>{try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}};
function setView(v){S.view=v;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render()}
function render(){({home,question,result,map,history:historyView,science,mapDetail}[S.view]||home)()}
function home(){
 app.innerHTML=`<section class="card"><p class="eyebrow">VERSION 5 — QUESTIONNAIRE</p><h2>Je décris mon corps. Le GPS propose des hypothèses.</h2>
 <p>Les signes issus des fiches de la neuropsychologue restent prioritaires. Les signes ajoutés par la recherche ont une pondération plus faible.</p>
 <div class="grid">
  <button class="choice" data-mode="short"><strong>Parcours court</strong><small>Environ 3 à 5 minutes. Signes principaux et questions de contexte.</small></button>
  <button class="choice" data-mode="full"><strong>Parcours complet</strong><small>Environ 7 à 10 minutes. Ajoute des signes corporels complémentaires.</small></button>
 </div>
 <div class="notice"><strong>Réponses :</strong> Oui, Non ou Difficile à dire. « Difficile à dire » n’est jamais traité comme « Non ».</div>
 <button class="secondary" onclick="setView('map')">Voir les émotions recherchées</button></section>`;
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));
}
function start(mode){
 S.mode=mode;S.questions=ALL_QUESTIONS.filter(q=>q.safety || mode==='full' || SHORT_IDS.has(q.id));
 S.i=0;S.answers={};S.unknown=0;S.result=null;S.stopped=false;S.view='question';render();
}
function question(){
 const q=S.questions[S.i],p=Math.round(100*S.i/S.questions.length);
 app.innerHTML=`<div class="progress-label"><span>Question ${S.i+1} sur ${S.questions.length}</span><span>${p} %</span></div>
 <div class="progress"><div style="width:${p}%"></div></div>
 <section class="card qcard"><span class="zone">${esc(q.stage)}</span><h2 class="question">${esc(q.q)}</h2>
 <p class="help">${esc(q.help||'Répondez seulement pour ce qui est présent maintenant.')}</p>
 <div class="answers"><button class="answer yes" data-a="yes">Oui</button><button class="answer no" data-a="no">Non</button><button class="answer unsure" data-a="unsure">Difficile à dire</button></div>
 <div id="confirmation"></div>
 ${q.tier?`<div class="tier">${q.tier==='core'?'Repère prioritaire des fiches initiales':q.tier==='research'?'Repère complémentaire de la littérature':'Question de contexte'}</div>`:''}</section>`;
 document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>answer(b.dataset.a));
}
function answer(a){
 const q=S.questions[S.i];S.answers[q.id]=a;if(a==='unsure')S.unknown++;
 if(q.safety && a==='yes'){S.stopped=true;return safetyStop()}
 document.querySelectorAll('[data-a]').forEach(b=>b.disabled=true);
 document.getElementById('confirmation').innerHTML='<div class="confirmation">✓ Réponse notée</div>';
 setTimeout(()=>{S.i++;if(S.i>=S.questions.length){S.result=calculate();S.view='result'}render()},260);
}
function safetyStop(){
 app.innerHTML=`<section class="card"><p class="eyebrow">PRIORITÉ À LA SÉCURITÉ</p><h2>J’arrête le questionnaire.</h2>
 <div class="notice danger">Un malaise, une forte douleur thoracique ou une difficulté respiratoire importante ne doivent pas être classés automatiquement comme une émotion.</div>
 <p>Demandez une aide médicale adaptée à la situation. En cas d’urgence en France, appelez le 15 ou le 112.</p>
 <button class="secondary" onclick="setView('home')">Retour à l’accueil</button></section>`;
}
function calculate(){
 const support={},possible={},yesCues={};
 Object.keys(STATES).forEach(k=>{support[k]=0;possible[k]=0;yesCues[k]=[]});
 S.questions.forEach(q=>{
   if(!q.w)return;const a=S.answers[q.id];
   Object.entries(q.w).forEach(([k,w])=>{
     if(a!=='unsure')possible[k]+=w;
     if(a==='yes'){support[k]+=w;yesCues[k].push(q.q)}
   });
 });
 let ratios=Object.keys(STATES).map(k=>({key:k,ratio:possible[k]?support[k]/possible[k]:0,raw:support[k],cues:yesCues[k]})).sort((a,b)=>b.ratio-a.ratio);
 const sum=ratios.reduce((s,x)=>s+x.ratio,0);
 let exact=ratios.map(x=>({...x,pct:sum?100*x.ratio/sum:0}));
 let flo=exact.map(x=>({...x,pct:Math.floor(x.pct)})),rem=100-flo.reduce((s,x)=>s+x.pct,0);
 exact.map((x,i)=>({i,f:x.pct-Math.floor(x.pct)})).sort((a,b)=>b.f-a.f).slice(0,rem).forEach(x=>flo[x.i].pct++);
 const answered=S.questions.length-S.unknown,conf=answered?Math.round(100*answered/S.questions.length):0;
 return{mix:flo,confidence:conf};
}
function result(){
 const v=S.result.mix.filter(x=>x.pct>0).slice(0,6),m=v[0];
 app.innerHTML=`<section class="card"><p class="eyebrow">PANORAMA DU MOMENT</p><h2>${m?esc(STATES[m.key].name):'État non déterminé'}</h2>
 <p>Questions avec réponse claire : <strong>${S.result.confidence} %</strong></p>
 <div class="mix">${v.map(x=>`<div class="mixrow"><strong>${esc(STATES[x.key].name)}</strong><div class="bar"><div style="width:${x.pct}%"></div></div><span class="pct">${x.pct}%</span></div>`).join('')}</div>
 <div class="notice">Les pourcentages sont des compatibilités relatives entre vos réponses et les hypothèses. Ils ne mesurent pas la quantité biologique d’une émotion.</div>
 ${m?`<div class="evidence"><h3>${STATES[m.key].icon} ${esc(STATES[m.key].name)}</h3><p>${esc(STATES[m.key].function)}</p><div>${STATES[m.key].needs.map(n=>`<span class="tag">${esc(n)}</span>`).join('')}</div>
 <h3>Indices que vous avez confirmés</h3>${m.cues.length?m.cues.slice(0,6).map(c=>`<p>✓ ${esc(c)}</p>`).join(''):'<p>Aucun indice net.</p>'}</div>`:''}
 <label class="field">Intensité globale<input id="intensity" type="range" min="0" max="10" value="5"></label>
 <label class="field">Situation<input id="context" type="text" placeholder="Ex. après une réunion"></label>
 <label class="field">Note ou besoin<textarea id="note" placeholder="Facultatif"></textarea></label>
 <button id="save" class="primary">Enregistrer</button><button class="secondary" onclick="start('${S.mode}')">Recommencer</button></section>`;
 document.getElementById('save').onclick=save;
}
function save(){
 const h=history();h.unshift({date:new Date().toISOString(),mode:S.mode,intensity:+document.getElementById('intensity').value,context:document.getElementById('context').value.trim(),note:document.getElementById('note').value.trim(),unknown:S.unknown,mix:S.result.mix.map(x=>({key:x.key,pct:x.pct})),answers:S.answers});
 localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,250)));alert('Panorama enregistré sur cet appareil.');setView('history');
}
function zoneLabel(z){
 return ({head:"Tête",face:"Visage",throat:"Gorge",chest:"Poitrine",belly:"Ventre / estomac",arms:"Bras et mains",legs:"Jambes",senses:"Sens / environnement",breath:"Respiration",body:"Corps entier",mouth:"Bouche",eyes:"Yeux"})[z]||"Zone";
}
function emotionsForZone(z){
 return Object.entries(MAP_VISUAL).filter(([k,v])=>v.zones.includes(z)).map(([k])=>k);
}
function anatomyFigure(selected="chest"){
 const zones=[
   ["head",50,8,18,10],["face",50,13,16,8],["throat",50,20,12,7],
   ["chest",50,33,35,20],["belly",50,50,31,18],["arms",25,42,20,42],
   ["arms",75,42,20,42],["legs",39,77,19,40],["legs",61,77,19,40],
   ["breath",87,18,16,12],["senses",13,18,16,12]
 ];
 return `<div class="body-v53-frame">
   <img class="body-v53-image" src="${BODY_FRONT_IMAGE}" alt="Représentation réaliste, frontale et non genrée du corps humain">
   <div class="body-v53-overlay">
    ${zones.map(([z,x,y,w,h])=>`<button class="anatomy-zone ${selected===z?'selected':''}" data-zone="${z}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;" aria-label="${zoneLabel(z)}"><span>${zoneLabel(z)}</span></button>`).join("")}
   </div>
 </div>`;
}
function map(){
 S.mapZone=S.mapZone||"chest";
 const keys=emotionsForZone(S.mapZone);
 app.innerHTML=`<section class="card realistic-map-card">
   <p class="eyebrow">CARTOGRAPHIE CORPORELLE V5.3</p>
   <h2>Je touche l’endroit où je ressens quelque chose</h2>
   <p class="map-instruction">Une seule silhouette, de face. Les zones colorées sont tactiles.</p>

   <div class="map-mode-tabs" role="tablist">
     <button class="map-tab active" data-mode="body">Corps humain</button>
     <button class="map-tab" data-mode="compass">Boussole émotionnelle</button>
   </div>

   <div id="bodyPanel">
     <div class="real-map-layout">
       <div class="anatomy-stage">${anatomyFigure(S.mapZone)}</div>
       <div class="zone-result">
         <div class="zone-title">${zoneLabel(S.mapZone)}</div>
         <div class="emotion-orbit">
           ${keys.map(k=>`<button class="emotion-bubble" data-k="${k}">
             <span class="bubble-icon">${MAP_VISUAL[k].icon}</span>
             <span>${esc(STATES[k].name)}</span>
           </button>`).join("")}
         </div>
         <p class="map-caption">Une zone peut correspondre à plusieurs émotions ou états.</p>
       </div>
     </div>
   </div>

   <div id="compassPanel" class="hidden">
     ${emotionCompass()}
   </div>
 </section>`;
 document.querySelectorAll(".anatomy-zone").forEach(b=>b.addEventListener("click",()=>{S.mapZone=b.dataset.zone;map()}));
 document.querySelectorAll(".emotion-bubble,.compass-emotion").forEach(b=>b.addEventListener("click",()=>{S.mapKey=b.dataset.k;setView("mapDetail")}));
 document.querySelectorAll(".map-tab").forEach(b=>b.addEventListener("click",()=>switchMapMode(b.dataset.mode)));
 document.querySelectorAll(".compass-filter").forEach(b=>b.addEventListener("click",()=>applyCompassFilter(b.dataset.filter)));
}
function switchMapMode(mode){
 document.querySelectorAll(".map-tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
 document.getElementById("bodyPanel").classList.toggle("hidden",mode!=="body");
 document.getElementById("compassPanel").classList.toggle("hidden",mode!=="compass");
}
function emotionCompass(){
 const ring=[
  ["fear",-82],["anger",-50],["anxiety",-18],["sensory",18],["joy",54],
  ["calm",96],["sadness",138],["fatigue",174],["disgust",216],["shame",252]
 ];
 return `<div class="compass-v53" style="--compass-bg:url('${COMPASS_BG_IMAGE}')">
   <div class="compass-rings" aria-hidden="true">
     <div class="ring-label high">ÉNERGIE FORTE</div>
     <div class="ring-label low">ÉNERGIE FAIBLE</div>
     <div class="ring-label unpleasant">DÉSAGRÉABLE</div>
     <div class="ring-label pleasant">AGRÉABLE</div>
   </div>
   <div class="compass-needle" aria-hidden="true"><span></span></div>
   <div class="compass-center">ÉTAT<br>DU MOMENT</div>
   ${ring.map(([k,deg],i)=>`<button class="compass-emotion" data-k="${k}" data-filterkey="${filterKey(k)}" style="--angle:${deg}deg">
     <span class="compass-symbol">${MAP_VISUAL[k].icon}</span>
     <strong>${esc(STATES[k].name)}</strong>
   </button>`).join("")}
 </div>
 <div class="compass-controls">
   <button class="compass-filter" data-filter="high">Énergie forte</button>
   <button class="compass-filter" data-filter="low">Énergie faible</button>
   <button class="compass-filter" data-filter="unpleasant">Désagréable</button>
   <button class="compass-filter" data-filter="pleasant">Agréable</button>
   <button class="compass-filter reset" data-filter="all">Tout afficher</button>
 </div>
 <p class="map-caption">Chaque émotion a une place fixe sur le cadran. Les libellés ne se chevauchent pas.</p>`;
}
function filterKey(k){
 if(["fear","anger","anxiety","sensory"].includes(k))return "high unpleasant";
 if(k==="joy")return "high pleasant";
 if(["sadness","fatigue","disgust","shame"].includes(k))return "low unpleasant";
 return "low pleasant";
}
function applyCompassFilter(filter){
 document.querySelectorAll(".compass-emotion").forEach(b=>{
   const keys=b.dataset.filterkey.split(" ");
   b.classList.toggle("dimmed",filter!=="all"&&!keys.includes(filter));
   b.classList.toggle("focused",filter!=="all"&&keys.includes(filter));
 });
 document.querySelector(".compass-v53")?.setAttribute("data-focus",filter);
}
function symbolForStage(s){
 return ({Visage:"◉",Tête:"◉",Poitrine:"♡",Respiration:"↕",Ventre:"●",Estomac:"●",Gorge:"│",Mains:"✋",Bras:"╱",Jambes:"∧",Muscles:"⌁",Yeux:"◌",Peau:"≈",Bouche:"◡",Sens:"✦",Situation:"□","Corps entier":"◎","Bras et jambes":"↔",Mouvement:"→",Énergie:"⚡"})[s]||"•";
}
function shortenQuestion(q){
 return q.replace(/^Est-ce que /,"").replace(/^Ai-je /,"").replace(/^Mon /,"").replace(/^Ma /,"").replace(/^Mes /,"").replace(/\?$/,"");
}
function mapDetail(){
 const k=S.mapKey,s=STATES[k],v=MAP_VISUAL[k];
 const zones=v.zones.filter(z=>["head","face","throat","chest","belly","arms","legs","senses","breath"].includes(z));
 app.innerHTML=`<section class="card map-detail-visual">
   <button class="secondary" onclick="setView('map')">← Retour</button>
   <div class="emotion-hero"><span>${v.icon}</span><div><p class="eyebrow">${esc(s.kind)}</p><h2>${esc(s.name)}</h2></div></div>
   <div class="visual-sequence">
     <div class="sequence-step"><span>◉</span><strong>CORPS</strong><small>${zones.map(zoneLabel).join(" · ")}</small></div>
     <b>→</b>
     <div class="sequence-step"><span>◇</span><strong>FONCTION</strong><small>${esc(s.function)}</small></div>
     <b>→</b>
     <div class="sequence-step"><span>✓</span><strong>ACTION</strong><small>${esc(v.action)}</small></div>
   </div>
   <div class="mini-real-body-and-needs">
     <div class="mini-real-body">${anatomyFigure(zones[0]||"chest")}</div>
     <div class="need-tiles"><h3>Besoins possibles</h3>${s.needs.map(n=>`<div class="need-tile">◇ ${esc(n)}</div>`).join("")}</div>
   </div>
   <h3>Signes recherchés</h3>
   <div class="symptom-pictos">${ALL_QUESTIONS.filter(q=>q.w&&q.w[k]).sort((a,b)=>b.w[k]-a.w[k]).slice(0,8).map(q=>`<div class="symptom-card"><span>${symbolForStage(q.stage)}</span><small>${esc(shortenQuestion(q.q))}</small></div>`).join("")}</div>
 </section>`;
 document.querySelectorAll(".mini-real-body .anatomy-zone").forEach(b=>b.disabled=true);
}
function historyView(){
 const h=history();app.innerHTML=`<section class="card"><p class="eyebrow">HISTORIQUE LOCAL</p><h2>Panoramas enregistrés</h2>${h.length?h.map(x=>`<article class="history-item"><div class="row"><strong>${new Date(x.date).toLocaleString('fr-FR')}</strong><span>${x.intensity}/10</span></div><p>${x.mix.filter(y=>y.pct>0).slice(0,4).map(y=>`${STATES[y.key]?.name} ${y.pct}%`).join(' · ')}</p>${x.context?`<small>${esc(x.context)}</small>`:''}</article>`).join(''):'<p>Aucun panorama enregistré.</p>'}</section>`;
}
function science(){
 app.innerHTML=`<section class="card"><p class="eyebrow">MÉTHODE ET LIMITES</p><h2>Ce que fait réellement la V5</h2>
 <div class="evidence"><h3>1. Priorité aux documents initiaux</h3><p>Les manifestations explicitement présentes dans les fiches de la neuropsychologue reçoivent les poids les plus élevés.</p></div>
 <div class="evidence"><h3>2. Compléments prudents</h3><p>Fréquence cardiaque, tremblements, transpiration, bouche sèche, nausée, larmes et ralentissement sont ajoutés comme indices complémentaires. Ils sont moins pondérés car ils se chevauchent fortement entre émotions.</p></div>
 <div class="evidence"><h3>3. Absence de signal ≠ absence d’émotion</h3><p>Une réponse « Non » ne retire pas de points. Une réponse « Difficile à dire » est traitée comme une donnée manquante et réduit la confiance.</p></div>
 <div class="evidence"><h3>4. Personnalisation nécessaire</h3><p>Les cartes corporelles sont des tendances de groupe. L’historique doit progressivement aider à reconnaître le profil propre de l’utilisateur.</p></div>
 <div class="notice">La V5 est un outil d’auto-observation. Elle n’est ni un test diagnostique, ni un dispositif médical validé.</div></section>`;
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
const dlg=document.getElementById('settingsDialog');
document.getElementById('settings').onclick=()=>{loadSettings();dlg.showModal()};
document.getElementById('saveSettings').onclick=()=>{const o={font:font.value,contrast:contrast.checked,motion:motion.checked};localStorage.setItem(SETTINGS_KEY,JSON.stringify(o));apply(o);dlg.close()};
function loadSettings(){let o={};try{o=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}catch{};font.value=o.font||'normal';contrast.checked=!!o.contrast;motion.checked=!!o.motion;apply(o)}
function apply(o){document.body.classList.toggle('font-large',o.font==='large');document.body.classList.toggle('font-xlarge',o.font==='xlarge');document.body.classList.toggle('high-contrast',!!o.contrast);document.body.classList.toggle('reduce-motion',!!o.motion)}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
loadSettings();render();

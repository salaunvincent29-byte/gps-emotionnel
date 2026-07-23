 'use strict';

const APP_VERSION = '3.0.0';
const HISTORY_KEY = 'gps-emotionnel-history-v3';
const SETTINGS_KEY = 'gps-emotionnel-settings-v3';

const STATES = {
  joy: {
    name: 'Joie', kind: 'Émotion probable',
    function: 'Signale un environnement favorable et favorise l’approche et le partage.'
  },
  anger: {
    name: 'Colère', kind: 'Émotion probable',
    function: 'Mobilise l’énergie pour agir sur un obstacle ou une menace perçue.'
  },
  fear: {
    name: 'Peur', kind: 'Émotion probable',
    function: 'Prépare la fuite ou l’immobilisation rapide face à un danger présent.'
  },
  anxiety: {
    name: 'Anxiété', kind: 'Émotion probable',
    function: 'Maintient la vigilance envers une menace anticipée mais non présente.'
  },
  disgust: {
    name: 'Dégoût', kind: 'Émotion probable',
    function: 'Protège d’un contact ou d’une ingestion potentiellement nocive.'
  },
  sadness: {
    name: 'Tristesse', kind: 'Émotion probable',
    function: 'Favorise le retrait, la récupération et la demande de soutien.'
  },
  shame: {
    name: 'Honte', kind: 'Émotion probable',
    function: 'Signale une transgression sociale perçue et favorise le retrait ou la réparation.'
  },
  calm: {
    name: 'Apaisement', kind: 'État de régulation probable',
    function: 'Restaure les ressources et s’associe à la sécurité et au lien.'
  },
  sensory: {
    name: 'Surcharge sensorielle', kind: 'État non émotionnel possible',
    function: 'Indique surtout un besoin de réduire les stimulations.'
  },
  fatigue: {
    name: 'Fatigue / vide', kind: 'État non émotionnel possible',
    function: 'Décrit principalement l’épuisement, le vide et l’immobilité.'
  }
};

/*
V3 : les questions demandent uniquement une observation simple.
Le répondant ne doit pas interpréter l’émotion ni la fonction.
Oui = poids complet ; Non = 0 ; Difficile à dire = 20 % du poids.
Les coefficients structurent les indices des fiches initiales.
Ils ne constituent pas une échelle clinique validée.
*/
const QUESTIONS = [
  {id:'sound', zone:'Sens', q:'Les sons me gênent-ils plus que d’habitude ?', w:{sensory:4}},
  {id:'light', zone:'Sens', q:'La lumière me gêne-t-elle ?', w:{sensory:4}},
  {id:'silence', zone:'Sens', q:'Ai-je besoin de silence ?', w:{sensory:5}},
  {id:'dark', zone:'Sens', q:'Ai-je besoin d’être dans le noir ?', w:{sensory:4}},
  {id:'touch', zone:'Sens', q:'Un contact ou une texture est-il difficile à supporter ?', w:{sensory:5,disgust:1}},

  {id:'suddenFatigue', zone:'Corps entier', q:'Suis-je soudain très fatigué ?', w:{fatigue:5,sadness:1}},
  {id:'heavyBody', zone:'Corps entier', q:'Mon corps est-il lourd ?', w:{fatigue:4,sadness:4}},
  {id:'still', zone:'Corps entier', q:'Mon corps reste-t-il immobile ?', w:{fatigue:4,fear:1}},
  {id:'empty', zone:'Corps entier', q:'Est-ce que je ressens du vide ?', w:{fatigue:5,sadness:1}},
  {id:'limbsOff', zone:'Bras et jambes', q:'Mes bras ou mes jambes semblent-ils sans énergie ?', w:{fatigue:3,sadness:4}},

  {id:'easyBreath', zone:'Respiration', q:'Est-ce que je respire facilement ?', w:{calm:4,joy:2}},
  {id:'wideBreath', zone:'Respiration', q:'Ma respiration est-elle ample ?', w:{calm:4,joy:2}},
  {id:'softWarmth', zone:'Corps entier', q:'Est-ce que je sens une chaleur douce dans mon corps ?', w:{calm:6}},
  {id:'diffuseWarmth', zone:'Corps entier', q:'Est-ce que je sens de la chaleur dans plusieurs parties du corps ?', w:{joy:4,calm:2}},
  {id:'energyLimbs', zone:'Bras et jambes', q:'Ai-je beaucoup d’énergie dans les bras ou les jambes ?', w:{joy:5,anger:2}},
  {id:'chestHeadActive', zone:'Poitrine ou tête', q:'Est-ce que ma poitrine ou ma tête semblent très actives ?', w:{joy:4}},

  {id:'jaw', zone:'Visage', q:'Ma mâchoire est-elle serrée ?', w:{anger:5}},
  {id:'hands', zone:'Mains', q:'Mes mains sont-elles serrées ?', w:{anger:5}},
  {id:'chestTension', zone:'Poitrine', q:'Est-ce que je sens une tension dans la poitrine ?', w:{anger:3,anxiety:2,fear:2}},
  {id:'armTension', zone:'Bras', q:'Est-ce que je sens une tension dans les bras ?', w:{anger:4}},
  {id:'headTension', zone:'Tête', q:'Est-ce que je sens une tension dans la tête ?', w:{anger:3}},

  {id:'tightChest', zone:'Poitrine', q:'Ma poitrine est-elle serrée ?', w:{fear:4,anxiety:3}},
  {id:'shortBreath', zone:'Respiration', q:'Mon souffle est-il court ?', w:{fear:5,anxiety:3}},
  {id:'blockedBreath', zone:'Respiration', q:'Ma respiration semble-t-elle bloquée ?', w:{fear:5,anxiety:2}},
  {id:'weakLegs', zone:'Jambes', q:'Mes jambes semblent-elles faibles ?', w:{fear:6}},
  {id:'dangerNow', zone:'Situation', q:'Y a-t-il un danger maintenant ?', w:{fear:7}},
  {id:'bellyKnot', zone:'Ventre', q:'Est-ce que je sens un nœud dans le ventre ?', w:{anxiety:5}},
  {id:'oppressedChest', zone:'Poitrine', q:'Ma poitrine semble-t-elle oppressée ?', w:{anxiety:5,fear:2}},
  {id:'futureThreat', zone:'Situation', q:'Est-ce que je pense à un danger qui pourrait arriver plus tard ?', w:{anxiety:7}},

  {id:'throatActive', zone:'Gorge', q:'Est-ce que ma gorge réagit fortement ?', w:{disgust:4}},
  {id:'stomachActive', zone:'Ventre', q:'Est-ce que mon estomac réagit fortement ?', w:{disgust:5}},
  {id:'moveAway', zone:'Mouvement', q:'Mon corps recule-t-il ?', w:{disgust:5,shame:1}},
  {id:'nociveContact', zone:'Situation', q:'Est-ce que je veux éviter un contact ou quelque chose à avaler ?', w:{disgust:7}},

  {id:'throatKnot', zone:'Gorge', q:'Ma gorge est-elle nouée ?', w:{sadness:5,fear:1}},
  {id:'faceWarm', zone:'Visage', q:'Mon visage est-il chaud ?', w:{shame:5,anger:1}},
  {id:'faceRed', zone:'Visage', q:'Mon visage est-il rouge ?', w:{shame:5,anger:1}},
  {id:'bodyWithdraw', zone:'Corps entier', q:'Est-ce que mon corps se replie ?', w:{shame:5,sadness:1}},
  {id:'socialMistake', zone:'Situation', q:'Est-ce que je pense avoir fait quelque chose de mal devant quelqu’un ?', w:{shame:7}}
];

const session = {
  view:'home',
  index:0,
  answers:{},
  scores:{},
  unknownCount:0,
  result:null,
  startedAt:null,
  intensity:5
};

const app = document.getElementById('app');
const settingsDialog = document.getElementById('settingsDialog');

function emptyScores(){
  return Object.fromEntries(Object.keys(STATES).map(key => [key, 0]));
}

function resetSession(){
  session.index = 0;
  session.answers = {};
  session.scores = emptyScores();
  session.unknownCount = 0;
  session.result = null;
  session.startedAt = new Date().toISOString();
  session.intensity = 5;
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function render(){
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === session.view);
  });
  if(session.view === 'home') renderHome();
  if(session.view === 'question') renderQuestion();
  if(session.view === 'result') renderResult();
  if(session.view === 'history') renderHistory();
  if(session.view === 'about') renderAbout();
}

function renderHome(){
  app.innerHTML = `
    <section class="card hero">
      <p class="eyebrow">VERSION 3 — OBSERVER AVANT D’INTERPRÉTER</p>
      <h2>Je décris mon corps. Le GPS propose les hypothèses.</h2>
      <p class="hero-lead">Une seule question courte apparaît à la fois. Il n’est pas nécessaire de connaître le nom de l’émotion.</p>

      <div class="principle" aria-label="Principe de fonctionnement">
        <div>1. Je regarde</div>
        <div>2. Je réponds</div>
        <div>3. Le GPS compare</div>
      </div>

      <div class="notice">
        <strong>Résultat :</strong> un panorama de compatibilité entre plusieurs émotions ou états. Les pourcentages ne mesurent pas biologiquement la quantité d’émotion.
      </div>

      <button id="startBtn" class="primary-btn" type="button">Commencer</button>
      <button id="demoBtn" class="secondary-btn" type="button">Voir comment répondre</button>
      <p class="footer-note">Cet outil soutient l’auto-observation. Il ne remplace pas le suivi d’un professionnel.</p>
    </section>`;
  document.getElementById('startBtn').addEventListener('click', () => {
    resetSession();
    session.view = 'question';
    render();
  });
  document.getElementById('demoBtn').addEventListener('click', () => {
    alert('Exemple : « Ma mâchoire est-elle serrée ? » Répondez Oui seulement si vous pouvez l’observer maintenant. Répondez Difficile à dire si le signal n’est pas clair.');
  });
}

function renderQuestion(){
  const item = QUESTIONS[session.index];
  const progress = Math.round((session.index / QUESTIONS.length) * 100);

  app.innerHTML = `
    <section class="progress-wrap" aria-label="Progression du parcours">
      <div class="progress-label">
        <span>Question ${session.index + 1} sur ${QUESTIONS.length}</span>
        <span>${progress}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
    </section>

    <section class="card question-card">
      <span class="body-focus">${escapeHtml(item.zone)}</span>
      <p class="step-label">Observer maintenant</p>
      <h2>${escapeHtml(item.q)}</h2>
      <p class="question-help">Ne cherchez pas l’émotion. Regardez seulement ce qui est présent maintenant.</p>

      <div class="answers">
        <button class="answer-btn answer-yes" data-answer="yes" type="button">
          <span class="answer-dot"></span><span>Oui</span>
        </button>
        <button class="answer-btn answer-no" data-answer="no" type="button">
          <span class="answer-dot"></span><span>Non</span>
        </button>
        <button class="answer-btn answer-unsure" data-answer="unsure" type="button">
          <span class="answer-dot"></span><span>Difficile à dire</span>
        </button>
      </div>
      <div id="confirmation" aria-live="assertive"></div>
    </section>`;

  document.querySelectorAll('[data-answer]').forEach(btn => {
    btn.addEventListener('click', () => answerQuestion(btn.dataset.answer));
  });
}

function answerQuestion(answer){
  const item = QUESTIONS[session.index];
  session.answers[item.id] = answer;

  if(answer === 'yes'){
    Object.entries(item.w).forEach(([key, weight]) => {
      session.scores[key] += weight;
    });
  } else if(answer === 'unsure'){
    session.unknownCount += 1;
    Object.entries(item.w).forEach(([key, weight]) => {
      session.scores[key] += weight * 0.2;
    });
  }

  const confirmation = document.getElementById('confirmation');
  confirmation.innerHTML = `<div class="confirmation">✓ Réponse notée</div>`;
  document.querySelectorAll('[data-answer]').forEach(btn => btn.disabled = true);

  setTimeout(() => {
    session.index += 1;
    if(session.index >= QUESTIONS.length){
      session.result = calculateMix();
      session.view = 'result';
    }
    render();
  }, 330);
}

function calculateMix(){
  const total = Object.values(session.scores).reduce((sum, value) => sum + value, 0);
  let mix;

  if(total <= 0){
    mix = Object.keys(STATES).map(key => ({key, pct:0, raw:0}));
  } else {
    const exact = Object.entries(session.scores).map(([key, raw]) => ({
      key, raw, exactPct:(raw / total) * 100
    })).sort((a,b) => b.exactPct - a.exactPct);

    const floors = exact.map(item => ({...item, pct:Math.floor(item.exactPct)}));
    let remaining = 100 - floors.reduce((sum, item) => sum + item.pct, 0);

    floors
      .map((item, index) => ({index, fraction:item.exactPct - item.pct}))
      .sort((a,b) => b.fraction - a.fraction)
      .slice(0, remaining)
      .forEach(item => { floors[item.index].pct += 1; });

    mix = floors.map(({key, raw, pct}) => ({key, raw, pct}));
  }

  let confidence = 'Élevée';
  if(session.unknownCount >= 3) confidence = 'Moyenne';
  if(session.unknownCount >= 8) confidence = 'Faible';

  return {mix, confidence};
}

function renderResult(){
  const positive = session.result.mix.filter(item => item.pct > 0);
  if(positive.length === 0){
    app.innerHTML = `
      <section class="card">
        <p class="eyebrow">RÉSULTAT</p>
        <h2>État non déterminé pour le moment</h2>
        <p>Aucun signal suffisamment clair n’a été repéré. Ce résultat est valide.</p>
        <button id="restartBtn" class="primary-btn" type="button">Recommencer plus tard</button>
      </section>`;
    document.getElementById('restartBtn').addEventListener('click', () => {
      session.view = 'home';
      render();
    });
    return;
  }

  const visible = positive.slice(0, 8);
  const main = visible[0];
  const secondary = visible[1];

  app.innerHTML = `
    <section class="card">
      <p class="eyebrow">PANORAMA DU MOMENT</p>
      <h2 class="result-title">${escapeHtml(STATES[main.key].name)} est l’hypothèse principale</h2>
      <p class="result-subtitle">Confiance ergonomique : <strong>${session.result.confidence}</strong></p>

      <div class="mix-list" role="img" aria-label="Panorama indicatif des états compatibles">
        ${visible.map(item => `
          <div class="mix-row">
            <div class="mix-name">${escapeHtml(STATES[item.key].name)}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${item.pct}%"></div></div>
            <div class="mix-value">${item.pct}%</div>
          </div>`).join('')}
      </div>

      <div class="notice">
        Les pourcentages représentent la part relative des indices compatibles avec vos réponses. Ils ne mesurent pas l’intensité biologique des émotions.
      </div>

      <div class="summary-grid">
        <article class="summary-card">
          <h3>${escapeHtml(STATES[main.key].name)}</h3>
          <span class="kind-chip">${escapeHtml(STATES[main.key].kind)}</span>
          <p>${escapeHtml(STATES[main.key].function)}</p>
        </article>
        ${secondary ? `
        <article class="summary-card">
          <h3>${escapeHtml(STATES[secondary.key].name)}</h3>
          <span class="kind-chip">${escapeHtml(STATES[secondary.key].kind)}</span>
          <p>${escapeHtml(STATES[secondary.key].function)}</p>
        </article>` : ''}
      </div>

      <label class="field">
        <span>Intensité globale : <strong id="intensityValue">${session.intensity}</strong>/10</span>
        <input id="intensity" type="range" min="0" max="10" value="${session.intensity}">
      </label>

      <label class="field">
        <span>Situation ou moment</span>
        <input id="context" type="text" maxlength="140" placeholder="Ex. après une réunion">
      </label>

      <label class="field">
        <span>Ce que je remarque ou ce dont j’ai besoin</span>
        <textarea id="note" maxlength="500" placeholder="Note facultative"></textarea>
      </label>

      <button id="saveBtn" class="primary-btn" type="button">Enregistrer ce panorama</button>
      <button id="restartBtn" class="secondary-btn" type="button">Faire un nouveau parcours</button>
    </section>`;

  const intensity = document.getElementById('intensity');
  intensity.addEventListener('input', () => {
    session.intensity = Number(intensity.value);
    document.getElementById('intensityValue').textContent = String(session.intensity);
  });

  document.getElementById('saveBtn').addEventListener('click', saveResult);
  document.getElementById('restartBtn').addEventListener('click', () => {
    resetSession();
    session.view = 'question';
    render();
  });
}

function getHistory(){
  try{
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  }catch{
    return [];
  }
}

function saveResult(){
  const context = document.getElementById('context').value.trim();
  const note = document.getElementById('note').value.trim();
  const history = getHistory();

  history.unshift({
    id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    date: new Date().toISOString(),
    version: APP_VERSION,
    intensity: session.intensity,
    context,
    note,
    confidence: session.result.confidence,
    unknownCount: session.unknownCount,
    mix: session.result.mix.map(item => ({key:item.key, pct:item.pct}))
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
  alert('Panorama enregistré sur cet appareil.');
  session.view = 'history';
  render();
}

function renderHistory(){
  const history = getHistory();

  app.innerHTML = `
    <section class="card">
      <p class="eyebrow">DONNÉES LOCALES</p>
      <h2>Historique</h2>
      <p>Les données restent dans ce navigateur, sauf export volontaire.</p>

      ${history.length ? history.map(item => `
        <article class="history-item">
          <div class="history-top">
            <strong>${new Date(item.date).toLocaleString('fr-FR')}</strong>
            <span>${item.intensity}/10</span>
          </div>
          <div class="history-mix">
            ${item.mix.filter(x => x.pct > 0).slice(0,4).map(x =>
              `${escapeHtml(STATES[x.key]?.name || x.key)} ${x.pct}%`
            ).join(' · ')}
          </div>
          ${item.context ? `<div class="history-mix">${escapeHtml(item.context)}</div>` : ''}
        </article>`).join('') : '<div class="empty">Aucun panorama enregistré.</div>'}

      ${history.length ? `
        <button id="exportBtn" class="secondary-btn" type="button">Exporter en JSON</button>
        <button id="clearBtn" class="secondary-btn" type="button">Effacer tout l’historique</button>` : ''}
    </section>`;

  document.getElementById('exportBtn')?.addEventListener('click', () => downloadJSON(history));
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    if(confirm('Effacer définitivement tout l’historique de cet appareil ?')){
      localStorage.removeItem(HISTORY_KEY);
      render();
    }
  });
}

function renderAbout(){
  app.innerHTML = `
    <section class="card">
      <p class="eyebrow">COMMENT L’OUTIL RAISONNE</p>
      <h2>Vous observez. Le GPS compare.</h2>

      <div class="summary-grid">
        <article class="summary-card">
          <h3>Questions simples</h3>
          <p>Une seule sensation ou observation est demandée par écran.</p>
        </article>
        <article class="summary-card">
          <h3>Pas d’émotion à deviner</h3>
          <p>Les questions ne demandent pas de nommer une émotion ni d’expliquer sa fonction.</p>
        </article>
        <article class="summary-card">
          <h3>Résultat mixte autorisé</h3>
          <p>Plusieurs émotions ou états peuvent être compatibles au même moment.</p>
        </article>
        <article class="summary-card">
          <h3>Incertitude autorisée</h3>
          <p>« Difficile à dire » est une réponse utile. Elle diminue la confiance du résultat sans bloquer le parcours.</p>
        </article>
      </div>

      <div class="notice danger-notice">
        <strong>Prudence :</strong> une douleur thoracique, un malaise, une difficulté respiratoire importante ou un symptôme inhabituel doivent être évalués médicalement et ne doivent pas être attribués automatiquement à une émotion.
      </div>

      <h3>Limites</h3>
      <p>Une même sensation peut accompagner plusieurs émotions. Le panorama est une aide à l’auto-observation et à la discussion avec un professionnel ; il ne constitue pas un diagnostic.</p>

      <h3>Références principales</h3>
      <ul>
        <li>Nummenmaa et al. (2014), cartes corporelles des émotions.</li>
        <li>Kinnaird et al. (2019), alexithymie et autisme.</li>
        <li>Garfinkel et al. (2016), dimensions de l’interoception.</li>
        <li>Quadt et al. (2021), entraînement interoceptif chez l’adulte autiste.</li>
      </ul>
    </section>`;
}

function downloadJSON(data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gps-emotionnel-v3-historique.json';
  link.click();
  URL.revokeObjectURL(url);
}

function loadSettings(){
  try{
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  }catch{
    return {};
  }
}

function applySettings(){
  const settings = loadSettings();
  document.body.classList.toggle('font-large', settings.font === 'large');
  document.body.classList.toggle('font-xlarge', settings.font === 'xlarge');
  document.body.classList.toggle('high-contrast', Boolean(settings.contrast));
  document.body.classList.toggle('reduce-motion', Boolean(settings.motion));

  document.getElementById('fontSizeSelect').value = settings.font || 'normal';
  document.getElementById('contrastToggle').checked = Boolean(settings.contrast);
  document.getElementById('motionToggle').checked = Boolean(settings.motion);
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    session.view = btn.dataset.view;
    render();
  });
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  applySettings();
  settingsDialog.showModal();
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  const settings = {
    font: document.getElementById('fontSizeSelect').value,
    contrast: document.getElementById('contrastToggle').checked,
    motion: document.getElementById('motionToggle').checked
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applySettings();
  settingsDialog.close();
});

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

applySettings();
render();

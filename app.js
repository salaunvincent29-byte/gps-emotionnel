'use strict';

const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'gps-emotionnel-history-v1';
const SETTINGS_KEY = 'gps-emotionnel-settings-v1';

const emotions = {
  sensory: {
    name: 'Surcharge sensorielle',
    category: 'État non émotionnel possible',
    icon: '◉',
    functionText: 'Aucune fonction adaptative précise n’est indiquée dans les fiches. Les besoins explicitement cités sont le silence, l’obscurité et l’arrêt d’un contact ou d’une texture insupportable.',
    cues: ['sons perçus plus forts', 'lumière difficile à supporter', 'besoin de silence ou d’obscurité', 'contact ou texture insupportable', 'épaules remontées'],
    fallback: 'fatigue1'
  },
  fatigue: {
    name: 'Fatigue / vide',
    category: 'État non émotionnel possible',
    icon: '▣',
    functionText: 'Aucune fonction adaptative précise n’est indiquée dans les fiches. Les formulations associées sont : grande fatigue soudaine, immobilité, vide, « à plat » ou anesthésié·e.',
    cues: ['grande fatigue soudaine', 'corps lourd', 'membres éteints', 'immobilité', 'vide', 'à plat, anesthésié·e ou épuisé·e'],
    fallback: 'activation'
  },
  calm: {
    name: 'Apaisement',
    category: 'État affectif ou de régulation probable',
    icon: '◡',
    functionText: 'Restaure les ressources ; associe la sécurité et le lien.',
    cues: ['chaleur douce et homogène', 'respiration ample'],
    fallback: 'sadness1'
  },
  joy: {
    name: 'Joie',
    category: 'Émotion probable',
    icon: '☺',
    functionText: 'Signale un environnement favorable ; pousse à l’approche et au partage.',
    cues: ['chaleur diffuse', 'poitrine et tête activées', 'énergie dans les membres', 'respiration ample'],
    fallback: 'anger1'
  },
  anger: {
    name: 'Colère',
    category: 'Émotion probable',
    icon: '●',
    functionText: 'Mobilise l’énergie pour lever un obstacle ou une menace perçue.',
    cues: ['tension thorax / bras / tête', 'chaleur', 'mâchoire serrée', 'poings fermés'],
    fallback: 'fear1'
  },
  fear: {
    name: 'Peur',
    category: 'Émotion probable',
    icon: '△',
    functionText: 'Prépare la fuite ou l’immobilisation rapide face à un danger.',
    cues: ['poitrine serrée', 'jambes qui se dérobent', 'souffle court'],
    fallback: 'anxiety1'
  },
  anxiety: {
    name: 'Anxiété',
    category: 'Émotion probable',
    icon: '≈',
    functionText: 'Maintient une vigilance envers une menace anticipée, non présente.',
    cues: ['poitrine oppressée', 'ventre noué', 'membres plus retirés'],
    fallback: 'disgust1'
  },
  disgust: {
    name: 'Dégoût',
    category: 'Émotion probable',
    icon: '⌁',
    functionText: 'Protège d’une ingestion ou d’un contact potentiellement nocif.',
    cues: ['gorge et estomac activés', 'recul du reste du corps'],
    fallback: 'shame1'
  },
  sadness: {
    name: 'Tristesse',
    category: 'Émotion probable',
    icon: '⌄',
    functionText: 'Favorise le retrait, la récupération et la demande de soutien.',
    cues: ['corps lourd', 'membres éteints', 'gorge nouée'],
    fallback: 'joy1'
  },
  shame: {
    name: 'Honte',
    category: 'Émotion probable',
    icon: '○',
    functionText: 'Signale une transgression sociale perçue ; pousse à réparer ou se retirer.',
    cues: ['chaleur ou rougeur au visage', 'reste du corps qui se retire'],
    fallback: 'indeterminate'
  }
};

const nodes = {
  intro: {
    kind: 'intro',
    kicker: 'Besoin d’identification',
    title: 'J’ai besoin de comprendre ce que je ressens.',
    text: 'Je m’arrête quelques secondes et j’observe le changement corporel le plus net.',
    details: ['Je ne cherche pas encore un mot d’émotion.', 'Je repère d’abord ce qui a changé dans mon corps.'],
    icon: '◎',
    next: 'safety'
  },
  safety: {
    kind: 'question',
    kicker: 'Vérification préalable',
    title: 'Ce signal est-il inhabituel, brutal ou médicalement inquiétant ?',
    text: 'Une douleur thoracique, un malaise ou une difficulté respiratoire importante ne doivent pas être classés automatiquement comme une émotion.',
    details: ['En cas de doute médical persistant, interrompre le parcours et demander un avis approprié.'],
    icon: '!',
    yes: 'safetyStop',
    no: 'sensory1',
    unknown: 'sensory1'
  },
  safetyStop: {
    kind: 'stop',
    kicker: 'Priorité à la sécurité',
    title: 'J’interromps le GPS émotionnel.',
    text: 'Je recherche une évaluation médicale appropriée si le signal est inquiétant ou persistant.',
    icon: '!',
    result: 'stop'
  },
  sensory1: {
    kind: 'question',
    kicker: 'Étape 1 • Sensations sensorielles',
    title: 'Une stimulation sensorielle est-elle devenue difficile à supporter ?',
    text: 'Je pense aux sons, à la lumière, au contact ou aux textures.',
    details: ['sons perçus plus forts', 'lumière difficile à supporter', 'contact ou texture insupportable'],
    icon: '◉',
    yes: 'sensory2',
    no: 'fatigue1',
    unknown: 'fatigue1'
  },
  sensory2: {
    kind: 'question',
    kicker: 'Étape 2 • Confirmation sensorielle',
    title: 'Ai-je besoin de silence ou d’obscurité ?',
    text: 'Je réponds selon le besoin corporel présent maintenant.',
    details: ['Le besoin de silence ou d’obscurité figure explicitement dans la fiche des sensations.'],
    icon: '◉',
    yes: { candidate: 'sensory' },
    no: 'sensory3',
    unknown: 'sensory3'
  },
  sensory3: {
    kind: 'question',
    kicker: 'Étape 3 • Confirmation sensorielle',
    title: 'Un contact ou une texture est-il insupportable ?',
    text: 'Je distingue une gêne sensorielle d’une émotion déjà nommée.',
    details: ['contact ou texture insupportable'],
    icon: '◉',
    yes: { candidate: 'sensory' },
    no: 'fatigue1',
    unknown: 'fatigue1'
  },
  fatigue1: {
    kind: 'question',
    kicker: 'Étape 4 • Ressources corporelles',
    title: 'Une grande fatigue soudaine domine-t-elle ?',
    text: 'Je cherche un épuisement global plutôt qu’une émotion précise.',
    details: ['grande fatigue soudaine', 'épuisé·e, vidé·e', 'à plat, anesthésié·e'],
    icon: '▣',
    yes: 'fatigue2',
    no: 'activation',
    unknown: 'activation'
  },
  fatigue2: {
    kind: 'question',
    kicker: 'Étape 5 • Ressources corporelles',
    title: 'Mon corps est-il lourd ou immobilisé ?',
    text: 'Je vérifie la lourdeur, le vide ou le corps « figé ».',
    details: ['corps lourd', 'immobilité / corps « figé »', 'vide'],
    icon: '▣',
    yes: { candidate: 'fatigue' },
    no: 'activation',
    unknown: 'activation'
  },
  activation: {
    kind: 'question',
    kicker: 'Étape 6 • Niveau d’activation',
    title: 'Mon corps est-il globalement ralenti ou peu activé ?',
    text: 'Je pense à la lourdeur, à l’immobilité ou à une respiration lente et ample.',
    details: ['Cette question oriente vers apaisement ou tristesse. Une réponse négative oriente vers les états plus activés.'],
    icon: '↕',
    yes: 'lowResp',
    no: 'joy1',
    unknown: 'lowResp'
  },
  lowResp: {
    kind: 'question',
    kicker: 'Branche faible activation',
    title: 'Ma respiration est-elle ample ?',
    text: 'J’observe simplement l’amplitude de ma respiration.',
    details: ['respiration ample'],
    icon: '◡',
    yes: 'lowWarm',
    no: 'sadness1',
    unknown: 'sadness1'
  },
  lowWarm: {
    kind: 'question',
    kicker: 'Branche faible activation',
    title: 'La chaleur est-elle douce et homogène ?',
    text: 'Je vérifie si la sensation est diffuse, stable et non tendue.',
    details: ['chaleur douce et homogène'],
    icon: '◡',
    yes: { candidate: 'calm' },
    no: 'sadness1',
    unknown: 'sadness1'
  },
  sadness1: {
    kind: 'question',
    kicker: 'Branche faible activation',
    title: 'Mon corps est-il lourd ?',
    text: 'Je cherche une lourdeur globale plutôt qu’une tension localisée.',
    details: ['corps lourd', 'membres éteints'],
    icon: '⌄',
    yes: 'sadness2',
    no: 'joy1',
    unknown: 'joy1'
  },
  sadness2: {
    kind: 'question',
    kicker: 'Branche faible activation',
    title: 'Ma gorge est-elle nouée ?',
    text: 'Je vérifie la présence d’un nœud ou d’une difficulté à laisser passer la respiration ou la parole.',
    details: ['gorge nouée'],
    icon: '⌄',
    yes: 'sadness3',
    no: 'joy1',
    unknown: 'joy1'
  },
  sadness3: {
    kind: 'question',
    kicker: 'Validation fonctionnelle',
    title: 'Mon corps semble-t-il chercher le retrait, la récupération ou du soutien ?',
    text: 'Je vérifie la fonction proposée avant de retenir l’hypothèse.',
    details: ['Fonction de la tristesse : favoriser le retrait, la récupération et la demande de soutien.'],
    icon: '⌄',
    yes: { candidate: 'sadness' },
    no: 'joy1',
    unknown: { candidate: 'sadness' }
  },
  joy1: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Ma poitrine ou ma tête semblent-elles activées ?',
    text: 'Je cherche une activation sans tension dominante.',
    details: ['poitrine et tête activées'],
    icon: '☺',
    yes: 'joy2',
    no: 'anger1',
    unknown: 'anger1'
  },
  joy2: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Ai-je de l’énergie dans les membres ?',
    text: 'Je repère une énergie disponible pour bouger ou aller vers quelque chose.',
    details: ['énergie dans les membres'],
    icon: '☺',
    yes: 'joy3',
    no: 'anger1',
    unknown: 'anger1'
  },
  joy3: {
    kind: 'question',
    kicker: 'Validation fonctionnelle',
    title: 'Mon corps tend-il vers l’approche ou le partage ?',
    text: 'Je vérifie si l’élan va vers quelque chose ou quelqu’un.',
    details: ['Fonction de la joie : signaler un environnement favorable et pousser à l’approche et au partage.'],
    icon: '☺',
    yes: { candidate: 'joy' },
    no: 'anger1',
    unknown: 'anger1'
  },
  anger1: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Ma mâchoire est-elle serrée ?',
    text: 'Je cherche une contraction nette du visage.',
    details: ['mâchoire serrée'],
    icon: '●',
    yes: 'anger2',
    no: 'fear1',
    unknown: 'fear1'
  },
  anger2: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Mes mains se ferment-elles ?',
    text: 'Je vérifie si les mains ou les poings se contractent.',
    details: ['mains qui se ferment', 'poings fermés'],
    icon: '●',
    yes: 'anger3',
    no: 'fear1',
    unknown: 'fear1'
  },
  anger3: {
    kind: 'question',
    kicker: 'Validation fonctionnelle',
    title: 'Mon corps mobilise-t-il de l’énergie contre un obstacle ou une menace ?',
    text: 'Je vérifie la direction de l’énergie corporelle.',
    details: ['Fonction de la colère : mobiliser l’énergie pour lever un obstacle ou une menace perçue.'],
    icon: '●',
    yes: { candidate: 'anger' },
    no: 'fear1',
    unknown: 'fear1'
  },
  fear1: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Ma poitrine est-elle serrée ou oppressée ?',
    text: 'Je cherche une pression ou un resserrement thoracique.',
    details: ['poitrine serrée', 'poitrine oppressée'],
    icon: '△',
    yes: 'fear2',
    no: 'disgust1',
    unknown: 'disgust1'
  },
  fear2: {
    kind: 'question',
    kicker: 'Branche peur / anxiété',
    title: 'Mon souffle est-il court ou bloqué ?',
    text: 'Je vérifie la respiration avant de distinguer peur et anxiété.',
    details: ['souffle court', 'respiration bloquée'],
    icon: '△',
    yes: 'threatPresent',
    no: 'anxiety1',
    unknown: 'anxiety1'
  },
  threatPresent: {
    kind: 'question',
    kicker: 'Différenciation peur / anxiété',
    title: 'La menace est-elle présente maintenant ?',
    text: 'Je distingue un danger actuel d’une menace anticipée.',
    details: ['Peur : danger présent.', 'Anxiété : menace anticipée, non présente.'],
    icon: '△',
    yes: { candidate: 'fear' },
    no: 'threatAnticipated',
    unknown: 'threatAnticipated'
  },
  threatAnticipated: {
    kind: 'question',
    kicker: 'Différenciation peur / anxiété',
    title: 'La menace est-elle anticipée mais non présente ?',
    text: 'Je vérifie si mon corps se prépare à quelque chose qui n’est pas en train de se produire.',
    details: ['Fonction de l’anxiété : maintenir une vigilance envers une menace anticipée, non présente.'],
    icon: '≈',
    yes: { candidate: 'anxiety' },
    no: 'disgust1',
    unknown: 'disgust1'
  },
  anxiety1: {
    kind: 'question',
    kicker: 'Branche anxiété',
    title: 'Mon ventre est-il noué ?',
    text: 'Je cherche un nœud ou une boule dans le ventre.',
    details: ['ventre noué', 'nœud ou boule au ventre'],
    icon: '≈',
    yes: 'anxiety2',
    no: 'disgust1',
    unknown: 'disgust1'
  },
  anxiety2: {
    kind: 'question',
    kicker: 'Branche anxiété',
    title: 'Mes membres sont-ils plus retirés ?',
    text: 'Je vérifie si mon corps se resserre ou se met en retrait.',
    details: ['membres plus retirés'],
    icon: '≈',
    yes: 'anxiety3',
    no: 'disgust1',
    unknown: 'disgust1'
  },
  anxiety3: {
    kind: 'question',
    kicker: 'Validation fonctionnelle',
    title: 'Mon corps maintient-il une vigilance envers une menace anticipée ?',
    text: 'Je vérifie la fonction proposée avant de retenir l’hypothèse.',
    details: ['menace anticipée, non présente'],
    icon: '≈',
    yes: { candidate: 'anxiety' },
    no: 'disgust1',
    unknown: { candidate: 'anxiety' }
  },
  disgust1: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Ma gorge ou mon estomac semblent-ils activés ?',
    text: 'Je cherche une activation viscérale centrée sur la gorge ou l’estomac.',
    details: ['gorge et estomac activés'],
    icon: '⌁',
    yes: 'disgust2',
    no: 'shame1',
    unknown: 'shame1'
  },
  disgust2: {
    kind: 'question',
    kicker: 'Branche dégoût',
    title: 'Le reste de mon corps recule-t-il ?',
    text: 'Je vérifie un mouvement de recul ou d’éloignement.',
    details: ['recul du reste du corps'],
    icon: '⌁',
    yes: 'disgust3',
    no: 'shame1',
    unknown: 'shame1'
  },
  disgust3: {
    kind: 'question',
    kicker: 'Validation fonctionnelle',
    title: 'Mon corps cherche-t-il à éviter un contact ou une ingestion perçue comme nocive ?',
    text: 'Je vérifie la fonction protectrice proposée.',
    details: ['Fonction du dégoût : protéger d’une ingestion ou d’un contact potentiellement nocif.'],
    icon: '⌁',
    yes: { candidate: 'disgust' },
    no: 'shame1',
    unknown: 'shame1'
  },
  shame1: {
    kind: 'question',
    kicker: 'Branche forte activation',
    title: 'Mon visage est-il chaud ou rouge ?',
    text: 'Je cherche une chaleur ou une rougeur faciale.',
    details: ['chaleur / rougeur au visage'],
    icon: '○',
    yes: 'shame2',
    no: 'indeterminate',
    unknown: 'indeterminate'
  },
  shame2: {
    kind: 'question',
    kicker: 'Branche honte',
    title: 'Le reste de mon corps se retire-t-il ?',
    text: 'Je vérifie si le corps se met en retrait.',
    details: ['reste du corps qui se retire'],
    icon: '○',
    yes: 'shame3',
    no: 'indeterminate',
    unknown: 'indeterminate'
  },
  shame3: {
    kind: 'question',
    kicker: 'Validation fonctionnelle',
    title: 'Ai-je la perception d’une transgression sociale ?',
    text: 'Je vérifie la fonction proposée avant de retenir l’hypothèse.',
    details: ['Fonction de la honte : signaler une transgression sociale perçue et pousser à réparer ou se retirer.'],
    icon: '○',
    yes: { candidate: 'shame' },
    no: 'indeterminate',
    unknown: { candidate: 'shame' }
  },
  indeterminate: {
    kind: 'indeterminate',
    kicker: 'Sortie autorisée',
    title: 'L’état n’est pas déterminé pour le moment.',
    text: 'Je peux noter mes sensations, réessayer plus tard ou demander du soutien.',
    details: ['Une sortie indéterminée est préférable à une étiquette forcée.'],
    icon: '?'
  }
};

const dom = {
  tabs: [...document.querySelectorAll('.tab')],
  views: [...document.querySelectorAll('.view')],
  stepLabel: document.getElementById('stepLabel'),
  uncertaintyChip: document.getElementById('uncertaintyChip'),
  questionIcon: document.getElementById('questionIcon'),
  questionKicker: document.getElementById('questionKicker'),
  title: document.getElementById('journeyTitle'),
  text: document.getElementById('questionText'),
  details: document.getElementById('questionDetails'),
  detailsContent: document.getElementById('detailsContent'),
  answerButtons: document.getElementById('answerButtons'),
  candidatePanel: document.getElementById('candidatePanel'),
  resultPanel: document.getElementById('resultPanel'),
  backButton: document.getElementById('backButton'),
  restartButton: document.getElementById('restartButton'),
  installButton: document.getElementById('installButton'),
  historyList: document.getElementById('historyList'),
  historyEmpty: document.getElementById('historyEmpty'),
  clearHistoryButton: document.getElementById('clearHistoryButton'),
  exportCsvButton: document.getElementById('exportCsvButton'),
  exportJsonButton: document.getElementById('exportJsonButton'),
  largeTextToggle: document.getElementById('largeTextToggle'),
  contrastToggle: document.getElementById('contrastToggle'),
  motionToggle: document.getElementById('motionToggle'),
  toast: document.getElementById('toast')
};

const state = {
  nodeId: 'intro',
  history: [],
  answers: [],
  unknownCount: 0,
  currentCandidate: null,
  accepted: [],
  candidateConfidence: null,
  secondaryMode: false,
  installPrompt: null
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getNode() {
  return nodes[state.nodeId];
}

function render() {
  const node = getNode();
  dom.candidatePanel.classList.add('hidden');
  dom.resultPanel.classList.add('hidden');
  dom.answerButtons.classList.remove('hidden');
  dom.details.open = false;

  dom.stepLabel.textContent = state.secondaryMode ? 'Recherche d’une émotion secondaire' : labelForNode(state.nodeId);
  dom.uncertaintyChip.textContent = `${state.unknownCount} « ne sais pas »`;
  dom.questionIcon.textContent = node.icon || '◎';
  dom.questionKicker.textContent = node.kicker || '';
  dom.title.textContent = node.title || '';
  dom.text.textContent = node.text || '';
  dom.detailsContent.innerHTML = listHtml(node.details || []);
  dom.details.classList.toggle('hidden', !(node.details && node.details.length));
  dom.backButton.disabled = state.history.length === 0;

  if (node.kind === 'intro') {
    renderIntro(node);
  } else if (node.kind === 'stop') {
    renderStop(node);
  } else if (node.kind === 'indeterminate') {
    renderIndeterminate(node);
  } else if (node.kind === 'functionValidation') {
    renderFunctionValidation();
  } else if (node.kind === 'secondaryCheck') {
    renderSecondaryCheck();
  } else if (node.kind === 'final') {
    renderFinal();
  }

  window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduce-motion') ? 'auto' : 'smooth' });
}

function renderIntro(node) {
  dom.answerButtons.classList.add('hidden');
  dom.candidatePanel.classList.remove('hidden');
  dom.candidatePanel.innerHTML = `
    <p class="candidate-tag">Parcours guidé</p>
    <h3>Je pars des sensations corporelles, pas d’un mot d’émotion.</h3>
    <p>Le parcours affichera une seule question à la fois. Les réponses possibles seront toujours : Oui, Non ou Je ne sais pas.</p>
    <button id="startJourney" class="primary-button" type="button">Commencer</button>
  `;
  document.getElementById('startJourney').addEventListener('click', () => goTo(node.next, 'start'));
}

function renderStop(node) {
  dom.answerButtons.classList.add('hidden');
  dom.candidatePanel.classList.remove('hidden');
  dom.candidatePanel.innerHTML = `
    <p class="candidate-tag">Sécurité</p>
    <h3>${escapeHtml(node.title)}</h3>
    <p>${escapeHtml(node.text)}</p>
    <button id="stopRestart" class="primary-button" type="button">Revenir au départ</button>
  `;
  document.getElementById('stopRestart').addEventListener('click', restart);
}

function renderIndeterminate(node) {
  dom.answerButtons.classList.add('hidden');
  dom.candidatePanel.classList.remove('hidden');
  dom.candidatePanel.innerHTML = `
    <p class="candidate-tag">Hypothèse non déterminée</p>
    <h3>${escapeHtml(node.title)}</h3>
    <p>${escapeHtml(node.text)}</p>
    <button id="finishIndeterminate" class="primary-button" type="button">Noter ce résultat</button>
  `;
  document.getElementById('finishIndeterminate').addEventListener('click', () => {
    state.accepted.push({ id: 'indeterminate', confidence: confidenceLabel(), functionValidated: false });
    showFinalNode();
  });
}

function renderFunctionValidation() {
  const emotion = emotions[state.currentCandidate];
  dom.questionIcon.textContent = emotion.icon;
  dom.questionKicker.textContent = 'Vérification de cohérence';
  dom.title.textContent = `${emotion.category} : ${emotion.name}`;
  dom.text.textContent = 'La fonction proposée correspond-elle à ce que mon corps semble essayer de faire ?';
  dom.details.classList.remove('hidden');
  dom.detailsContent.innerHTML = `
    <p><strong>Fonction proposée :</strong> ${escapeHtml(emotion.functionText)}</p>
    ${listHtml(emotion.cues)}
  `;
  dom.candidatePanel.classList.remove('hidden');
  dom.candidatePanel.innerHTML = `
    <p class="candidate-tag">Hypothèse provisoire</p>
    <h3>${escapeHtml(emotion.name)}</h3>
    <p>${escapeHtml(emotion.functionText)}</p>
  `;
}

function renderSecondaryCheck() {
  dom.questionIcon.textContent = '↺';
  dom.questionKicker.textContent = 'Recherche d’un état mixte';
  dom.title.textContent = 'Une autre configuration corporelle distincte est-elle encore présente ?';
  dom.text.textContent = 'Une seconde émotion ou un état non émotionnel peut coexister avec la première hypothèse.';
  dom.details.classList.remove('hidden');
  dom.detailsContent.innerHTML = '<p>Exemples possibles : surcharge sensorielle avec anxiété ; colère avec honte ; tristesse avec fatigue.</p>';
}

function renderFinal() {
  dom.answerButtons.classList.add('hidden');
  dom.details.classList.add('hidden');
  dom.questionIcon.textContent = '✓';
  dom.questionKicker.textContent = 'Fin du parcours';
  dom.title.textContent = 'Je conserve une ou plusieurs hypothèses utiles.';
  dom.text.textContent = 'Je peux préciser l’intensité et ajouter une note pour construire mon dictionnaire corporel personnel.';
  dom.resultPanel.classList.remove('hidden');

  const acceptedHtml = state.accepted.map((item, index) => {
    if (item.id === 'indeterminate') {
      return `<div class="result-emotion"><strong>État non déterminé</strong><p>Réessayer plus tard ou demander du soutien.</p></div>`;
    }
    const emotion = emotions[item.id];
    const role = index === 0 ? 'Hypothèse principale' : 'Hypothèse secondaire';
    return `<div class="result-emotion">
      <small>${role}</small><br>
      <strong>${escapeHtml(emotion.name)}</strong>
      <p>${escapeHtml(emotion.functionText)}</p>
    </div>`;
  }).join('');

  dom.resultPanel.innerHTML = `
    <h3>Résultat du parcours</h3>
    <div class="result-emotions">${acceptedHtml}</div>
    <div class="result-meta">
      <div class="metric"><small>Confiance de parcours</small><strong>${confidenceLabel()}</strong></div>
      <div class="metric"><small>Réponses « ne sais pas »</small><strong>${state.unknownCount}</strong></div>
    </div>
    <div class="result-form">
      <label for="intensityRange">Intensité actuelle : <output id="intensityOutput">5</output>/10</label>
      <input id="intensityRange" type="range" min="0" max="10" value="5" step="1">
      <label for="resultNote">Note personnelle
        <textarea id="resultNote" placeholder="Ex. : mâchoire serrée, poitrine tendue, besoin de silence..."></textarea>
      </label>
      <button id="saveResult" class="primary-button" type="button">Enregistrer sur cet appareil</button>
      <button id="newJourney" class="secondary-button" type="button">Nouveau parcours</button>
    </div>
  `;

  const range = document.getElementById('intensityRange');
  const output = document.getElementById('intensityOutput');
  range.addEventListener('input', () => { output.textContent = range.value; });
  document.getElementById('saveResult').addEventListener('click', () => saveResult(Number(range.value), document.getElementById('resultNote').value));
  document.getElementById('newJourney').addEventListener('click', restart);
}

function listHtml(items) {
  if (!items.length) return '';
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function labelForNode(id) {
  if (id === 'intro') return 'Départ';
  if (id === 'functionValidation') return 'Validation de l’hypothèse';
  if (id === 'secondaryCheck') return 'État mixte';
  if (id === 'final') return 'Résultat';
  if (id === 'indeterminate') return 'Sortie indéterminée';
  const count = state.answers.length + 1;
  return `Question ${count}`;
}

function pushSnapshot() {
  state.history.push({
    nodeId: state.nodeId,
    answers: structuredClone(state.answers),
    unknownCount: state.unknownCount,
    currentCandidate: state.currentCandidate,
    accepted: structuredClone(state.accepted),
    candidateConfidence: state.candidateConfidence,
    secondaryMode: state.secondaryMode
  });
}

function restoreSnapshot(snapshot) {
  state.nodeId = snapshot.nodeId;
  state.answers = snapshot.answers;
  state.unknownCount = snapshot.unknownCount;
  state.currentCandidate = snapshot.currentCandidate;
  state.accepted = snapshot.accepted;
  state.candidateConfidence = snapshot.candidateConfidence;
  state.secondaryMode = snapshot.secondaryMode;
  render();
}

function goTo(target, answer) {
  pushSnapshot();
  state.answers.push({ node: state.nodeId, answer, at: new Date().toISOString() });
  state.nodeId = target;
  render();
}

function handleAnswer(answer) {
  const node = getNode();

  if (answer === 'unknown') {
    state.unknownCount += 1;
  }

  if (state.nodeId === 'functionValidation') {
    handleFunctionValidation(answer);
    return;
  }

  if (state.nodeId === 'secondaryCheck') {
    handleSecondaryCheck(answer);
    return;
  }

  const target = node[answer];
  if (!target) return;

  if (typeof target === 'object' && target.candidate) {
    pushSnapshot();
    state.answers.push({ node: state.nodeId, answer, at: new Date().toISOString() });
    state.currentCandidate = target.candidate;
    state.candidateConfidence = answer === 'unknown' ? 'possible' : 'probable';
    state.nodeId = 'functionValidation';
    ensureDynamicNodes();
    render();
    return;
  }

  goTo(target, answer);
}

function ensureDynamicNodes() {
  if (!nodes.functionValidation) {
    nodes.functionValidation = { kind: 'functionValidation', title: '', text: '', details: [], icon: '?' };
  }
  if (!nodes.secondaryCheck) {
    nodes.secondaryCheck = { kind: 'secondaryCheck', title: '', text: '', details: [], icon: '↺' };
  }
  if (!nodes.final) {
    nodes.final = { kind: 'final', title: '', text: '', details: [], icon: '✓' };
  }
}

function handleFunctionValidation(answer) {
  const emotion = emotions[state.currentCandidate];
  pushSnapshot();
  state.answers.push({ node: 'functionValidation', answer, candidate: state.currentCandidate, at: new Date().toISOString() });

  if (answer === 'yes') {
    acceptCurrentCandidate(true);
    state.nodeId = 'secondaryCheck';
  } else if (answer === 'no') {
    const fallback = emotion.fallback || 'indeterminate';
    state.currentCandidate = null;
    state.candidateConfidence = null;
    state.nodeId = fallback;
  } else {
    acceptCurrentCandidate(false);
    state.nodeId = 'secondaryCheck';
  }
  render();
}

function acceptCurrentCandidate(functionValidated) {
  if (!state.currentCandidate) return;
  const alreadyPresent = state.accepted.some(item => item.id === state.currentCandidate);
  if (!alreadyPresent) {
    state.accepted.push({
      id: state.currentCandidate,
      confidence: state.candidateConfidence || 'possible',
      functionValidated
    });
  }
  state.currentCandidate = null;
  state.candidateConfidence = null;
}

function handleSecondaryCheck(answer) {
  pushSnapshot();
  state.answers.push({ node: 'secondaryCheck', answer, at: new Date().toISOString() });

  if (answer === 'yes') {
    state.secondaryMode = true;
    state.nodeId = 'sensory1';
  } else {
    state.nodeId = 'final';
  }
  render();
}

function showFinalNode() {
  pushSnapshot();
  state.nodeId = 'final';
  ensureDynamicNodes();
  render();
}

function confidenceLabel() {
  if (state.unknownCount <= 1) return 'Élevée pour ce parcours';
  if (state.unknownCount === 2) return 'Moyenne pour ce parcours';
  return 'Faible pour ce parcours';
}

function restart() {
  state.nodeId = 'intro';
  state.history = [];
  state.answers = [];
  state.unknownCount = 0;
  state.currentCandidate = null;
  state.accepted = [];
  state.candidateConfidence = null;
  state.secondaryMode = false;
  render();
}

function saveResult(intensity, note) {
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    emotions: state.accepted.map(item => item.id),
    labels: state.accepted.map(item => item.id === 'indeterminate' ? 'État non déterminé' : emotions[item.id].name),
    intensity,
    uncertaintyCount: state.unknownCount,
    confidence: confidenceLabel(),
    note: note.trim(),
    answers: state.answers,
    appVersion: APP_VERSION
  };
  const history = loadHistory();
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
  showToast('Observation enregistrée sur cet appareil.');
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderHistory() {
  const history = loadHistory();
  dom.historyEmpty.classList.toggle('hidden', history.length > 0);
  dom.historyList.innerHTML = history.map(entry => {
    const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt));
    return `<article class="history-item">
      <h3>${escapeHtml((entry.labels || []).join(' + ') || 'État non déterminé')}</h3>
      <p>${escapeHtml(date)}</p>
      ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ''}
      <div class="history-meta">
        <span class="status-chip">Intensité ${escapeHtml(entry.intensity)}/10</span>
        <span class="status-chip neutral">${escapeHtml(entry.confidence)}</span>
        <span class="status-chip neutral">${escapeHtml(entry.uncertaintyCount)} incertitude(s)</span>
      </div>
    </article>`;
  }).join('');
}

function exportHistory(format) {
  const history = loadHistory();
  if (!history.length) {
    showToast('Aucune observation à exporter.');
    return;
  }
  let content;
  let mime;
  let filename;
  if (format === 'json') {
    content = JSON.stringify(history, null, 2);
    mime = 'application/json';
    filename = 'gps-emotionnel-historique.json';
  } else {
    const rows = [['date', 'hypotheses', 'intensite', 'incertitudes', 'confiance', 'note']];
    history.forEach(entry => rows.push([
      entry.createdAt,
      (entry.labels || []).join(' + '),
      entry.intensity,
      entry.uncertaintyCount,
      entry.confidence,
      entry.note || ''
    ]));
    content = rows.map(row => row.map(csvCell).join(';')).join('\n');
    mime = 'text/csv;charset=utf-8';
    filename = 'gps-emotionnel-historique.csv';
  }
  downloadBlob(content, mime, filename);
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  window.setTimeout(() => dom.toast.classList.remove('show'), 2600);
}

function switchView(viewId) {
  dom.tabs.forEach(tab => {
    const active = tab.dataset.view === viewId;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
  });
  dom.views.forEach(view => view.classList.toggle('active', view.id === `${viewId}View`));
  if (viewId === 'history') renderHistory();
}

function loadSettings() {
  let settings = {};
  try { settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { settings = {}; }
  dom.largeTextToggle.checked = Boolean(settings.largeText);
  dom.contrastToggle.checked = Boolean(settings.highContrast);
  dom.motionToggle.checked = Boolean(settings.reduceMotion);
  applySettings();
}

function applySettings() {
  document.body.classList.toggle('large-text', dom.largeTextToggle.checked);
  document.body.classList.toggle('high-contrast', dom.contrastToggle.checked);
  document.body.classList.toggle('reduce-motion', dom.motionToggle.checked);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    largeText: dom.largeTextToggle.checked,
    highContrast: dom.contrastToggle.checked,
    reduceMotion: dom.motionToggle.checked
  }));
}

function setupInstall() {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    state.installPrompt = event;
    dom.installButton.classList.remove('hidden');
  });
  dom.installButton.addEventListener('click', async () => {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    await state.installPrompt.userChoice;
    state.installPrompt = null;
    dom.installButton.classList.add('hidden');
  });
}

function setupEvents() {
  document.querySelectorAll('.answer').forEach(button => {
    button.addEventListener('click', () => handleAnswer(button.dataset.answer));
  });
  dom.backButton.addEventListener('click', () => {
    const snapshot = state.history.pop();
    if (snapshot) restoreSnapshot(snapshot);
  });
  dom.restartButton.addEventListener('click', restart);
  dom.tabs.forEach(tab => tab.addEventListener('click', () => switchView(tab.dataset.view)));
  dom.clearHistoryButton.addEventListener('click', () => {
    if (window.confirm('Effacer définitivement l’historique conservé sur cet appareil ?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
      showToast('Historique effacé.');
    }
  });
  dom.exportCsvButton.addEventListener('click', () => exportHistory('csv'));
  dom.exportJsonButton.addEventListener('click', () => exportHistory('json'));
  [dom.largeTextToggle, dom.contrastToggle, dom.motionToggle].forEach(input => input.addEventListener('change', applySettings));
  document.addEventListener('keydown', event => {
    if (!document.getElementById('journeyView').classList.contains('active')) return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (event.key === '1') handleAnswer('yes');
    if (event.key === '2') handleAnswer('no');
    if (event.key === '3') handleAnswer('unknown');
  });
}

ensureDynamicNodes();
setupEvents();
setupInstall();
loadSettings();
renderHistory();
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

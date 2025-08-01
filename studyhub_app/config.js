// Configuration StudyHub
window.StudyHubConfig = {
  // Configuration Firebase (mode local par défaut)
  firebase: {
    apiKey: null, // Désactivé pour le mode local
    authDomain: null,
    projectId: null,
    storageBucket: null,
    messagingSenderId: null,
    appId: null,
    // Mode local activé
    localMode: true
  },
  
  // Configuration IA
  ai: {
    // Clé API OpenAI (optionnelle - l'IA fonctionnera en mode simulation sans clé)
    openaiApiKey: null, // À remplacer par votre clé API OpenAI
    
    // Modèle IA à utiliser
    model: 'gpt-3.5-turbo',
    
    // Nombre maximum de tokens par réponse
    maxTokens: 1000,
    
    // Température pour la génération (0 = déterministe, 1 = créatif)
    temperature: 0.7,
    
    // Mode simulation amélioré
    simulationMode: true,
    
    // Délai de simulation pour les réponses IA
    simulationDelay: 1000
  },
  
  // Configuration de l'application
  app: {
    name: 'StudyHub',
    version: '1.0.0',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ],
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxQCMQuestions: 50,
    maxFlashcards: 100,
    
    // Nouvelles configurations
    enableLocalStorage: true,
    enableFileProcessing: true,
    enableAISimulation: true,
    enableContentGeneration: true
  },
  
  // Configuration des notifications
  notifications: {
    enabled: true,
    duration: 5000, // 5 secondes
    position: 'top-right'
  },
  
  // Configuration du thème
  theme: {
    default: 'light',
    autoDetect: true
  },
  
  // Configuration du traitement de documents
  documentProcessing: {
    enablePDFExtraction: true,
    enableWordExtraction: true,
    enableContentAnalysis: true,
    enableAIGeneration: true,
    maxContentLength: 5000,
    enableMockContent: true
  }
};

// Instructions pour configurer Firebase :
/*
1. Allez sur https://console.firebase.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Dans les paramètres du projet, allez dans "Vos applications"
4. Cliquez sur l'icône Web (</>) pour ajouter une application web
5. Enregistrez votre application et copiez la configuration
6. Remplacez les valeurs dans StudyHubConfig.firebase ci-dessus
7. Définissez localMode: false

Exemple de configuration Firebase :
firebase: {
  apiKey: "AIzaSyC2X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  localMode: false
}
*/

// Instructions pour configurer OpenAI :
/*
1. Allez sur https://platform.openai.com/
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys" et créez une nouvelle clé
4. Copiez la clé et remplacez StudyHubConfig.ai.openaiApiKey
5. Définissez simulationMode: false

Note : L'application fonctionnera sans clé OpenAI en mode simulation,
mais les réponses seront moins sophistiquées.
*/
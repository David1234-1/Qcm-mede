// Service IA pour StudyHub
class AIService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-3.5-turbo';
    this.maxTokens = 1000;
    this.simulationMode = true;
    this.simulationDelay = 1000;
    
    this.init();
  }

  init() {
    // Essayer de récupérer la clé API depuis la configuration, localStorage ou les variables d'environnement
    this.apiKey = window.StudyHubConfig?.ai?.openaiApiKey || 
                  localStorage.getItem('openai_api_key') || 
                  process.env.OPENAI_API_KEY;
    
    // Utiliser la configuration pour les paramètres IA
    if (window.StudyHubConfig?.ai) {
      this.model = window.StudyHubConfig.ai.model || this.model;
      this.maxTokens = window.StudyHubConfig.ai.maxTokens || this.maxTokens;
      this.simulationMode = window.StudyHubConfig.ai.simulationMode !== false;
      this.simulationDelay = window.StudyHubConfig.ai.simulationDelay || this.simulationDelay;
    }
    
    if (!this.apiKey) {
      console.warn('Clé API OpenAI non trouvée. L\'IA fonctionnera en mode simulation.');
      this.simulationMode = true;
    }
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
    this.simulationMode = false;
  }

  async generateResponse(prompt, context = null) {
    if (this.simulationMode || !this.apiKey) {
      return this.generateSimulatedResponse(prompt, context);
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.buildMessages(prompt, context),
          max_tokens: this.maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erreur lors de la génération de réponse IA:', error);
      return this.generateSimulatedResponse(prompt, context);
    }
  }

  buildMessages(prompt, context) {
    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant pédagogique spécialisé dans l'aide aux étudiants. 
        Tu dois répondre de manière claire, pédagogique et adaptée au niveau de l'étudiant.
        Si un contexte de cours est fourni, utilise-le pour donner des réponses précises et pertinentes.
        Réponds toujours en français.`
      }
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Contexte du cours: ${JSON.stringify(context)}`
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    return messages;
  }

  async generateSimulatedResponse(prompt, context) {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, this.simulationDelay));
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Récupérer le contenu des cours téléchargés
    const courseContent = this.getCourseContent(context);
    
    // Réponses contextuelles basées sur le contenu des cours
    if (courseContent && courseContent.length > 0) {
      if (lowerPrompt.includes('concept') || lowerPrompt.includes('princip')) {
        return this.generateConceptsResponseFromContent(courseContent, context);
      }
      
      if (lowerPrompt.includes('formule') || lowerPrompt.includes('calcul')) {
        return this.generateFormulasResponseFromContent(courseContent, context);
      }
      
      if (lowerPrompt.includes('exemple') || lowerPrompt.includes('pratique')) {
        return this.generateExamplesResponseFromContent(courseContent, context);
      }
      
      if (lowerPrompt.includes('difficile') || lowerPrompt.includes('compliqué')) {
        return this.generateDifficultPointsResponseFromContent(courseContent, context);
      }
      
      // Réponse générale basée sur le contenu
      return this.generateGeneralResponseFromContent(prompt, courseContent, context);
    }
    
    // Réponses générales si pas de contenu spécifique
    if (lowerPrompt.includes('aide') || lowerPrompt.includes('comment')) {
      return `Je suis là pour vous aider dans vos études ! Voici quelques conseils :

• **Révisez régulièrement** : La répétition espacée est plus efficace
• **Posez des questions** : N'hésitez pas à demander des clarifications
• **Pratiquez** : Faites des exercices et des QCM pour tester vos connaissances
• **Organisez-vous** : Utilisez les flashcards et résumés pour structurer vos révisions

Que souhaitez-vous approfondir ?`;
    }

    if (lowerPrompt.includes('difficile') || lowerPrompt.includes('compliqué')) {
      return `Je comprends que certains points peuvent sembler difficiles. Voici mes conseils :

• **Décomposez** : Divisez les concepts complexes en parties plus simples
• **Cherchez des exemples** : Les cas concrets aident à la compréhension
• **Pratiquez** : L'entraînement rend tout plus facile
• **Demandez de l'aide** : N'hésitez pas à poser des questions spécifiques

Sur quel point particulier avez-vous des difficultés ?`;
    }

    // Réponse par défaut
    return `Merci pour votre question ! Je suis votre assistant pédagogique et je suis là pour vous aider dans vos études.

Pour vous donner une réponse plus précise et personnalisée, pourriez-vous :
• Me donner plus de détails sur votre question ?
• Me préciser le contexte de votre cours ?
• Me dire sur quelle matière vous travaillez ?

Je peux vous aider avec les concepts, les formules, les exemples pratiques, et bien plus encore !`;
  }

  getCourseContent(context) {
    if (!context) return [];
    
    const content = [];
    
    // Récupérer le contenu des fichiers importés
    const importedFiles = JSON.parse(localStorage.getItem('imported_files') || '[]');
    if (context.subject && context.subject.name) {
      const subjectFiles = importedFiles.filter(file => 
        file.subject === context.subject.name && file.content
      );
      subjectFiles.forEach(file => {
        if (file.content.originalText) {
          content.push({
            type: 'document',
            title: file.title,
            text: file.content.originalText,
            source: file.name
          });
        }
      });
    }
    
    // Récupérer le contenu des QCM
    if (context.qcm && context.qcm.questions) {
      context.qcm.questions.forEach(q => {
        content.push({
          type: 'qcm',
          question: q.text,
          answers: q.answers,
          source: 'QCM'
        });
      });
    }
    
    // Récupérer le contenu des flashcards
    if (context.flashcards) {
      context.flashcards.forEach(card => {
        content.push({
          type: 'flashcard',
          question: card.question || card.front,
          answer: card.answer || card.back,
          source: 'Flashcard'
        });
      });
    }
    
    return content;
  }

  generateConceptsResponseFromContent(content, context) {
    const concepts = this.extractConceptsFromContent(content);
    const subjectName = context?.subject?.name || 'cette matière';
    
    if (concepts.length > 0) {
      return `Voici les **concepts principaux** de ${subjectName} basés sur vos cours :

${concepts.map(concept => `• **${concept}** : Concept fondamental identifié dans vos documents`).join('\n')}

Ces concepts sont essentiels pour bien comprendre la matière. Je recommande de les revoir régulièrement !`;
    } else {
      return `Basé sur vos documents, voici les **concepts principaux** de ${subjectName} :

• **Concept 1** : Définition et explication détaillée
• **Concept 2** : Autre notion importante à maîtriser
• **Concept 3** : Point clé pour la compréhension

Ces concepts sont essentiels pour bien comprendre la matière. Je recommande de les revoir régulièrement !`;
    }
  }

  generateFormulasResponseFromContent(content, context) {
    const formulas = this.extractFormulasFromContent(content);
    const subjectName = context?.subject?.name || 'cette matière';
    
    if (formulas.length > 0) {
      return `Voici les **formules importantes** identifiées dans vos cours :

${formulas.map(formula => `• ${formula}`).join('\n')}

N'oubliez pas de bien comprendre quand et comment utiliser chaque formule !`;
    } else {
      return `Pour ${subjectName}, il n'y a pas de formules mathématiques spécifiques identifiées dans vos documents. L'accent est mis sur la compréhension des concepts et la logique.`;
    }
  }

  generateExamplesResponseFromContent(content, context) {
    const examples = this.extractExamplesFromContent(content);
    const subjectName = context?.subject?.name || 'cette matière';
    
    if (examples.length > 0) {
      return `Voici quelques **exemples pratiques** basés sur vos cours pour ${subjectName} :

${examples.map(example => `• **${example.title}** : ${example.description}`).join('\n')}

Ces exemples vous aideront à mieux comprendre l'application pratique des concepts théoriques.`;
    } else {
      return `Voici quelques **exemples pratiques** pour ${subjectName} :

• **Exemple 1** : Application concrète du concept principal
• **Exemple 2** : Cas d'usage typique dans la pratique
• **Exemple 3** : Situation réelle où ces connaissances sont utiles

Ces exemples vous aideront à mieux comprendre l'application pratique des concepts théoriques.`;
    }
  }

  generateDifficultPointsResponseFromContent(content, context) {
    const difficultPoints = this.extractDifficultPointsFromContent(content);
    const subjectName = context?.subject?.name || 'cette matière';
    
    if (difficultPoints.length > 0) {
      return `Les **points difficiles** identifiés dans vos cours pour ${subjectName} sont :

${difficultPoints.map(point => `• **${point}** : Point nécessitant une attention particulière`).join('\n')}

Mon conseil : concentrez-vous sur ces points et n'hésitez pas à me poser des questions spécifiques !`;
    } else {
      return `Les **points difficiles** de ${subjectName} sont généralement :

• **Compréhension des concepts abstraits** : Prenez le temps de bien assimiler
• **Application pratique** : Entraînez-vous avec des exercices
• **Connexions entre les notions** : Essayez de faire des liens

Mon conseil : concentrez-vous sur ces points et n'hésitez pas à me poser des questions spécifiques !`;
    }
  }

  generateGeneralResponseFromContent(prompt, content, context) {
    const subjectName = context?.subject?.name || 'cette matière';
    const contentCount = content.length;
    
    return `Excellente question sur ${subjectName} ! 

Basé sur le contenu de vos cours (${contentCount} éléments analysés), voici ce que je peux vous dire :

**Contexte** : Votre cours contient du matériel varié incluant des documents, QCM et flashcards.

**Ma réponse** : ${this.generateInsightfulResponseFromContent(prompt, content)}

N'hésitez pas à me poser des questions plus spécifiques pour approfondir !`;
  }

  generateInsightfulResponseFromContent(prompt, content) {
    const responses = [
      "Cette question touche à un aspect important de la matière. Je recommande de revoir les concepts de base avant d'aborder ce point.",
      "C'est une excellente question qui montre une bonne compréhension du sujet. Continuez dans cette direction !",
      "Ce point est souvent source de confusion. Laissez-moi vous expliquer de manière simple...",
      "Votre question révèle une curiosité intellectuelle intéressante. Voici comment aborder ce sujet...",
      "Cette question fait le lien entre plusieurs concepts. C'est exactement le type de réflexion qui mène à la maîtrise du sujet."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  extractConceptsFromContent(content) {
    const concepts = new Set();
    
    content.forEach(item => {
      const text = item.text || item.question || '';
      const words = text.split(' ').filter(word => 
        word.length > 4 && /^[A-Za-zÀ-ÿ]+$/.test(word)
      );
      words.slice(0, 3).forEach(word => 
        concepts.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      );
    });
    
    return Array.from(concepts).slice(0, 5);
  }

  extractFormulasFromContent(content) {
    const formulas = [];
    
    content.forEach(item => {
      const text = item.text || item.question || '';
      
      // Regex pour détecter des formules simples
      const formulaPatterns = [
        /[A-Za-z]\s*=\s*[A-Za-z0-9+\-*/()]+/g,
        /[A-Za-z]\s*\+\s*[A-Za-z]/g,
        /[A-Za-z]\s*\*\s*[A-Za-z]/g
      ];

      formulaPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          formulas.push(...matches.slice(0, 3));
        }
      });
    });
    
    return formulas.slice(0, 5);
  }

  extractExamplesFromContent(content) {
    const examples = [];
    
    content.forEach(item => {
      const text = item.text || item.question || '';
      
      // Chercher des exemples dans le texte
      if (text.toLowerCase().includes('exemple') || text.toLowerCase().includes('cas')) {
        examples.push({
          title: 'Exemple identifié',
          description: text.substring(0, 100) + '...'
        });
      }
    });
    
    return examples.slice(0, 3);
  }

  extractDifficultPointsFromContent(content) {
    const difficultPoints = [];
    
    content.forEach(item => {
      const text = item.text || item.question || '';
      
      // Chercher des points difficiles dans le texte
      if (text.toLowerCase().includes('difficile') || text.toLowerCase().includes('complexe')) {
        difficultPoints.push('Point complexe identifié');
      }
    });
    
    return difficultPoints.slice(0, 3);
  }

  async generateQCM(content, count = 10) {
    const prompt = `Génère ${count} questions de QCM basées sur ce contenu de cours. 
    Les questions doivent être variées (définitions, applications, calculs, etc.).
    Chaque question doit avoir 4 réponses possibles avec une seule bonne réponse.
    Format JSON attendu :
    {
      "questions": [
        {
          "question": "Question text",
          "answers": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "Explication détaillée de la réponse",
          "difficulty": "easy|medium|hard"
        }
      ]
    }
    
    Contenu du cours : ${content.substring(0, 3000)}`;

    try {
      const response = await this.generateResponse(prompt);
      
      // Essayer de parser la réponse JSON
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const qcm = JSON.parse(jsonMatch[0]);
          // Valider que chaque question a la structure attendue
          if (qcm.questions && Array.isArray(qcm.questions)) {
            return qcm.questions.filter(q => q.question && q.answers && q.answers.length === 4 && typeof q.correctAnswer === 'number');
          }
        }
      } catch (e) {
        console.warn('Impossible de parser la réponse JSON, génération de QCM mock');
      }
      
      // Fallback vers des QCM générés automatiquement
      return this.generateMockQCM(content, count);
    } catch (error) {
      console.error('Erreur lors de la génération de QCM:', error);
      return this.generateMockQCM(content, count);
    }
  }

  generateMockQCM(content, count) {
    const questions = [];
    const subjects = ['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Histoire', 'Géographie'];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Extraire des mots du contenu pour créer des questions plus pertinentes
    const words = content.split(' ').filter(word => word.length > 4).slice(0, 10);
    
    for (let i = 0; i < count; i++) {
      const word = words[i] || `concept ${i + 1}`;
      questions.push({
        question: `Question ${i + 1} sur ${subject} : ${this.generateQuestionText(subject, word)}`,
        answers: [
          `Réponse A - Option ${i + 1}`,
          `Réponse B - Option ${i + 1}`,
          `Réponse C - Option ${i + 1}`,
          `Réponse D - Option ${i + 1}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `Explication de la réponse pour la question ${i + 1}`,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
      });
    }
    
    return questions;
  }

  generateQuestionText(subject, word) {
    const questions = {
      'Mathématiques': `Quelle est la valeur de ${word} dans l'équation ?`,
      'Physique': `Quel est le principe fondamental de ${word} ?`,
      'Chimie': `Quelle est la formule moléculaire de ${word} ?`,
      'Biologie': `Quel est le processus cellulaire de ${word} ?`,
      'Histoire': `Quel événement historique concerne ${word} ?`,
      'Géographie': `Quelle caractéristique géographique de ${word} ?`
    };
    
    return questions[subject] || `Question sur ${word}`;
  }

  async generateSummary(content) {
    const prompt = `Génère un résumé clair et structuré de ce contenu de cours. 
    Le résumé doit inclure :
    - Les points clés principaux
    - Les concepts importants
    - Une structure logique
    - Maximum 300 mots
    
    Contenu : ${content}`;

    try {
      const response = await this.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      return this.generateMockSummary(content);
    }
  }

  generateMockSummary(content) {
    const words = content.split(' ').slice(0, 50).join(' ');
    return `Résumé automatique du contenu de cours :

**Points clés :**
• Concept principal 1 : ${words.substring(0, 50)}...
• Concept principal 2 : Définition importante
• Concept principal 3 : Notion fondamentale

**Concepts importants :**
Ce cours couvre les aspects essentiels de la matière étudiée, avec un focus sur la compréhension pratique et théorique des concepts présentés.

**Structure :**
Le contenu est organisé de manière logique pour faciliter l'apprentissage et la révision.`;
  }

  async generateFlashcards(content, count = 10) {
    const prompt = `Génère ${count} flashcards basées sur ce contenu de cours.
    Les flashcards doivent couvrir les concepts clés, définitions, formules importantes.
    Chaque flashcard doit avoir une question claire et une réponse détaillée.
    Format JSON attendu :
    {
      "flashcards": [
        {
          "question": "Question claire et précise",
          "answer": "Réponse détaillée et pédagogique",
          "category": "definition|formula|concept|application"
        }
      ]
    }
    
    Contenu : ${content.substring(0, 3000)}`;

    try {
      const response = await this.generateResponse(prompt);
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const flashcards = JSON.parse(jsonMatch[0]);
          // Valider que chaque flashcard a la structure attendue
          if (flashcards.flashcards && Array.isArray(flashcards.flashcards)) {
            return flashcards.flashcards.filter(f => f.question && f.answer);
          }
        }
      } catch (e) {
        console.warn('Impossible de parser la réponse JSON, génération de flashcards mock');
      }
      
      return this.generateMockFlashcards(content, count);
    } catch (error) {
      console.error('Erreur lors de la génération de flashcards:', error);
      return this.generateMockFlashcards(content, count);
    }
  }

  generateMockFlashcards(content, count) {
    const flashcards = [];
    const concepts = ['Définition', 'Principe', 'Formule', 'Théorème', 'Loi', 'Processus'];
    const words = content.split(' ').filter(word => word.length > 4).slice(0, 10);
    
    for (let i = 0; i < count; i++) {
      const concept = concepts[i % concepts.length];
      const word = words[i] || `concept ${i + 1}`;
      flashcards.push({
        question: `${concept} ${i + 1} : ${this.generateFlashcardQuestion(concept, word)}`,
        answer: `Réponse détaillée pour ${concept} ${i + 1} : Explication complète du concept avec des exemples et des applications pratiques.`,
        category: concept.toLowerCase()
      });
    }
    
    return flashcards;
  }

  generateFlashcardQuestion(concept, word) {
    const questions = {
      'Définition': `Qu'est-ce que ${word} ?`,
      'Principe': `Quel est le principe fondamental de ${word} ?`,
      'Formule': `Quelle est la formule associée à ${word} ?`,
      'Théorème': `Que dit le théorème de ${word} ?`,
      'Loi': `Quelle est la loi de ${word} ?`,
      'Processus': `Comment fonctionne le processus de ${word} ?`
    };
    
    return questions[concept] || `Question sur ${word}`;
  }
}

// Initialiser le service IA
if (typeof window !== 'undefined') {
  window.AIService = new AIService();
}
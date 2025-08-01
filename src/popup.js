// Initialize services
let speechService = null;
let translationService = null;
let isListening = false;

// DOM elements
const toggleBtn = document.getElementById('toggleBtn');
const btnText = document.getElementById('btnText');
const statusElement = document.getElementById('status');
const statusText = document.getElementById('statusText');
const transcriptBox = document.getElementById('transcript');
const translationBox = document.getElementById('translation');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeSpeechRecognition();
  initializeTranslation();
  setupEventListeners();
});

function initializeSpeechRecognition() {
  speechService = new SpeechRecognitionService();
  
  // Set up callbacks
  speechService.onResult(handleSpeechResult);
  speechService.onError(handleSpeechError);
  speechService.onStatusChange(handleStatusChange);
}

function initializeTranslation() {
  translationService = new TranslationService();
}

function setupEventListeners() {
  toggleBtn.addEventListener('click', toggleListening);
}

function toggleListening() {
  if (!speechService) {
    showError('Speech recognition not initialized');
    return;
  }

  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  // Clear previous transcripts
  clearTranscript();
  
  // Reset tracking variables
  previousInterimText = '';
  translationHistory = []; // Reset translation history
  recentTranslations.clear(); // Clear recent translations cache
  if (translationTimeout) {
    clearTimeout(translationTimeout);
    translationTimeout = null;
  }
  
  // Start speech recognition
  speechService.start();
  isListening = true;
  
  // Update UI
  toggleBtn.classList.add('active');
  btnText.textContent = 'Stop Listening';
}

function stopListening() {
  speechService.stop();
  isListening = false;
  
  // Update UI
  toggleBtn.classList.remove('active');
  btnText.textContent = 'Start Listening';
}

// Track previous interim results to detect new words
let previousInterimText = '';
let translationTimeout = null;

function handleSpeechResult(result) {
  // Clear placeholder if it exists
  const placeholder = transcriptBox.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  // Update transcript display
  updateTranscriptDisplay(result.final, result.interim);
  
  // Handle final results - skip them for pure real-time experience
  if (result.isFinal && result.final.trim()) {
    // Just reset for next sentence, don't translate finals
    previousInterimText = '';
  } else if (result.interim && result.interim.trim()) {
    // Detect ANY new content for immediate translation
    const currentText = result.interim.trim();
    const previousText = previousInterimText.trim();
    
    // Translate if there's any new content (even a single new word)
    if (currentText !== previousText && currentText.length > previousText.length) {
      // Translate IMMEDIATELY for maximum flow
      translateText(currentText, true); // true = partial translation
    }
    
    previousInterimText = result.interim;
  }
}

function updateTranscriptDisplay(finalText, interimText) {
  // Clear the transcript box
  transcriptBox.innerHTML = '';
  
  // Add final transcript if exists
  if (finalText.trim()) {
    const finalP = document.createElement('p');
    finalP.className = 'final';
    finalP.textContent = finalText.trim();
    transcriptBox.appendChild(finalP);
  }
  
  // Add interim transcript if exists
  if (interimText.trim()) {
    const interimP = document.createElement('p');
    interimP.className = 'interim';
    interimP.textContent = interimText;
    transcriptBox.appendChild(interimP);
  }
  
  // Auto-scroll to bottom
  transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

function handleSpeechError(error) {
  showError(error);
  stopListening();
}

function handleStatusChange(status, message) {
  // Update status display
  statusElement.className = 'status ' + status;
  
  switch (status) {
    case 'ready':
      statusText.textContent = 'Ready';
      break;
    case 'listening':
      statusText.textContent = 'Listening...';
      break;
    case 'processing':
      statusText.textContent = 'Processing...';
      break;
    case 'error':
      statusText.textContent = message || 'Error';
      break;
    default:
      statusText.textContent = status;
  }
}

function clearTranscript() {
  transcriptBox.innerHTML = '<p class="placeholder">Click "Start Listening" and speak in Indonesian...</p>';
  translationBox.innerHTML = '<p class="placeholder">Translation will appear here...</p>';
}

// Translation queue to handle multiple requests
let translationQueue = [];
let isTranslating = false;
let translationHistory = []; // Keep track of translations with metadata
let recentTranslations = new Map(); // Track recent translations to avoid duplicates

// Helper function to calculate string similarity (0-1)
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance for fuzzy matching
function getEditDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function translateText(text, isPartial = false) {
  if (!translationService || !text.trim()) {
    return;
  }
  
  // For partial translations, skip all checks for maximum flow
  if (isPartial) {
    translatePartial(text);
    return;
  }
  
  // Only check duplicates for final translations
  const normalizedText = text.trim().toLowerCase();
  const recentTranslation = recentTranslations.get(normalizedText);
  
  if (recentTranslation && Date.now() - recentTranslation.timestamp < 10000) {
    console.log('Skipping duplicate translation:', text.substring(0, 50));
    return;
  }

  // Add to queue for final translations
  translationQueue.push(text);
  
  // Process queue if not already processing
  if (!isTranslating) {
    processTranslationQueue();
  }
}

async function translatePartial(text) {
  // Clear translation placeholder
  const placeholder = translationBox.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  try {
    const translatedText = await translationService.translate(text);
    const timestamp = Date.now();
    
    // Store in cache to prevent re-translation
    recentTranslations.set(text.trim().toLowerCase(), {
      translation: translatedText,
      timestamp: timestamp
    });
    
    // Update display with smooth flow
    updatePartialTranslation(translatedText);
    
  } catch (error) {
    console.error('Partial translation error:', error);
    // Don't show error for partial translations, just wait for final
  }
}

function updatePartialTranslation(partialText) {
  // Pure real-time: show only the blue flowing translation
  translationBox.innerHTML = '';
  
  const partialElement = document.createElement('p');
  partialElement.className = 'interim';
  partialElement.textContent = partialText;
  partialElement.style.fontSize = '20px'; // Even larger for real-time visibility
  translationBox.appendChild(partialElement);
}

async function processTranslationQueue() {
  if (translationQueue.length === 0) {
    isTranslating = false;
    return;
  }

  isTranslating = true;
  const sourceText = translationQueue.shift();

  // Clear translation placeholder if it exists
  const placeholder = translationBox.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  try {
    const translatedText = await translationService.translate(sourceText);
    const timestamp = Date.now();
    
    // Store in recent translations cache
    recentTranslations.set(sourceText.trim().toLowerCase(), {
      translation: translatedText,
      timestamp: timestamp
    });
    
    // Clean up old entries from cache (older than 30 seconds)
    for (const [key, value] of recentTranslations.entries()) {
      if (timestamp - value.timestamp > 30000) {
        recentTranslations.delete(key);
      }
    }
    
    // Process the translation
    addTranslationToHistory(sourceText, translatedText, timestamp);
    
    // Update display
    updateTranslationDisplay();
    
    // Process next item immediately for better flow
    setTimeout(() => {
      processTranslationQueue();
    }, 100); // Reduced to 100ms for faster flow
  } catch (error) {
    console.error('Translation error:', error);
    
    // Add error to history
    addTranslationToHistory(sourceText, `[Error: ${error.message}]`, Date.now(), true);
    updateTranslationDisplay();
    
    // Continue processing queue after error
    setTimeout(() => {
      processTranslationQueue();
    }, 1000);
  }
}

function addTranslationToHistory(sourceText, translatedText, timestamp, isError = false) {
  // For flow mode: keep only the current sentence
  // Clear history and add only the latest translation
  translationHistory = [{
    source: sourceText,
    translation: translatedText.trim(),
    timestamp: timestamp,
    isError: isError
  }];
}

function updateTranslationDisplay() {
  translationBox.innerHTML = '';
  
  // Display only the current translation (single sentence)
  if (translationHistory.length > 0) {
    const entry = translationHistory[0]; // Only one entry now
    const p = document.createElement('p');
    p.className = entry.isError ? 'error' : 'final';
    p.textContent = entry.translation;
    p.style.fontSize = '18px'; // Larger font for better visibility
    p.style.animation = 'fadeIn 0.3s ease-in';
    translationBox.appendChild(p);
  }
  
  // Auto-scroll to bottom (though not needed with single sentence)
  translationBox.scrollTop = translationBox.scrollHeight;
}

function showError(message) {
  // Show error in transcript box
  transcriptBox.innerHTML = `<p style="color: #f44336;">${message}</p>`;
  
  // Update status
  handleStatusChange('error', 'Error occurred');
  
  // Reset status after 3 seconds
  setTimeout(() => {
    handleStatusChange('ready');
  }, 3000);
}

// Handle extension popup closing
window.addEventListener('unload', () => {
  if (speechService && isListening) {
    speechService.stop();
  }
});
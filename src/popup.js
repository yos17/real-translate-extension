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

function handleSpeechResult(result) {
  // Clear placeholder if it exists
  const placeholder = transcriptBox.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  // Update transcript display
  updateTranscriptDisplay(result.final, result.interim);
  
  // Translate final text
  if (result.isFinal && result.final.trim()) {
    translateText(result.final);
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

async function translateText(text) {
  if (!translationService || !text.trim()) {
    return;
  }

  // Add to queue
  translationQueue.push(text);
  
  // Process queue if not already processing
  if (!isTranslating) {
    processTranslationQueue();
  }
}

async function processTranslationQueue() {
  if (translationQueue.length === 0) {
    isTranslating = false;
    return;
  }

  isTranslating = true;
  const text = translationQueue.shift();

  // Clear translation placeholder
  const placeholder = translationBox.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }

  // Show loading state
  translationBox.innerHTML = '<p style="color: #666; font-style: italic;">Translating...</p>';

  try {
    const translatedText = await translationService.translate(text);
    
    // Display translation
    translationBox.innerHTML = '';
    const translationP = document.createElement('p');
    translationP.className = 'final';
    translationP.textContent = translatedText;
    translationBox.appendChild(translationP);
    
    // Auto-scroll to bottom
    translationBox.scrollTop = translationBox.scrollHeight;
    
    // Add a small delay before processing next item to avoid rate limiting
    setTimeout(() => {
      processTranslationQueue();
    }, 500);
  } catch (error) {
    console.error('Translation error:', error);
    translationBox.innerHTML = '<p style="color: #f44336;">Translation error. Please check console for details.</p>';
    
    // Continue processing queue after error
    setTimeout(() => {
      processTranslationQueue();
    }, 1000);
  }
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
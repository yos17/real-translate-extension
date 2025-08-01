class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
    this.finalTranscript = '';
    this.interimTranscript = '';
    
    this.initializeRecognition();
  }

  initializeRecognition() {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Web Speech API is not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = true;         // Keep listening continuously
    this.recognition.interimResults = true;     // Get results while speaking
    this.recognition.lang = 'id-ID';            // Indonesian language
    this.recognition.maxAlternatives = 1;       // Only need the best result
    
    // Set up event handlers
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // When speech recognition starts
    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
      this.updateStatus('listening');
    };

    // When speech recognition ends
    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      this.updateStatus('ready');
      
      // Auto-restart if it was supposed to be continuous
      if (this.shouldBeListening) {
        console.log('Auto-restarting speech recognition...');
        setTimeout(() => this.start(), 100);
      }
    };

    // When we get results
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcripts
      if (finalTranscript) {
        this.finalTranscript += finalTranscript;
      }
      this.interimTranscript = interimTranscript;

      // Notify callback with results
      if (this.onResultCallback) {
        this.onResultCallback({
          final: this.finalTranscript,
          interim: this.interimTranscript,
          isFinal: finalTranscript.length > 0
        });
      }
    };

    // Handle errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'An error occurred';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      this.updateStatus('error', errorMessage);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }

      // Don't auto-restart on permission errors
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        this.shouldBeListening = false;
      }
    };

    // Handle no match
    this.recognition.onnomatch = () => {
      console.log('No speech match found');
      this.updateStatus('ready');
    };

    // Handle audio start/end
    this.recognition.onaudiostart = () => {
      console.log('Audio capture started');
      this.updateStatus('listening');
    };

    this.recognition.onaudioend = () => {
      console.log('Audio capture ended');
      this.updateStatus('processing');
    };
  }

  start() {
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return;
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    // Clear previous transcripts
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.shouldBeListening = true;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.updateStatus('error', 'Failed to start speech recognition');
    }
  }

  stop() {
    if (!this.recognition) {
      return;
    }

    this.shouldBeListening = false;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  updateStatus(status, message = '') {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, message);
    }
  }

  // Callback setters
  onResult(callback) {
    this.onResultCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onStatusChange(callback) {
    this.onStatusChangeCallback = callback;
  }

  // Getters
  getIsListening() {
    return this.isListening;
  }

  // Change language
  setLanguage(langCode) {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }
}

// Export for use in popup.js
window.SpeechRecognitionService = SpeechRecognitionService;
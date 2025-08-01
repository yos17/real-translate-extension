class TranslationService {
  constructor() {
    // Using MyMemory Translation API (free tier available)
    // Alternative: Google Translate API (requires API key)
    this.apiUrl = 'https://api.mymemory.translated.net/get';
    this.sourceLang = 'id'; // Indonesian
    this.targetLang = 'de'; // German
  }

  async translate(text) {
    if (!text || text.trim() === '') {
      return '';
    }

    try {
      // Build the API request URL
      const params = new URLSearchParams({
        q: text,
        langpair: `${this.sourceLang}|${this.targetLang}`,
        mt: '1' // Enable machine translation
      });

      const response = await fetch(`${this.apiUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if translation was successful
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      } else {
        console.error('Translation error:', data);
        throw new Error(data.responseDetails || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  // Set source language
  setSourceLanguage(langCode) {
    this.sourceLang = langCode;
  }

  // Set target language
  setTargetLanguage(langCode) {
    this.targetLang = langCode;
  }

  // Get current language pair
  getLanguagePair() {
    return {
      source: this.sourceLang,
      target: this.targetLang
    };
  }
}

// Alternative implementation using Google Translate (unofficial endpoint)
// Note: This is for demonstration. For production, use official Google Cloud Translation API
class GoogleTranslateService {
  constructor() {
    this.sourceLang = 'id';
    this.targetLang = 'de';
  }

  async translate(text) {
    if (!text || text.trim() === '') {
      return '';
    }

    // Split long text into smaller chunks (Google Translate has limits)
    const maxLength = 500; // Conservative limit to avoid errors
    if (text.length > maxLength) {
      return await this.translateLongText(text, maxLength);
    }

    try {
      // Using Google Translate's web API (unofficial)
      // For production, use Google Cloud Translation API with proper authentication
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${this.sourceLang}&tl=${this.targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract translated text from response
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach(sentence => {
          if (sentence[0]) {
            translatedText += sentence[0];
          }
        });
      }
      
      return translatedText || 'Translation not available';
    } catch (error) {
      console.error('Google Translate error:', error);
      // Fallback to MyMemory API
      return await this.translateWithMyMemory(text);
    }
  }

  async translateLongText(text, maxLength) {
    // Split text into sentences or chunks
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let translatedChunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        // Translate current chunk
        const translated = await this.translate(currentChunk.trim());
        translatedChunks.push(translated);
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    // Translate remaining chunk
    if (currentChunk) {
      const translated = await this.translate(currentChunk.trim());
      translatedChunks.push(translated);
    }

    return translatedChunks.join(' ');
  }

  async translateWithMyMemory(text) {
    try {
      console.log('Falling back to MyMemory translation API...');
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${this.sourceLang}|${this.targetLang}&mt=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      }
      
      throw new Error('MyMemory translation failed');
    } catch (error) {
      console.error('MyMemory translation error:', error);
      throw new Error('Translation service unavailable');
    }
  }

  setSourceLanguage(langCode) {
    this.sourceLang = langCode;
  }

  setTargetLanguage(langCode) {
    this.targetLang = langCode;
  }

  getLanguagePair() {
    return {
      source: this.sourceLang,
      target: this.targetLang
    };
  }
}

// Export for use in popup.js
// Using GoogleTranslateService as default for better translation quality
window.TranslationService = GoogleTranslateService;
// DeepL Translation Service
class DeepLTranslationService {
  constructor() {
    this.sourceLang = 'ID'; // Indonesian (DeepL uses uppercase codes)
    this.targetLang = 'DE'; // German
    
    // Debug config loading
    console.log('Checking for translation config:', window.translationConfig);
    
    this.apiKey = window.translationConfig?.DEEPL_API_KEY;
    this.apiUrl = window.translationConfig?.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
    
    if (!this.apiKey) {
      console.error('DeepL API key not found. Please add it to config.js');
      console.error('Config object:', window.translationConfig);
    } else {
      console.log('DeepL API configured successfully');
      console.log('API URL:', this.apiUrl);
      // Don't log the full API key for security
      console.log('API Key present:', this.apiKey.substring(0, 8) + '...');
    }
  }

  async translate(text) {
    if (!text || text.trim() === '') {
      return '';
    }

    if (!this.apiKey) {
      console.error('DeepL API key not found in config');
      throw new Error('DeepL API key not configured. Please check config.js');
    }

    // DeepL has a 128KB limit per request, but we'll be conservative
    const maxLength = 5000;
    if (text.length > maxLength) {
      console.log(`Text too long (${text.length} chars), splitting for DeepL...`);
      return await this.translateLongText(text, maxLength);
    }

    try {
      console.log(`Translating with DeepL (${text.length} chars): "${text.substring(0, 50)}..."`);
      
      const params = new URLSearchParams({
        auth_key: this.apiKey,
        text: text,
        source_lang: this.sourceLang,
        target_lang: this.targetLang
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      const responseText = await response.text();
      console.log('DeepL response status:', response.status);

      if (!response.ok) {
        console.error('DeepL API error response:', responseText);
        throw new Error(`DeepL API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('DeepL response data:', data);
      
      if (data.translations && data.translations.length > 0) {
        console.log('DeepL translation successful');
        return data.translations[0].text;
      }
      
      throw new Error('No translation returned from DeepL');
    } catch (error) {
      console.error('DeepL translation error:', error);
      throw error; // Don't fallback, just throw the error
    }
  }

  async translateLongText(text, maxLength) {
    console.log(`Splitting long text for DeepL (${text.length} chars)...`);
    
    // Split by sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    console.log(`Split into ${chunks.length} chunks`);
    const translatedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        console.log(`Translating chunk ${i + 1}/${chunks.length}...`);
        const translated = await this.translate(chunks[i]);
        translatedChunks.push(translated);
        // Small delay between chunks
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to translate chunk ${i + 1}:`, error);
        throw error; // Stop on error instead of continuing
      }
    }

    return translatedChunks.join(' ');
  }

  setSourceLanguage(langCode) {
    // DeepL uses uppercase language codes
    this.sourceLang = langCode.toUpperCase();
  }

  setTargetLanguage(langCode) {
    // DeepL uses uppercase language codes
    this.targetLang = langCode.toUpperCase();
  }

  getLanguagePair() {
    return {
      source: this.sourceLang,
      target: this.targetLang
    };
  }
}

// Export for use in popup.js
window.TranslationService = DeepLTranslationService;
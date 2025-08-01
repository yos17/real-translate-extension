// Configuration template for API keys
// Copy this file to config.js and add your API keys

const config = {
  // DeepL API Configuration
  DEEPL_API_KEY: 'YOUR_DEEPL_API_KEY_HERE',
  DEEPL_API_URL: 'https://api-free.deepl.com/v2/translate', // Free API endpoint
  
  // Use 'https://api.deepl.com/v2/translate' for Pro API
  // DEEPL_API_URL: 'https://api.deepl.com/v2/translate',
};

// Make config available to other scripts
window.translationConfig = config;
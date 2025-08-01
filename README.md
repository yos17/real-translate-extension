# Real-Time Voice Translator Chrome Extension

A Chrome extension that provides real-time speech recognition and translation from Indonesian to German. Speak in Indonesian and see your words transcribed and translated instantly!

## Features

### Phase 1 & 2 Complete ✅
- **Real-time Speech Recognition**: Uses Chrome's Web Speech API to capture Indonesian speech
- **Automatic Translation**: Translates transcribed text from Indonesian to German
- **Continuous Listening**: Keeps listening until you stop it
- **Clean UI**: Simple, user-friendly interface
- **Error Handling**: Graceful handling of API errors with fallback options

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yos17/real-translate-extension.git
   cd real-translate-extension
   ```

2. **Configure API Key**
   - Copy `src/config.template.js` to `src/config.js`
   - Add your DeepL API key to `src/config.js`
   - Get a free API key from: https://www.deepl.com/pro-api
   ```javascript
   DEEPL_API_KEY: 'your-api-key-here'
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the cloned repository folder

4. **Grant permissions**
   - The extension will request microphone access when first used
   - Allow the permission to enable speech recognition

## Usage

1. **Click the extension icon** in your Chrome toolbar
2. **Click "Start Listening"** to begin speech recognition
3. **Speak in Indonesian** - your speech will be transcribed in real-time
4. **View the translation** - German translation appears automatically below
5. **Click "Stop Listening"** when finished

### Example Translations
- "Selamat pagi" → "Guten Morgen" (Good morning)
- "Apa kabar?" → "Wie geht es dir?" (How are you?)
- "Terima kasih" → "Danke" (Thank you)

## Technical Details

### Technologies Used
- **Chrome Extension Manifest V3**
- **Web Speech API** for speech recognition
- **DeepL API** for high-quality translations (primary)
- **Google Translate API** (fallback)
- **MyMemory Translation API** (secondary fallback)

### Project Structure
```
real-translate-extension/
├── manifest.json          # Chrome extension configuration
├── src/
│   ├── popup.html        # Extension popup interface
│   ├── popup.js          # Main UI logic
│   ├── popup.css         # Styling
│   ├── speech-recognition.js  # Speech recognition module
│   └── translation.js    # Translation service
├── icons/                # Extension icons (placeholder)
├── real_translate.prd    # Product Requirements Document
└── CLAUDE.md            # Development guidelines
```

## Development Roadmap

### Completed ✅
- **Phase 1**: Real-time speech recognition
- **Phase 2**: Automated translation

### Upcoming Phases
- **Phase 3**: Enhanced Chrome integration (overlay display, text insertion)
- **Phase 4**: Background operation and hotkey activation
- **Phase 5**: Advanced features (bidirectional translation, voice output, offline mode)

## Known Limitations

- Requires internet connection for both speech recognition and translation
- Long texts may need to be split due to API limitations
- Translation accuracy depends on the Google Translate service
- Currently supports only Indonesian → German translation

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by Wispr Flow and similar voice translation tools
- Built with Chrome's Web Speech API
- Translation powered by Google Translate

---

**Note**: This extension uses unofficial translation APIs for demonstration purposes. For production use, consider implementing official API keys from Google Cloud Translation or DeepL.
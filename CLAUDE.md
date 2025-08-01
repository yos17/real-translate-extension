# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Real-Time Voice Translator** project - a Chrome extension that captures speech in one language (primarily Indonesian) and translates it in real-time to another language (primarily German), displaying results directly in the Chrome browser.

## Current Status

**Planning Phase** - The project currently contains only a Product Requirements Document (PRD). No implementation has begun.

## Architecture Overview

The project follows a 5-phase development plan:

1. **Phase 1: Real-Time Speech Recognition**
   - Web Speech API for microphone access
   - Continuous speech-to-text transcription
   - Indonesian language support

2. **Phase 2: Automated Translation**  
   - Integration with Google Cloud Translation or DeepL API
   - Automatic translation of transcribed text
   - Error handling and rate limiting

3. **Phase 3: Chrome Browser Display**
   - Web interface or Chrome extension
   - Multiple display options (popup, overlay, direct insertion)

4. **Phase 4: Background Operation**
   - Continuous listening mode
   - Chrome extension with background service worker
   - One-click activation

5. **Phase 5: Advanced Features**
   - Bi-directional translation
   - Text-to-speech output
   - Custom vocabulary learning

## Key Technologies

- **Speech Recognition**: Chrome's Web Speech API
- **Translation**: Google Cloud Translation API or DeepL API  
- **Platform**: Chrome Extension with Manifest V3
- **Frontend**: JavaScript, HTML, CSS

## Development Commands

Since the project hasn't been initialized yet, when starting development:

```bash
# Initialize as a Chrome extension project
mkdir src
mkdir dist
npm init -y

# For Chrome extension development
# Load unpacked extension from Chrome://extensions with Developer Mode enabled
```

## Project Structure (Planned)

For Chrome extension development, create:
- `manifest.json` - Extension configuration
- `src/background.js` - Service worker for continuous operation
- `src/content.js` - Content script for page integration  
- `src/popup.html` & `popup.js` - Extension popup interface
- `src/speech-recognition.js` - Web Speech API integration
- `src/translation.js` - Translation API integration

## Important Considerations

1. **API Keys**: Translation APIs require authentication. Store API keys securely and never commit them.

2. **Permissions**: Chrome extension will need permissions for:
   - `microphone` - For speech input
   - `storage` - For settings
   - `activeTab` - For content injection
   - Host permissions for translation API endpoints

3. **Web Speech API Limitations**:
   - Chrome-only (built on Google's speech recognition)
   - Requires internet connection
   - May have accuracy variations with Indonesian accents

4. **Testing Approach**: 
   - Test with actual Indonesian speech input
   - Verify translation accuracy
   - Monitor API rate limits and costs
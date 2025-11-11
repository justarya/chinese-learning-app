# 中文学习助手 - Chinese Learning Assistant

A comprehensive Chinese language learning web application that helps users convert their study notes into interactive flashcards and practice exercises.

## Features

### 📝 Vocabulary Management
- Add vocabulary with Chinese characters, pinyin, English translation, and example sentences
- Easy-to-use note format: `Chinese | Pinyin | English | Example`
- Track studied vocabulary
- Delete individual entries

### 📚 Flashcard Mode
- Interactive flashcard interface
- Flip cards to reveal translations
- Navigation through vocabulary
- Progress tracking

### ✍️ Translation Practice
- Two-way translation practice (English ↔ Chinese)
- Score tracking with percentage display
- Instant feedback on answers
- Peek functionality for hints
- AI-powered grammar explanations

### 💬 Conversation Mode
- Chat with AI in Chinese
- Receive responses with pinyin and English translations
- Request explanations for any message
- Practice real conversational Chinese

### 📊 Progress Dashboard
- Track total vocabulary count
- Monitor studied cards
- View translation practice scores
- Visual statistics display

## Tech Stack

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage API
- **AI Integration**: Anthropic Claude API (ready for integration)

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chinese-learning-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Adding Vocabulary

1. Click "Manage Notes" from the home screen
2. Enter vocabulary in the format: `Chinese | Pinyin | English | Example`
3. Example: `你好 | nǐ hǎo | hello | 你好，很高兴认识你`
4. Click "Add Vocabulary" to save

### Studying with Flashcards

1. Click "Flashcards" from the home screen
2. Use "Show Answer" to reveal translations
3. Navigate with Previous/Next buttons
4. Cards are automatically marked as studied

### Translation Practice

1. Choose "EN → 中文" or "中文 → EN" from the home screen
2. Type your translation
3. Click "Check Answer" to verify
4. Use "Peek" if you need a hint
5. Request "AI Help" for detailed grammar explanations

### Conversation Practice

1. Click "Chat in Chinese" from the home screen
2. Type messages in Chinese or English
3. Receive responses with translations
4. Click "Explain this" on any AI message for grammar breakdown

## Data Storage

All data is stored locally in your browser using LocalStorage:
- `chinese-vocab`: Your vocabulary list
- `chinese-studied`: Studied card tracking
- `chinese-scores`: Translation practice scores

## Future Enhancements

- Spaced repetition algorithm
- Audio pronunciation
- Image support for vocabulary
- Export/import functionality
- Multiple vocabulary decks
- Learning streaks and gamification
- Progress charts and analytics
- Offline mode support

## Development Phases

The app was built in 8 phases:
1. Project Setup & Core Structure
2. Data Storage & Notes Management
3. Flashcard Mode
4. Translation Practice Mode
5. AI Integration - Grammar Help
6. Conversation Mode with AI
7. UI Polish & User Experience
8. Testing & Bug Fixes

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with React and Tailwind CSS
- Icons by Lucide React
- AI powered by Anthropic Claude

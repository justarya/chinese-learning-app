# 中文学习助手 - Chinese Learning Assistant

A comprehensive full-stack Chinese language learning web application with AI-powered features including smart note import, flashcards, translation practice, and conversational AI.

## 🌟 Features

### 📝 AI-Powered Vocabulary Import (Priority Feature)
- Import rough notes in ANY format (plain text, markdown, mixed languages)
- AI automatically extracts Chinese characters, pinyin, English translation, and examples
- Converts non-English translations (Indonesian, etc.) to English for consistency
- Generates missing pinyin and example sentences automatically
- Batch import with preview before saving

### 📚 Vocabulary Management
- Add and manage vocabulary with Chinese, pinyin, English, and examples
- Track studied vocabulary
- Delete individual entries
- View all vocabulary with pagination

### 🎴 Flashcard Mode
- Interactive flashcard interface
- Flip cards to reveal translations
- Navigation through vocabulary
- Automatic progress tracking

### ✍️ Translation Practice
- Two-way translation practice (English ↔ Chinese)
- Score tracking with percentage display
- Instant feedback on answers
- Peek functionality for hints

### 💬 Conversation Mode with Real AI
- Chat with AI in Chinese using OpenRouter (Qwen model)
- Receive responses with Chinese text, pinyin, and English translations
- Conversation history saved per user
- Multiple chat sessions support
- Context-aware responses (last 10 messages)

### 📊 Progress Dashboard
- Track total vocabulary count
- Monitor studied cards
- View translation practice scores
- Visual statistics display

### 🔐 Multi-User Support
- Google OAuth authentication
- Each user has their own vocabulary database
- Secure JWT-based sessions
- User profile management

## 🏗️ Architecture

### Full-Stack Architecture
```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (React + Vite)                  │
│  - Google OAuth Login                                   │
│  - API calls via Axios                                  │
│  - Tailwind CSS styling                                 │
│  Port: 5173 (dev)                                      │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│                  SERVER (NestJS)                        │
│  - Google OAuth + JWT Authentication                    │
│  - OpenRouter AI Integration (Qwen model)              │
│  - PostgreSQL via TypeORM                              │
│  - RESTful API Endpoints                               │
│  Port: 3000                                            │
└────────────────────┬────────────────────────────────────┘
                     │ TypeORM
┌────────────────────▼────────────────────────────────────┐
│              DATABASE (PostgreSQL)                      │
│  - Users, Vocabulary, Chat Sessions                    │
│  - Study Sessions, Progress Tracking                   │
│  Port: 5432                                            │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: @react-oauth/google

### Backend
- **Framework**: NestJS
- **Database ORM**: TypeORM
- **Authentication**: Passport.js (Google OAuth + JWT)
- **AI Integration**: OpenRouter API (qwen/qwen-2.5-72b-instruct)
- **Validation**: class-validator, class-transformer

### Database
- **PostgreSQL** 14+
- Tables: users, vocabulary, chat_sessions, chat_messages, study_sessions, flashcard_reviews, import_history

## 📁 Project Structure

```
chinese-learning-app/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── LoginView.jsx
│   │   │   ├── HomeView.jsx
│   │   │   ├── ImportNotesView.jsx
│   │   │   ├── NotesView.jsx
│   │   │   ├── FlashcardView.jsx
│   │   │   ├── TranslationView.jsx
│   │   │   └── ConversationView.jsx
│   │   ├── services/           # API service layer
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── vocabulary.service.js
│   │   │   ├── chat.service.js
│   │   │   └── study.service.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.template
│   └── package.json
│
├── backend/                     # NestJS backend
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   │   ├── strategies/
│   │   │   │   ├── google.strategy.ts
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── guards/
│   │   │   └── auth.controller.ts
│   │   ├── user/               # User management
│   │   ├── vocabulary/         # Vocabulary CRUD + Import
│   │   ├── chat/               # Chat with AI
│   │   ├── study/              # Study tracking
│   │   ├── openrouter/         # OpenRouter AI service
│   │   ├── database/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.template
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 14+
- Google OAuth Client ID & Secret
- OpenRouter API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chinese-learning-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.template .env

# Edit .env with your credentials:
# - DATABASE_* (PostgreSQL connection)
# - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# - JWT_SECRET
# - OPENROUTER_API_KEY
# - etc.

# The database tables will be created automatically when you start the server
# (synchronize: true in development)

# Start backend server
npm run start:dev
```

Backend will run on http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file from template
cp .env.template .env

# Edit .env:
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Start frontend dev server
npm run dev
```

Frontend will run on http://localhost:5173

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (backend)
6. Copy Client ID and Client Secret to both frontend and backend `.env` files

### 5. OpenRouter API Setup

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add to backend `.env`:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_MODEL=qwen/qwen-2.5-72b-instruct
   ```

## 📋 API Endpoints

### Authentication
```
GET    /auth/google              # Initiate Google OAuth
GET    /auth/google/callback     # Google OAuth callback
GET    /auth/profile             # Get current user profile
POST   /auth/logout              # Logout
```

### Vocabulary
```
GET    /api/vocabulary           # Get all vocabulary (paginated)
POST   /api/vocabulary           # Add single vocabulary
POST   /api/vocabulary/import    # Import rough notes with AI
DELETE /api/vocabulary/:id       # Delete vocabulary
PATCH  /api/vocabulary/:id/study # Mark as studied
GET    /api/vocabulary/stats     # Get vocabulary statistics
```

### Chat
```
GET    /api/chat/sessions        # Get all chat sessions
POST   /api/chat/sessions        # Create new chat session
GET    /api/chat/sessions/:id    # Get session with messages
DELETE /api/chat/sessions/:id    # Delete chat session
POST   /api/chat/message         # Send message (returns AI response)
```

### Study Tracking
```
GET    /api/study/progress       # Get user progress
GET    /api/study/stats          # Get detailed statistics
POST   /api/study/session        # Log study session
POST   /api/study/flashcard      # Log flashcard review
```

## 💾 Database Schema

### Users
```sql
id, google_id, email, name, picture, created_at, updated_at
```

### Vocabulary
```sql
id, user_id, chinese, pinyin, english, example, studied_count, last_studied_at, created_at, updated_at
```

### Chat Sessions & Messages
```sql
chat_sessions: id, user_id, title, created_at, updated_at
chat_messages: id, session_id, user_id, role, content, created_at
```

### Study Tracking
```sql
study_sessions: id, user_id, session_type, score, total, duration_seconds, created_at
flashcard_reviews: id, user_id, vocabulary_id, reviewed_at
import_history: id, user_id, original_text, items_imported, created_at
```

## 🤖 AI Features

### Import Conversion (OpenRouter + Qwen)
The AI Import feature uses OpenRouter's Qwen model to intelligently convert rough notes:

**Input Example:**
```
工厂 gong1chang3 = pabrik
水果店 shui guo = toko buah
面包店 mian bao dian toko roti
```

**AI Processing:**
1. Extracts Chinese characters
2. Generates or normalizes pinyin with tone marks
3. Converts non-English (Indonesian, etc.) to English
4. Creates example sentences if missing
5. Returns structured JSON

**Output:**
```json
[
  {
    "chinese": "工厂",
    "pinyin": "gōngchǎng",
    "english": "factory",
    "example": "这是一个大工厂"
  }
]
```

### Conversation AI
- Model: qwen/qwen-2.5-72b-instruct
- Context: Last 10 messages
- Format: Chinese + Pinyin + English
- Stored per user with session management

## 🔒 Security

- Google OAuth for secure authentication
- JWT tokens for API authorization
- Password hashing (if email/password added later)
- CORS configured for frontend URL only
- Input validation with class-validator
- SQL injection protection via TypeORM

## 📊 Environment Variables

### Backend (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=chinese_learning_app

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

JWT_SECRET=your_jwt_secret_change_this
JWT_EXPIRES_IN=7d

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=qwen/qwen-2.5-72b-instruct

PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🧪 Development

### Backend Development
```bash
cd backend
npm run start:dev      # Start with watch mode
npm run build          # Build for production
npm run start:prod     # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

## 📝 Usage Guide

### 1. Importing Vocabulary (Priority Feature)
1. Login with Google
2. Click "Import Notes (AI)" from home
3. Paste your rough notes in any format
4. AI will convert and structure your notes
5. Preview the results
6. Vocabulary is saved to your database

### 2. Studying with Flashcards
1. Click "Flashcards" from home
2. Cards show Chinese and pinyin
3. Click "Show Answer" to reveal English and example
4. Navigate with Previous/Next
5. Progress is automatically tracked

### 3. Translation Practice
1. Choose "EN → 中文" or "中文 → EN"
2. Type your translation
3. Check answer or peek for hints
4. Scores are tracked and displayed

### 4. Conversation Practice
1. Click "Chat in Chinese"
2. Type messages in Chinese or English
3. AI responds with Chinese, pinyin, and English
4. Start new conversations anytime
5. Chat history is saved

## 🔄 Future Enhancements

- Spaced repetition algorithm for flashcards
- Audio pronunciation with text-to-speech
- Image support for vocabulary
- Export/import functionality
- Multiple vocabulary decks per user
- Learning streaks and gamification
- Detailed progress charts and analytics
- Mobile app (React Native)
- Offline mode support

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for Chinese language learners**

🔗 Powered by OpenRouter AI (Qwen model) | React | NestJS | PostgreSQL

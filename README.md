# Daily Questions App

> A calm, personal, offline-first mobile app that presents one thoughtful question per day.

## Philosophy

This is **not** a todo list, journal, or productivity app. It's a quiet space for honest conversation with yourself.

- No streaks, no pressure, no gamification
- Missed days are fine — the app never shames the user
- One question per day, automatically selected
- All data stays on your device

---

## Features

### MVP Features
- ✅ **Daily Question** - One deterministic question per day
- ✅ **Answer Input** - Write as much or as little as you like
- ✅ **Answer Locking** - Once answered, the question is saved for that day
- ✅ **History View** - Review past questions and answers (30 days)
- ✅ **Light/Dark Mode** - Calm, minimal UI in both themes
- ✅ **Offline-First** - Everything works without internet
- ✅ **Optional Notifications** - Gentle daily reminder (no sound)

### Intentional Non-Features
- ❌ No social sharing
- ❌ No streaks or badges
- ❌ No productivity metrics
- ❌ No pressure or shame

---

## App Structure

### Screens

```
📱 App Structure
├── Today (Home)
│   └── Shows today's question and answer input
├── History
│   └── Past 30 days of questions and answers
└── Settings
    ├── Theme (Light/Dark/Auto)
    ├── Notifications (On/Off + Time)
    └── Data Management (Clear all data)
```

### Navigation
Bottom tab navigation with 3 tabs:
1. **Today** - Today's question (default screen)
2. **History** - Past questions and answers
3. **Settings** - App preferences

---

## Data Model

### Questions
```typescript
interface Question {
  id: number;          // Unique identifier
  text: string;        // The question text
  category?: string;   // Optional categorization
}
```

**Question Pool**: 90 carefully curated questions covering themes like:
- Reflection & Self-awareness
- Growth & Learning
- Connection & Relationships
- Emotions & Honesty
- Purpose & Meaning

### Answers
```typescript
interface Answer {
  id: string;          // UUID
  questionId: number;  // FK to Question
  date: string;        // YYYY-MM-DD format
  answerText: string;  // User's response
  createdAt: number;   // Timestamp
}
```

### Settings
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'auto';
  notificationEnabled: boolean;
  notificationTime: string; // HH:MM format (default: 09:00)
}
```

---

## Technical Implementation

### Tech Stack
- **Framework**: Expo ~54.0 + React Native
- **Navigation**: Expo Router ~5.0
- **Storage**: AsyncStorage (offline-first)
- **Notifications**: Expo Notifications
- **Language**: TypeScript

### Project Structure
```
daily-questions-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation group
│   │   ├── index.tsx      # Today screen
│   │   ├── history.tsx    # History screen
│   │   ├── settings.tsx   # Settings screen
│   │   └── _layout.tsx    # Tab layout
│   └── _layout.tsx        # Root layout
├── components/            # React components
│   ├── QuestionCard.tsx   # Question display
│   ├── AnswerInput.tsx    # Answer text area
│   └── HistoryItem.tsx    # Past Q&A item
├── constants/             # Design tokens
│   ├── Colors.ts          # Theme colors
│   └── Typography.ts      # Font styles
├── data/                  # Static data
│   └── questions.ts       # 90 questions
├── services/              # Business logic
│   ├── storage.ts         # AsyncStorage helpers
│   ├── questions.ts       # Question selection logic
│   └── notifications.ts   # Local notifications
├── hooks/                 # React hooks
│   ├── useTheme.ts        # Theme management
│   └── useTodayQuestion.ts # Today's question logic
└── package.json
```

### Key Logic: Daily Question Selection

Questions are selected **deterministically** based on the date:

```typescript
function getQuestionForDate(dateString: string): Question {
  // Hash the date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Use hash to select from question pool
  const index = Math.abs(hash) % QUESTIONS.length;
  return QUESTIONS[index];
}
```

**Why deterministic?**
- Same question appears for the same date on all devices
- No server needed
- Repeatable and predictable
- Fair distribution across all questions

### Saving Answers

Answers are stored locally with AsyncStorage:

```typescript
async function saveAnswer(answer: Answer): Promise<void> {
  const answers = await getAllAnswers();
  const filtered = answers.filter(a => a.date !== answer.date);
  filtered.push(answer);
  await AsyncStorage.setItem('@daily_questions:answers', JSON.stringify(filtered));
}
```

**Once a question is answered for a day**:
- The answer is locked (cannot edit)
- The answer input is replaced with the saved answer
- A gentle badge confirms "✓ Answered for today"

---

## UX Design

### Design Principles
1. **Calm** - Soft colors, generous spacing, no harsh elements
2. **Honest** - Clear language, no manipulation
3. **Minimal** - Only what's needed, nothing more
4. **Human** - Warm, understanding, never judgmental

### Color Palette

**Light Mode**
- Background: `#F8F9FA` (soft gray)
- Cards: `#FFFFFF` (white)
- Primary: `#4F46E5` (calm indigo)
- Text: `#1A1A1A` (near black)

**Dark Mode**
- Background: `#0F1114` (deep gray)
- Cards: `#1C1E22` (lighter gray)
- Primary: `#818CF8` (lighter indigo)
- Text: `#F9FAFB` (near white)

### Typography
- **Headings**: Bold, 32px
- **Questions**: Semibold, 24px, relaxed line height
- **Body**: Regular, 16px, 1.75 line height
- **Labels**: Medium, 14px, uppercase, letter-spacing

### Spacing & Layout
- **Screen padding**: 20px
- **Component gaps**: 16-20px
- **Card padding**: 20-24px
- **Border radius**: 12-16px (soft, rounded)
- **Bottom tab height**: 64px

### Micro-interactions
- Gentle fade-ins for modals
- Smooth color transitions on theme change
- Disabled state for answered questions (no pressure to edit)
- Loading indicators with theme colors

---

## Running the App

### Installation
```bash
cd daily-questions-app
npm install
```

### Development
```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator  
npm run android

# Run on web
npm run web
```

### Testing on Device
1. Install **Expo Go** app on your phone
2. Run `npm start`
3. Scan QR code with your phone

---

## Future Enhancements (Out of MVP Scope)

### Possible Future Features
1. **Export Answers** - Export to plain text or PDF
2. **Search History** - Search through past answers
3. **Custom Questions** - Let users add their own questions
4. **Reflection Prompts** - Optional weekly or monthly reflection
5. **Themes** - Additional color themes
6. **Accessibility** - Screen reader support, larger text options

### What We'll **Never** Add
- Social features
- Streaks or gamification
- Analytics or tracking
- Ads or monetization
- Cloud sync (privacy first)

---

## Design Mockups

### Today Screen (Unanswered)
```
┌─────────────────────────────┐
│                             │
│  Today                      │
│  One question. Your answer. │
│                             │
│  ┌──────────────────────┐  │
│  │ REFLECTION            │  │
│  │                       │  │
│  │ What did you avoid    │  │
│  │ today?                │  │
│  │                       │  │
│  │ [reflection]          │  │
│  └──────────────────────┘  │
│                             │
│  YOUR ANSWER:               │
│  ┌──────────────────────┐  │
│  │                       │  │
│  │ Take your time...     │  │
│  │                       │  │
│  │                       │  │
│  └──────────────────────┘  │
│                             │
│  [ Save Answer ]            │
│                             │
└─────────────────────────────┘
```

### Today Screen (Answered)
```
┌─────────────────────────────┐
│                             │
│  Today                      │
│  One question. Your answer. │
│                             │
│  ┌──────────────────────┐  │
│  │ What did you avoid    │  │
│  │ today?                │  │
│  └──────────────────────┘  │
│                             │
│  YOUR ANSWER:               │
│  ┌──────────────────────┐  │
│  │ I avoided having a    │  │
│  │ difficult conversation│  │
│  │ with my colleague...  │  │
│  │                       │  │
│  │ ✓ Answered for today  │  │
│  └──────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### History Screen
```
┌─────────────────────────────┐
│                             │
│  History                    │
│  3 questions answered       │
│                             │
│  ┌──────────────────────┐  │
│  │ Today      [Answered] │  │
│  │ What did you avoid... │  │
│  │ I avoided having...   │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ Yesterday  [Answered] │  │
│  │ What quietly gave... │  │
│  │ A walk in the park... │  │
│  └──────────────────────┘  │
│                             │
│  ┌──────────────────────┐  │
│  │ Monday, Jan 27        │  │
│  │ What are you learn... │  │
│  │                       │  │
│  └──────────────────────┘  │
│                             │
└─────────────────────────────┘
```

---

## Question Examples

Here's a sample of the 90 questions included:

- "What did you avoid today?"
- "What quietly gave you energy?"
- "What are you learning the hard way?"
- "If today repeated for a year, would you be okay?"
- "What did you pretend not to notice?"
- "Who did you think of but not reach out to?"
- "What felt easier than you expected?"
- "What small thing annoyed you more than it should have?"
- "What would you do differently if no one was watching?"
- "What did you rush through?"

...and 80 more, covering themes of reflection, growth, connection, honesty, and meaning.

---

## Conclusion

This app is designed to be a **calm companion** for self-reflection, not another productivity tool. Every design decision prioritizes peace, honesty, and simplicity.

The goal is not to track everything or maximize engagement. The goal is to create a quiet space where you can think honestly about one thoughtful question each day.

---

## License

MIT

---

## Contact

Built with calm and intention. 🌱

# Technical Implementation Details

## Pseudocode & Logic

### 1. Daily Question Selection Logic

**Goal**: Select one question per day deterministically based on the date.

```pseudocode
FUNCTION getQuestionForDate(dateString):
  // dateString format: "YYYY-MM-DD"
  
  // Step 1: Hash the date string
  hash = 0
  FOR each character in dateString:
    charCode = ASCII value of character
    hash = ((hash << 5) - hash) + charCode
    hash = hash & hash  // Convert to 32-bit integer
  END FOR
  
  // Step 2: Map hash to question index
  index = absoluteValue(hash) % totalQuestions
  
  // Step 3: Return question at index
  RETURN questions[index]
END FUNCTION
```

**Why this approach?**
- Same date → same hash → same question (deterministic)
- Works offline (no server needed)
- Even distribution across all questions
- Repeatable and testable

**Example**:
```typescript
// Date: "2026-01-29"
// Hash: -1829436574
// Absolute: 1829436574
// Index (90 questions): 1829436574 % 90 = 34
// Question: QUESTIONS[34]
```

---

### 2. Saving Answers Logic

**Goal**: Save user's answer for today and prevent duplicate answers for the same date.

```pseudocode
FUNCTION saveAnswer(answer):
  // answer contains: id, questionId, date, answerText, createdAt
  
  // Step 1: Load all existing answers
  allAnswers = loadFromStorage("@daily_questions:answers")
  
  // Step 2: Remove any existing answer for this date (shouldn't happen)
  filteredAnswers = allAnswers.filter(a => a.date != answer.date)
  
  // Step 3: Add new answer
  filteredAnswers.push(answer)
  
  // Step 4: Save back to storage
  saveToStorage("@daily_questions:answers", filteredAnswers)
  
  RETURN success
END FUNCTION
```

**Data Flow**:
```
User types answer
    ↓
Click "Save Answer"
    ↓
Create Answer object with:
  - id: timestamp as string
  - questionId: today's question ID
  - date: "YYYY-MM-DD"
  - answerText: user input
  - createdAt: timestamp
    ↓
Call saveAnswer()
    ↓
Store in AsyncStorage
    ↓
Refresh UI
    ↓
Show saved answer (locked state)
```

---

### 3. History Loading Logic

**Goal**: Display last 30 days with questions and answered state.

```pseudocode
FUNCTION loadHistory():
  // Step 1: Get past 30 dates
  dates = []
  today = currentDate()
  FOR i = 0 to 29:
    date = today - i days
    dates.push(formatAsYYYY-MM-DD(date))
  END FOR
  
  // Step 2: Load all answers
  answers = loadFromStorage("@daily_questions:answers")
  
  // Step 3: Create answer lookup map
  answerMap = createMap()
  FOR each answer in answers:
    answerMap[answer.date] = answer
  END FOR
  
  // Step 4: Generate history items
  historyItems = []
  FOR each date in dates:
    question = getQuestionForDate(date)
    answer = answerMap[date] OR null
    historyItems.push({
      date: date,
      question: question,
      answer: answer,
      isAnswered: answer != null
    })
  END FOR
  
  RETURN historyItems
END FUNCTION
```

**UI Behavior**:
- Answered items: Full color, clickable, show answer preview
- Unanswered items: Dimmed, not clickable, no preview

---

### 4. Notification Scheduling Logic

**Goal**: Send a gentle reminder at user's preferred time each day.

```pseudocode
FUNCTION scheduleDailyNotification(timeString):
  // timeString format: "09:00" (24-hour)
  
  // Step 1: Cancel any existing notifications
  cancelAllScheduledNotifications()
  
  // Step 2: Parse time
  [hours, minutes] = parseTime(timeString)
  
  // Step 3: Schedule repeating notification
  scheduleNotification({
    title: "A moment for reflection",
    body: "Today's question is waiting for you",
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true  // Daily
    },
    sound: false  // Silent, calm
  })
  
  RETURN success
END FUNCTION
```

**Permission Flow**:
```
User enables notification toggle
    ↓
Check if permission granted
    ↓
If NOT granted:
  Request permission
  If denied: Show alert, disable toggle
    ↓
If granted:
  Schedule notification at preferred time
    ↓
Save setting to storage
```

---

### 5. Theme Management Logic

**Goal**: Support light, dark, and auto themes with persistence.

```pseudocode
FUNCTION useTheme():
  // Step 1: Load saved theme preference
  savedTheme = loadFromStorage("theme") OR "auto"
  systemTheme = getSystemColorScheme() OR "light"
  
  // Step 2: Determine actual theme
  IF savedTheme == "auto":
    actualTheme = systemTheme
  ELSE:
    actualTheme = savedTheme
  END IF
  
  // Step 3: Get colors for theme
  colors = getColorsForTheme(actualTheme)
  
  RETURN {
    theme: actualTheme,
    themeMode: savedTheme,
    colors: colors,
    setTheme: FUNCTION(newMode)
  }
END FUNCTION
```

**Theme Cycle**:
```
Light → Dark → Auto → Light → ...
```

---

## Data Storage Schema

### AsyncStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `@daily_questions:answers` | `Array<Answer>` | All saved answers |
| `@daily_questions:settings` | `Settings` | User preferences |

### Storage Patterns

**Writing**:
```typescript
// Always stringify before saving
const data = JSON.stringify(object);
await AsyncStorage.setItem(key, data);
```

**Reading**:
```typescript
// Always parse after loading
const data = await AsyncStorage.getItem(key);
const object = data ? JSON.parse(data) : defaultValue;
```

**Clearing**:
```typescript
// Remove specific keys
await AsyncStorage.multiRemove([key1, key2]);
```

---

## Screen Flow Diagrams

### Today Screen Flow

```
App Launch
    ↓
Load theme from storage
    ↓
Render Today screen
    ↓
Get today's date (YYYY-MM-DD)
    ↓
Get question for today (deterministic)
    ↓
Check if answered for today
    ↓
┌─────────────┬─────────────┐
│ Answered    │ Not Answered│
└─────────────┴─────────────┘
      ↓              ↓
Show answer   Show input area
(locked)         (editable)
      ↓              ↓
              User types answer
                     ↓
              Click "Save"
                     ↓
              Save to storage
                     ↓
              Refresh screen
                     ↓
              Show answer (locked)
```

### History Screen Flow

```
User taps History tab
    ↓
Load answers
    ↓
┌──────────────┬──────────────────┐
│ Default      │ Search Mode      │
└──────────────┴──────────────────┘
    ↓                 ↓
List last 30    User types query
days              ↓
                Filter all answers
                by text/category
    ↓                 ↓
Tap item -> Open Modal (with Star button)
```

### Analysis Screen Flow

```
User taps Analysis tab
    ↓
Load all answers
    ↓
Analyze Pattern:
  - Count categories
  - Check frequency
  - Determine top themes
    ↓
Generate "AI Insight" text based on heuristic rules
    ↓
Render:
  - Insight Card
  - Themes Ranking
```

### Settings Screen Flow

```
User taps Settings tab
    ↓
Load settings from storage
    ↓
Display current values
    ↓
User interaction:
    ↓
┌────────────┬──────────────┬──────────────┐
│ Change     │ Toggle       │ Clear Data   │
│ Theme      │ Notification │              │
└────────────┴──────────────┴──────────────┘
     ↓              ↓               ↓
Cycle theme   Request perms   Show confirm
     ↓              ↓               ↓
Save to       Schedule notif  Clear storage
storage            ↓               ↓
     ↓         Save to         Reload app
Update UI     storage              
                   ↓
              Update UI
```

---

## Error Handling

### Storage Errors

```typescript
try {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
} catch (error) {
  console.error('Storage error:', error);
  return defaultValue;  // Always return a safe default
}
```

### Notification Permission Errors

```typescript
try {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    Alert.alert(
      'Permission Required',
      'Please enable notifications in settings'
    );
    return;
  }
  // Continue with scheduling...
} catch (error) {
  console.error('Notification error:', error);
  // Fail silently, don't break the app
}
```

### Question Selection Edge Cases

```typescript
// What if date is invalid?
function getQuestionForDate(dateString: string): Question {
  // Hash will still work with any string
  // Worst case: returns a valid question
  
  // What if hash is 0?
  // index = 0 % 90 = 0 (first question)
  
  // What if hash is negative?
  // Use Math.abs() to ensure positive index
  
  const index = Math.abs(hash) % QUESTIONS.length;
  return QUESTIONS[index];
}
```

---

## Performance Considerations

### Lazy Loading
- Questions: Loaded once at app start (small file)
- Answers: Loaded on demand per screen
- Settings: Loaded once and cached

### Optimization
- History: Only load 30 days (configurable)
- Answers: Sorted by date for quick lookup
- Theme: Use React context to avoid prop drilling

### Memory
- Total app size: ~5-10 MB
- Questions: ~50 KB
- Answers: ~1 KB per answer
- 365 answers = ~365 KB

---

## Testing Scenarios

### Manual Testing Checklist

**Today Screen**:
- [ ] Question changes at midnight
- [ ] Answer persists after save
- [ ] Cannot edit after answering
- [ ] Loading state shows briefly
- [ ] Theme switches correctly

**History Screen**:
- [ ] Shows 30 days
- [ ] Answered items are highlighted
- [ ] Unanswered items are dimmed
- [ ] Modal opens on tap (answered only)
- [ ] Scroll performance is smooth

**Settings Screen**:
- [ ] Theme cycles correctly
- [ ] Notification permission requests
- [ ] Clear data shows confirmation
- [ ] Clear data actually clears
- [ ] Settings persist after restart

**Edge Cases**:
- [ ] First-time launch (no data)
- [ ] App works offline
- [ ] Same question on all devices (same date)
- [ ] Notification fires at correct time
- [ ] Theme follows system in "auto" mode

---

## Deployment Checklist

### Before Release
1. [ ] Test on iOS and Android
2. [ ] Test light and dark modes
3. [ ] Test all 90 questions render correctly
4. [ ] Test notifications work
5. [ ] Test offline mode
6. [ ] Update app icon
7. [ ] Update splash screen
8. [ ] Set proper app name
9. [ ] Configure bundle identifiers
10. [ ] Test on physical devices

### App Store Requirements
- **Name**: Daily Questions
- **Tagline**: "One question a day for honest reflection"
- **Description**: (See README philosophy section)
- **Category**: Health & Fitness or Lifestyle
- **Age Rating**: 4+
- **Privacy**: No data collection

---

## Future Technical Improvements

### Possible Enhancements
1. **SQLite** - For better performance with many answers
2. **Encryption** - Encrypt answers locally
3. **Export** - Generate PDF or text export
4. **Backup** - Optional iCloud/Google Drive backup (user-controlled)
5. **Accessibility** - VoiceOver support, dynamic text sizing
6. **Analytics** - Local-only analytics (no tracking)

### Performance Optimizations
1. **FlatList** - Use FlatList for history (if > 100 items)
2. **Memoization** - Memoize question selection
3. **Lazy Loading** - Load answers in batches
4. **Image Optimization** - If custom icons added

---

This completes the technical documentation for the Daily Questions App. 🌱

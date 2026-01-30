# Journal Feature

## Overview
A free-form daily journal screen that complements the structured daily questions with unstructured, personal reflection space.

## Features ✨

### Core Functionality
- ✅ **Multiple entries per day** - Write as many times as you want
- ✅ **Real-time word count** - Track your writing as you type
- ✅ **Time-stamped entries** - See when you wrote each entry
- ✅ **Quick save & clear** - Easy actions for managing your writing
- ✅ **Delete protection** - Confirmation dialog before deleting
- ✅ **Daily word count** - See total words written today
- ✅ **Offline-first** - All data stored locally with AsyncStorage
- ✅ **Auto-expanding input** - Expands when focused for better writing experience

### User Experience
- **Calm Interface** - Clean, distraction-free writing space
- **Keyboard Aware** - Automatically adjusts for keyboard
- **Empty State** - Gentle encouragement to start writing
- **Today Focus** - Shows only today's entries for clarity
- **Visual Hierarchy** - Clear separation between writing area and past entries

## Use Cases

Perfect for:
- 🌅 **Morning Pages** - Start your day with free writing
- 💭 **Random Thoughts** - Capture ideas throughout the day
- 🎯 **Goal Setting** - Write down daily intentions
- 🙏 **Gratitude** - Quick gratitude moments
- 📝 **Note Taking** - Jot down reminders or insights
- 🧘 **Mindfulness** - Reflect on your state of mind
- 💡 **Idea Capture** - Save creative thoughts instantly

## Technical Implementation

### Storage
- Uses AsyncStorage with key `@journal_entries`
- Each entry includes:
  ```typescript
  {
    id: string;        // Unique timestamp-based ID
    text: string;      // The actual journal entry
    date: string;      // ISO date (YYYY-MM-DD)
    timestamp: number; // Full timestamp for ordering
    wordCount: number; // Pre-calculated word count
  }
  ```

### Data Flow
1. **Load**: Filters all entries to show only today's
2. **Write**: Real-time word count updates
3. **Save**: Validates, saves, clears input, reloads
4. **Delete**: Confirms, removes, reloads

### Components Used
- SafeAreaView with edges for proper spacing
- KeyboardAvoidingView for iOS keyboard handling
- ScrollView with keyboard persistence
- TextInput with auto-resize on focus
- Ionicons for consistent icon design

## Design Philosophy

### Why This Is Useful Daily
1. **No Pressure** - Unlike the daily question, there's no "right" answer
2. **Unlimited** - Write as much or as little as you want
3. **Any Time** - Not locked to once per day
4. **Freedom** - No prompts, no structure, just you
5. **Quick** - Fast capture when inspiration strikes

### Complements Daily Questions
- **Structured** (Daily Q) + **Unstructured** (Journal)
- **Reflective** (Daily Q) + **Spontaneous** (Journal)
- **Once Daily** (Daily Q) + **Multiple Times** (Journal)

## User Benefits

### Mental Health
- Emotional processing through writing
- Stress relief and clarity
- Pattern recognition over time
- Self-awareness development

### Productivity
- Idea capture prevents forgetting
- Morning intention setting
- Evening reflection
- Progress tracking

### Creativity
- Stream of consciousness writing
- Idea development
- Creative problem solving
- Inspiration logging

## Tab Navigation

Position: **2nd tab** (between Today and Journal)
- Icon: `create-outline` (pencil/writing icon)
- Label: "Journal"
- Always accessible from bottom tab bar

## Future Enhancements

Possible additions:
- [ ] View past days' entries
- [ ] Search across all entries
- [ ] Export to text/markdown
- [ ] Tags or categories
- [ ] Images/voice notes
- [ ] Streaks tracking
- [ ] Writing prompts (optional)
- [ ] Daily statistics graph
- [ ] Favorites/highlights
- [ ] Rich text formatting

## Statistics

Each entry shows:
- ⏰ Time written
- 📝 Word count
- 🗑️ Delete option

Daily summary shows:
- Total words written today
- Number of entries

## Best Practices

### For Users
- Write freely, don't self-edit
- Capture thoughts immediately
- Review before deleting
- Use throughout the day
- No minimum or maximum

### For Development
- Keep interface minimal
- Fast save/load operations
- Safe data handling
- Clear user feedback
- Respect privacy (local storage only)

---

**Status**: ✅ Complete and integrated
**Location**: `/app/(tabs)/journal.tsx`
**Storage**: Local (AsyncStorage)
**Created**: January 30, 2026

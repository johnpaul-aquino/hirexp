# AI Chit Chat - UI/UX Mockups & Design

## Design Philosophy

The AI Chit Chat interface follows a familiar messaging app paradigm to reduce learning curve while incorporating educational features seamlessly. The design prioritizes clarity, engagement, and non-intrusive feedback mechanisms.

## Color Palette

```scss
// Primary Colors
$primary-blue: #0066FF;      // Main actions, send button
$primary-green: #00C853;     // Success, correct feedback
$primary-orange: #FF6B35;    // Warnings, improvements needed
$primary-purple: #7C4DFF;    // AI responses, special features

// Neutral Colors
$gray-900: #1A1A1A;         // Main text
$gray-700: #4A4A4A;         // Secondary text
$gray-500: #7A7A7A;         // Disabled state
$gray-300: #DADADA;         // Borders
$gray-100: #F5F5F5;         // Background

// Semantic Colors
$error: #FF3B30;            // Critical errors
$warning: #FF9500;          // Warnings
$success: #34C759;          // Success states
$info: #007AFF;             // Information

// Dark Mode
$dark-bg: #1C1C1E;
$dark-surface: #2C2C2E;
$dark-border: #38383A;
```

## Layout Structure

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────┐
│                   Header Bar                    │
│  [← Back]  AI Chit Chat - Intermediate  [End]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────┬────────────────┐ │
│  │                          │                │ │
│  │     Chat Interface       │   Side Panel   │ │
│  │       (70%)             │     (30%)      │ │
│  │                          │                │ │
│  │  ┌──────────────────┐   │  Performance   │ │
│  │  │                  │   │    Metrics     │ │
│  │  │   Message Area   │   │                │ │
│  │  │                  │   │  Quick Tips    │ │
│  │  └──────────────────┘   │                │ │
│  │                          │  Vocabulary    │ │
│  │  ┌──────────────────┐   │    Helper     │ │
│  │  │   Input Area     │   │                │ │
│  │  └──────────────────┘   └────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────┐
│   Header Bar    │
│ [☰] Chat [📊]   │
├─────────────────┤
│                 │
│                 │
│  Message Area   │
│                 │
│                 │
├─────────────────┤
│  Input Area     │
│ [🎤] [...] [→]  │
└─────────────────┘
```

## Component Specifications

### 1. Header Bar

```jsx
<HeaderBar>
  <BackButton onClick={navigateBack} />
  <Title>
    <ModuleName>AI Chit Chat</ModuleName>
    <Level badge>Intermediate</Level>
    <Timer>15:32</Timer>
  </Title>
  <Actions>
    <IconButton icon="settings" />
    <IconButton icon="help" />
    <Button variant="outlined" color="error">End Session</Button>
  </Actions>
</HeaderBar>
```

**Specifications:**
- Height: 64px
- Background: White/Dark surface
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Sticky positioning

### 2. Chat Interface

#### Message Bubble - User

```jsx
<UserMessage>
  <MessageContent>
    I goes to the store yesterday to bought some foods.
  </MessageContent>
  <MessageMeta>
    <Timestamp>2:30 PM</Timestamp>
    <Status icon="check" />
  </MessageMeta>
  <InlineFeedback type="grammar">
    <Correction>"goes" → "went"</Correction>
    <Correction>"bought" → "buy"</Correction>
    <Correction>"foods" → "food"</Correction>
  </InlineFeedback>
</UserMessage>
```

**Design Specs:**
- Background: #E3F2FD (Light Blue)
- Border-radius: 18px 18px 4px 18px
- Padding: 12px 16px
- Max-width: 70%
- Font-size: 16px
- Corrections: Underline with dotted orange

#### Message Bubble - AI Assistant

```jsx
<AIMessage>
  <Avatar src="/ai-avatar.png" />
  <MessageContent>
    Great effort! I understand you went shopping yesterday.
    Just a quick note: we say "I went" for past tense.
    What kind of food did you buy?
  </MessageContent>
  <MessageActions>
    <IconButton icon="volume" tooltip="Listen" />
    <IconButton icon="slow" tooltip="Slow speed" />
    <IconButton icon="translate" tooltip="Translate" />
  </MessageActions>
</AIMessage>
```

**Design Specs:**
- Background: #F3E5F5 (Light Purple)
- Border-radius: 18px 18px 18px 4px
- Avatar: 32px circular
- Actions: Appear on hover/tap

### 3. Input Area

```jsx
<InputArea>
  <InputContainer>
    <VoiceButton
      onPress={startRecording}
      onRelease={stopRecording}
      isRecording={isRecording}
    >
      <MicIcon animated={isRecording} />
    </VoiceButton>

    <TextInput
      placeholder="Type your message..."
      multiline
      maxRows={4}
      value={message}
      onChange={handleChange}
      corrections={suggestions}
    />

    <AttachButton>
      <PaperclipIcon />
    </AttachButton>

    <SendButton
      disabled={!message}
      loading={isSending}
    >
      <SendIcon />
    </SendButton>
  </InputContainer>

  <TypingIndicator visible={aiIsTyping}>
    AI is typing...
  </TypingIndicator>

  <QuickActions>
    <Chip>Help me</Chip>
    <Chip>Repeat</Chip>
    <Chip>Slower</Chip>
    <Chip>Example</Chip>
  </QuickActions>
</InputArea>
```

**Specifications:**
- Background: White with top border
- Min-height: 56px
- Voice button: 40px, red when recording
- Send button: Primary blue when active
- Quick actions: Horizontal scroll on mobile

### 4. Side Panel (Desktop Only)

#### Performance Metrics Widget

```jsx
<MetricsWidget>
  <WidgetHeader>
    <Title>Session Performance</Title>
    <IconButton icon="refresh" />
  </WidgetHeader>

  <MetricsList>
    <MetricItem>
      <Label>Grammar</Label>
      <ProgressBar value={78} color="green" />
      <Value>78%</Value>
    </MetricItem>

    <MetricItem>
      <Label>Fluency</Label>
      <ProgressBar value={65} color="orange" />
      <Value>65%</Value>
    </MetricItem>

    <MetricItem>
      <Label>Vocabulary</Label>
      <ProgressBar value={82} color="green" />
      <Value>82%</Value>
    </MetricItem>
  </MetricsList>

  <TrendIndicator>
    <Icon name="trending-up" color="green" />
    <Text>+5% from last session</Text>
  </TrendIndicator>
</MetricsWidget>
```

#### Vocabulary Helper

```jsx
<VocabularyHelper>
  <SearchBar
    placeholder="Look up a word..."
    icon="search"
  />

  <RecentWords>
    <WordCard>
      <Word>purchase</Word>
      <Definition>to buy something</Definition>
      <Example>I purchased groceries.</Example>
      <Actions>
        <IconButton icon="volume" />
        <IconButton icon="bookmark" />
      </Actions>
    </WordCard>
  </RecentWords>

  <SuggestedPhrases>
    <Title>Try using these:</Title>
    <PhraseChip>Could you repeat that?</PhraseChip>
    <PhraseChip>I'm not sure about...</PhraseChip>
    <PhraseChip>What does ... mean?</PhraseChip>
  </SuggestedPhrases>
</VocabularyHelper>
```

### 5. Voice Recording Interface

```jsx
<VoiceRecordingModal open={isRecording}>
  <Visualizer>
    <WaveformAnimation amplitude={audioLevel} />
  </Visualizer>

  <Timer>{formatTime(recordingDuration)}</Timer>

  <RecordButton
    onMouseDown={startRecording}
    onMouseUp={stopRecording}
  >
    <MicrophoneIcon size="large" pulsing />
    <Label>Hold to speak</Label>
  </RecordButton>

  <Controls>
    <Button variant="text">Cancel</Button>
    <Button variant="contained">Send</Button>
  </Controls>

  <Transcript>
    {liveTranscript}
  </Transcript>
</VoiceRecordingModal>
```

## Interactive States

### Loading States

```jsx
// Message sending
<LoadingBubble>
  <DotAnimation />
  <Text>AI is thinking...</Text>
</LoadingBubble>

// Voice processing
<ProcessingIndicator>
  <Spinner />
  <Text>Processing audio...</Text>
</ProcessingIndicator>
```

### Error States

```jsx
<ErrorMessage>
  <Icon name="warning" color="error" />
  <Text>Connection lost. Trying to reconnect...</Text>
  <RetryButton>Retry Now</RetryButton>
</ErrorMessage>
```

### Empty States

```jsx
<EmptyState>
  <Illustration src="/chat-welcome.svg" />
  <Title>Ready to practice?</Title>
  <Description>
    Start a conversation about any topic you like!
  </Description>
  <SuggestionCards>
    <Card>Talk about your day</Card>
    <Card>Discuss hobbies</Card>
    <Card>Practice job interview</Card>
  </SuggestionCards>
</EmptyState>
```

## Feedback Mechanisms

### Inline Corrections

```scss
.grammar-error {
  border-bottom: 2px wavy $warning;
  cursor: help;

  &:hover {
    .correction-tooltip {
      display: block;
    }
  }
}

.correction-tooltip {
  position: absolute;
  background: $dark-surface;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}
```

### Achievement Notifications

```jsx
<AchievementToast>
  <Trophy animated />
  <Content>
    <Title>Vocabulary Master!</Title>
    <Description>You've used 10 new words correctly</Description>
  </Content>
  <Points>+50 XP</Points>
</AchievementToast>
```

## Responsive Breakpoints

```scss
// Breakpoints
$mobile: 375px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;

// Layout adjustments
@media (max-width: $tablet) {
  .side-panel { display: none; }
  .chat-interface { width: 100%; }
}

@media (min-width: $desktop) {
  .container { max-width: 1200px; }
  .side-panel { display: block; }
}
```

## Accessibility Features

### Keyboard Navigation

```jsx
// Tab order
1. Back button
2. Settings
3. Message input
4. Send button
5. Voice button
6. Messages (scrollable region)
7. Side panel widgets

// Shortcuts
Cmd/Ctrl + Enter: Send message
Escape: Close modals
Space: Play/pause audio
Arrow keys: Navigate messages
```

### Screen Reader Support

```jsx
<Message
  role="article"
  aria-label={`Message from ${sender} at ${time}`}
>
  <Content aria-live="polite">
    {messageText}
  </Content>
  <Feedback
    role="alert"
    aria-label="Grammar correction"
  >
    {correction}
  </Feedback>
</Message>
```

### High Contrast Mode

```scss
@media (prefers-contrast: high) {
  .message-bubble {
    border: 2px solid currentColor;
  }

  .button {
    border: 2px solid currentColor;
    font-weight: bold;
  }
}
```

## Animation Guidelines

### Micro-interactions

```scss
// Button press
.button {
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.95);
  }
}

// Message appear
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: slideIn 0.3s ease;
}
```

### Loading Animations

```scss
// Typing indicator
@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.typing-dot {
  animation: typing 1.4s infinite;

  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
```

## Performance Considerations

### Image Optimization

- Avatar images: 32x32px, WebP format
- Illustrations: SVG when possible
- Lazy load images below the fold
- Use CDN for static assets

### Render Optimization

```jsx
// Virtualize long message lists
<VirtualList
  height={600}
  itemCount={messages.length}
  itemSize={80}
  overscan={5}
>
  {MessageComponent}
</VirtualList>
```

---

*Document Version: 1.0*
*Last Updated: October 2025*
*Next Review: November 2025*
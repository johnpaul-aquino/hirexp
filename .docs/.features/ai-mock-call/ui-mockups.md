# AI Mock Call - UI/UX Mockups & Design

## Design Philosophy

The AI Mock Call interface simulates a professional call center environment while maintaining user-friendly training features. The design balances realism with educational support to create an immersive yet comfortable learning experience.

## Visual Theme

### Call Center Aesthetic

```scss
// Color Palette - Professional Call Center
$primary-navy: #1E3A5F;       // Main interface
$accent-green: #00C853;       // Active/Success
$accent-red: #FF3B30;         // Alerts/Warnings
$accent-orange: #FF9500;      // Caution/Hold
$accent-blue: #007AFF;        // Information

// Status Colors
$status-available: #00C853;    // Ready
$status-busy: #FF9500;         // In call
$status-hold: #007AFF;         // On hold
$status-offline: #6C757D;      // Not ready

// Background Colors
$bg-primary: #F8F9FA;          // Main background
$bg-secondary: #FFFFFF;        // Card background
$bg-dark: #212529;             // Dark mode

// Call States
$call-active: #00C853;
$call-hold: #FFC107;
$call-muted: #6C757D;
$call-ended: #DC3545;
```

## Layout Structure

### Desktop Layout (1920px)

```
┌──────────────────────────────────────────────────────────┐
│                      Header Bar                           │
│  [HireXp Logo] Mock Call Training    [Timer] [End Call]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┬────────────────┬─────────────────┐ │
│  │                 │                │                 │ │
│  │  Customer Info  │  Call Display  │  Resources      │ │
│  │     (20%)       │     (50%)      │     (30%)       │ │
│  │                 │                │                 │ │
│  │  Profile        │  Audio Visual  │  Knowledge Base │ │
│  │  Scenario       │  Transcript    │  Scripts        │ │
│  │  Mood Meter     │  Controls      │  Notes          │ │
│  │                 │                │                 │ │
│  └─────────────────┴────────────────┴─────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Performance Dashboard                │   │
│  │    Real-time Metrics  |  Feedback  |  Actions    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────┐
│   Header Bar    │
│ ◄ Mock Call 8:45│
├─────────────────┤
│                 │
│  Call Display   │
│   [Avatar]      │
│  Customer Name  │
│                 │
│  ■□□□□□□□□□     │
│  Audio Visual   │
│                 │
├─────────────────┤
│   Quick Info    │
│ [i] [📋] [💡]   │
├─────────────────┤
│  Call Controls  │
│ [🔇] [⏸] [📞]   │
└─────────────────┘
```

## Component Specifications

### 1. Scenario Briefing Screen

```jsx
<ScenarioBriefing>
  <Header>
    <Title>Scenario: Billing Dispute</Title>
    <Difficulty level="intermediate">
      <Stars count={3} max={5} />
      <Label>Intermediate</Label>
    </Difficulty>
  </Header>

  <CustomerCard>
    <Avatar src="/avatars/customer-45.jpg" />
    <CustomerInfo>
      <Name>Robert Johnson</Name>
      <Account>Account #: 784512369</Account>
      <Status>Premium Customer • 5 Years</Status>
    </CustomerInfo>
    <MoodIndicator level={65}>
      <Icon name="frustrated" />
      <Label>Frustrated</Label>
      <ProgressBar value={65} color="orange" />
    </MoodIndicator>
  </CustomerCard>

  <Briefing>
    <Section>
      <SectionTitle>Situation</SectionTitle>
      <Content>
        Customer's bill shows $150 in unexpected charges.
        This is the second time calling about this issue.
      </Content>
    </Section>

    <Section>
      <SectionTitle>Your Objective</SectionTitle>
      <Objectives>
        <Objective priority="high">Identify billing error</Objective>
        <Objective priority="high">Resolve the issue</Objective>
        <Objective priority="medium">Retain customer</Objective>
        <Objective priority="low">Upsell if possible</Objective>
      </Objectives>
    </Section>

    <Section>
      <SectionTitle>Available Resources</SectionTitle>
      <Resources>
        <Resource icon="policy">Refund Policy</Resource>
        <Resource icon="system">Billing System</Resource>
        <Resource icon="script">Retention Scripts</Resource>
      </Resources>
    </Section>
  </Briefing>

  <Actions>
    <Button variant="secondary">Review Resources</Button>
    <Button variant="primary" size="large">
      Start Call <PhoneIcon />
    </Button>
  </Actions>
</ScenarioBriefing>
```

### 2. Main Call Interface

#### Call Display Area

```jsx
<CallDisplay>
  <CustomerHeader>
    <CustomerAvatar>
      <Image src="/avatar.jpg" />
      <MoodRing mood={currentMood} />
    </CustomerAvatar>
    <CustomerDetails>
      <Name>Robert Johnson</Name>
      <PhoneNumber>(555) 123-4567</PhoneNumber>
      <AccountBadges>
        <Badge type="premium">Premium</Badge>
        <Badge type="loyalty">5 Years</Badge>
        <Badge type="value">High Value</Badge>
      </AccountBadges>
    </CustomerDetails>
    <CallTimer>
      <Time>05:23</Time>
      <Label>Call Duration</Label>
    </CallTimer>
  </CustomerHeader>

  <AudioVisualizer>
    <WaveformCanvas>
      {/* Real-time audio waveform */}
      <CustomerWaveform amplitude={customerAudio} />
      <AgentWaveform amplitude={agentAudio} />
    </WaveformCanvas>

    <SpeakerIndicator active={currentSpeaker}>
      {currentSpeaker === 'customer' ? '🗣️ Customer' : '🎧 You'}
    </SpeakerIndicator>
  </AudioVisualizer>

  <TranscriptArea>
    <TranscriptMessage speaker="agent">
      <Avatar>You</Avatar>
      <Text>
        Thank you for calling TechSupport Inc. My name is Sarah.
        How may I assist you today?
      </Text>
      <Feedback type="positive">Great greeting! ✓</Feedback>
    </TranscriptMessage>

    <TranscriptMessage speaker="customer" emotion="frustrated">
      <Avatar>RJ</Avatar>
      <Text>
        I'm calling about my bill AGAIN! This is ridiculous!
      </Text>
      <EmotionTag>Frustrated 😤</EmotionTag>
    </TranscriptMessage>

    <SystemMessage type="tip">
      💡 Tip: Acknowledge frustration before proceeding
    </SystemMessage>
  </TranscriptArea>

  <CallControls>
    <ControlButton
      icon="microphone"
      active={!isMuted}
      onClick={toggleMute}
      label="Mute"
    />
    <ControlButton
      icon="pause"
      active={isOnHold}
      onClick={toggleHold}
      label="Hold"
    />
    <ControlButton
      icon="transfer"
      onClick={openTransfer}
      label="Transfer"
    />
    <ControlButton
      icon="notes"
      onClick={openNotes}
      label="Notes"
    />
    <ControlButton
      icon="end-call"
      danger
      onClick={endCall}
      label="End Call"
    />
  </CallControls>
</CallDisplay>
```

### 3. Customer Information Panel

```jsx
<CustomerInfoPanel>
  <TabContainer>
    <Tab active>Profile</Tab>
    <Tab>History</Tab>
    <Tab>Mood</Tab>
  </TabContainer>

  <ProfileTab>
    <InfoSection>
      <InfoRow>
        <Label>Account #:</Label>
        <Value>784512369</Value>
        <CopyButton />
      </InfoRow>
      <InfoRow>
        <Label>Service Plan:</Label>
        <Value>Premium Unlimited</Value>
      </InfoRow>
      <InfoRow>
        <Label>Monthly Bill:</Label>
        <Value>$89.99</Value>
      </InfoRow>
      <InfoRow>
        <Label>Payment Status:</Label>
        <Value>
          <StatusBadge type="success">Current</StatusBadge>
        </Value>
      </InfoRow>
    </InfoSection>

    <AlertSection>
      <Alert type="warning">
        <AlertTitle>Previous Issues</AlertTitle>
        <AlertContent>
          2 calls in last 30 days about billing
        </AlertContent>
      </Alert>
    </AlertSection>

    <NotesSection>
      <NotesTitle>Previous Agent Notes</NotesTitle>
      <Note date="Oct 1">
        Promised credit would appear on next bill - Agent Mike
      </Note>
      <Note date="Sep 15">
        Customer complained about same charge - Agent Lisa
      </Note>
    </NotesSection>
  </ProfileTab>

  <MoodTab>
    <MoodMeter>
      <MoodScale>
        <Marker position={customerMood}>
          <MoodIcon mood={customerMood} />
          <MoodValue>{customerMood}/100</MoodValue>
        </Marker>
      </MoodScale>
      <MoodLabels>
        <Label>😊 Happy</Label>
        <Label>😐 Neutral</Label>
        <Label>😤 Angry</Label>
      </MoodLabels>
    </MoodMeter>

    <MoodHistory>
      <HistoryItem>
        <Time>0:00</Time>
        <Change>Started at 65 (Frustrated)</Change>
      </HistoryItem>
      <HistoryItem positive>
        <Time>2:15</Time>
        <Change>+10 (Acknowledged issue)</Change>
      </HistoryItem>
      <HistoryItem negative>
        <Time>3:45</Time>
        <Change>-5 (Put on hold)</Change>
      </HistoryItem>
    </MoodHistory>
  </MoodTab>
</CustomerInfoPanel>
```

### 4. Resources Panel

```jsx
<ResourcesPanel>
  <ResourceTabs>
    <Tab icon="book" active>Knowledge Base</Tab>
    <Tab icon="script">Scripts</Tab>
    <Tab icon="policy">Policies</Tab>
    <Tab icon="notes">My Notes</Tab>
  </ResourceTabs>

  <SearchBar>
    <SearchInput placeholder="Search resources..." />
    <SearchButton />
  </SearchBar>

  <KnowledgeBaseTab>
    <QuickLinks>
      <QuickLink>Billing Dispute Process</QuickLink>
      <QuickLink>Refund Authorization</QuickLink>
      <QuickLink>Account Credits</QuickLink>
      <QuickLink>Escalation Procedures</QuickLink>
    </QuickLinks>

    <ArticleView>
      <ArticleTitle>Billing Dispute Resolution</ArticleTitle>
      <ArticleContent>
        <Step number={1}>
          Verify customer identity and account
        </Step>
        <Step number={2}>
          Review billing history and identify discrepancy
        </Step>
        <Step number={3} highlighted>
          Offer appropriate resolution:
          - Credit up to $200 without supervisor
          - Refund last 3 months if error confirmed
        </Step>
      </ArticleContent>
    </ArticleView>
  </KnowledgeBaseTab>

  <ScriptsTab>
    <ScriptCategory>
      <CategoryTitle>Empathy Statements</CategoryTitle>
      <Script>
        "I completely understand your frustration, Mr. Johnson."
        <CopyButton />
      </Script>
      <Script>
        "I apologize for this inconvenience."
        <CopyButton />
      </Script>
    </ScriptCategory>

    <ScriptCategory>
      <CategoryTitle>Resolution Offers</CategoryTitle>
      <Script>
        "I'll credit your account immediately with the full amount."
        <CopyButton />
      </Script>
    </ScriptCategory>
  </ScriptsTab>

  <NotesTab>
    <NoteEditor>
      <Toolbar>
        <FormatButton icon="bold" />
        <FormatButton icon="italic" />
        <FormatButton icon="bullet-list" />
      </Toolbar>
      <TextArea
        placeholder="Take notes during the call..."
        value={notes}
        onChange={updateNotes}
      />
      <AutoSaveIndicator saved={true}>
        Auto-saved
      </AutoSaveIndicator>
    </NoteEditor>
  </NotesTab>
</ResourcesPanel>
```

### 5. Performance Dashboard

```jsx
<PerformanceDashboard>
  <MetricsSection>
    <MetricCard>
      <MetricIcon>⏱️</MetricIcon>
      <MetricValue>5:23</MetricValue>
      <MetricLabel>Call Time</MetricLabel>
      <MetricTarget>Target: < 8:00</MetricTarget>
    </MetricCard>

    <MetricCard status="good">
      <MetricIcon>😊</MetricIcon>
      <MetricValue>70</MetricValue>
      <MetricLabel>Satisfaction</MetricLabel>
      <MetricChange>+5 from start</MetricChange>
    </MetricCard>

    <MetricCard status="warning">
      <MetricIcon>🎯</MetricIcon>
      <MetricValue>75%</MetricValue>
      <MetricLabel>Quality Score</MetricLabel>
      <MetricHint>Needs more empathy</MetricHint>
    </MetricCard>

    <MetricCard>
      <MetricIcon>✅</MetricIcon>
      <MetricValue>3/5</MetricValue>
      <MetricLabel>Objectives Met</MetricLabel>
    </MetricCard>
  </MetricsSection>

  <FeedbackSection>
    <LiveFeedback>
      <FeedbackItem type="positive" time="2:15">
        ✅ Good empathy statement
      </FeedbackItem>
      <FeedbackItem type="tip" time="3:45">
        💡 Consider offering callback
      </FeedbackItem>
      <FeedbackItem type="warning" time="5:20">
        ⚠️ Customer getting impatient
      </FeedbackItem>
    </LiveFeedback>
  </FeedbackSection>

  <ActionsSection>
    <ActionButton icon="supervisor">
      Request Supervisor
    </ActionButton>
    <ActionButton icon="system">
      Check System
    </ActionButton>
    <ActionButton icon="offer">
      Make Offer
    </ActionButton>
  </ActionsSection>
</PerformanceDashboard>
```

### 6. Call End Summary

```jsx
<CallSummary>
  <Header>
    <Title>Call Completed</Title>
    <OverallScore score={82}>
      <ScoreCircle>
        <ScoreValue>82</ScoreValue>
        <ScoreLabel>Overall Score</ScoreLabel>
      </ScoreCircle>
      <Grade>B+</Grade>
    </OverallScore>
  </Header>

  <PerformanceBreakdown>
    <CategoryScore>
      <Icon>👋</Icon>
      <Label>Greeting</Label>
      <ProgressBar value={95} />
      <Score>95%</Score>
    </CategoryScore>

    <CategoryScore>
      <Icon>👂</Icon>
      <Label>Listening</Label>
      <ProgressBar value={78} />
      <Score>78%</Score>
    </CategoryScore>

    <CategoryScore>
      <Icon>💡</Icon>
      <Label>Solution</Label>
      <ProgressBar value={85} />
      <Score>85%</Score>
    </CategoryScore>

    <CategoryScore>
      <Icon>💬</Icon>
      <Label>Communication</Label>
      <ProgressBar value={80} />
      <Score>80%</Score>
    </CategoryScore>

    <CategoryScore>
      <Icon>❤️</Icon>
      <Label>Empathy</Label>
      <ProgressBar value={70} />
      <Score>70%</Score>
    </CategoryScore>
  </PerformanceBreakdown>

  <KeyMoments>
    <MomentCard type="success">
      <Timestamp>2:15</Timestamp>
      <Description>
        Excellent empathy statement calmed customer
      </Description>
      <Impact>+15 satisfaction</Impact>
    </MomentCard>

    <MomentCard type="improvement">
      <Timestamp>3:45</Timestamp>
      <Description>
        Missed opportunity to offer callback
      </Description>
      <Suggestion>
        "I can have a manager call you back within 2 hours"
      </Suggestion>
    </MomentCard>
  </KeyMoments>

  <Actions>
    <Button variant="secondary" icon="replay">
      Try Again
    </Button>
    <Button variant="secondary" icon="play">
      Review Recording
    </Button>
    <Button variant="primary" icon="next">
      Next Scenario
    </Button>
  </Actions>
</CallSummary>
```

## Interactive States

### Voice Activity Animation

```scss
@keyframes voice-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.speaking-indicator {
  animation: voice-pulse 0.5s infinite;

  &.customer {
    background: linear-gradient(45deg, #FF6B35, #FF9500);
  }

  &.agent {
    background: linear-gradient(45deg, #007AFF, #00C853);
  }
}
```

### Mood Change Animations

```scss
.mood-indicator {
  transition: all 0.5s ease;

  &.improving {
    animation: pulse-green 1s;
  }

  &.declining {
    animation: pulse-red 1s;
  }
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0); }
  50% { box-shadow: 0 0 20px 10px rgba(0, 200, 83, 0.3); }
}
```

## Responsive Design

### Breakpoints

```scss
$mobile: 375px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;
$ultra-wide: 1920px;

// Layout adjustments
@media (max-width: $tablet) {
  .resources-panel { display: none; }
  .customer-info { position: fixed; bottom: 0; }
  .call-display { width: 100%; }
}

@media (min-width: $desktop) {
  .layout { display: grid; grid-template-columns: 1fr 2fr 1fr; }
}

@media (min-width: $ultra-wide) {
  .container { max-width: 1920px; margin: 0 auto; }
}
```

## Accessibility Features

### Keyboard Shortcuts

```javascript
const keyboardShortcuts = {
  'Space': 'Toggle Mute',
  'H': 'Toggle Hold',
  'T': 'Open Transfer',
  'N': 'Open Notes',
  'Escape': 'Emergency End Call',
  'Cmd+S': 'Save Notes',
  'Cmd+K': 'Search Knowledge Base',
  'Cmd+/': 'Show Shortcuts'
};
```

### Screen Reader Support

```jsx
<CallInterface
  role="application"
  aria-label="Mock call training interface"
>
  <LiveRegion
    aria-live="polite"
    aria-atomic="true"
  >
    {currentTranscript}
  </LiveRegion>

  <CustomerMood
    role="status"
    aria-label={`Customer mood: ${moodLevel} out of 100`}
  />
</CallInterface>
```

## Performance Considerations

### Optimization Strategies

```typescript
// Audio buffering
const audioBuffer = {
  size: 4096,
  latency: 'interactive',
  echoCancellation: true,
  noiseSuppression: true
};

// Transcript virtualization
const transcriptConfig = {
  itemHeight: 80,
  overscan: 5,
  maxItems: 100
};

// Resource caching
const cacheStrategy = {
  scripts: 'aggressive',
  policies: 'moderate',
  knowledgeBase: 'on-demand'
};
```

---

*Document Version: 1.0*
*Last Updated: October 2025*
*Next Review: November 2025*
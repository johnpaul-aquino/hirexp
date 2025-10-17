# Evaluation Engine - Scoring Algorithms

## Overview

This document details the mathematical algorithms and scoring methodologies used to evaluate user performance across different training modules. Each algorithm is designed to provide accurate, consistent, and pedagogically meaningful assessments.

## Core Scoring Algorithms

### 1. Grammar Accuracy Algorithm

```typescript
// lib/evaluation/algorithms/grammar-scorer.ts
export class GrammarScorer {
  private grammarChecker: LanguageTool;
  private errorWeights: Map<string, number>;

  constructor() {
    this.grammarChecker = new LanguageTool();
    this.initializeErrorWeights();
  }

  private initializeErrorWeights(): void {
    this.errorWeights = new Map([
      ['CRITICAL_ERROR', 10],     // Makes sentence incomprehensible
      ['MAJOR_ERROR', 5],          // Significant grammar mistake
      ['MINOR_ERROR', 2],          // Small mistake
      ['STYLE_ISSUE', 1],          // Style preference
      ['TYPO', 0.5]                // Simple typo
    ]);
  }

  async calculateGrammarScore(text: string): Promise<GrammarScore> {
    // Tokenize into sentences
    const sentences = this.tokenizeSentences(text);
    const totalSentences = sentences.length;

    // Check each sentence
    const errors: GrammarError[] = [];
    for (const sentence of sentences) {
      const sentenceErrors = await this.grammarChecker.check(sentence);
      errors.push(...sentenceErrors);
    }

    // Calculate error density
    const errorDensity = this.calculateErrorDensity(errors, text);

    // Calculate score
    const baseScore = 100;
    const deduction = this.calculateDeduction(errors, totalSentences);
    const finalScore = Math.max(0, baseScore - deduction);

    return {
      score: finalScore,
      errors,
      errorDensity,
      details: this.generateDetails(errors)
    };
  }

  private calculateErrorDensity(errors: GrammarError[], text: string): number {
    const wordCount = text.split(/\s+/).length;
    const weightedErrorCount = errors.reduce((sum, error) => {
      return sum + (this.errorWeights.get(error.type) || 1);
    }, 0);

    return weightedErrorCount / wordCount;
  }

  private calculateDeduction(errors: GrammarError[], sentenceCount: number): number {
    let totalDeduction = 0;

    for (const error of errors) {
      const weight = this.errorWeights.get(error.type) || 1;
      const sentencePenalty = weight * (100 / sentenceCount);
      totalDeduction += sentencePenalty * 0.5; // Scale factor
    }

    // Apply diminishing returns for multiple errors
    return Math.min(100, totalDeduction * Math.pow(0.95, errors.length));
  }

  private generateDetails(errors: GrammarError[]): GrammarDetails {
    const errorsByType = new Map<string, number>();

    for (const error of errors) {
      const count = errorsByType.get(error.type) || 0;
      errorsByType.set(error.type, count + 1);
    }

    return {
      totalErrors: errors.length,
      errorsByType: Object.fromEntries(errorsByType),
      mostCommonError: this.getMostCommonError(errorsByType),
      suggestions: this.generateSuggestions(errors)
    };
  }
}
```

### 2. Fluency Scoring Algorithm

```typescript
// lib/evaluation/algorithms/fluency-scorer.ts
export class FluencyScorer {
  private pauseThresholds = {
    natural: 500,      // ms - Natural pause
    hesitation: 1500,  // ms - Hesitation
    struggle: 3000     // ms - Struggling
  };

  calculateFluencyScore(speechData: SpeechData): FluencyScore {
    const metrics = {
      speechRate: this.calculateSpeechRate(speechData),
      pauseFrequency: this.analyzePauses(speechData),
      fillerWordRatio: this.calculateFillerRatio(speechData),
      repetitionRate: this.calculateRepetitionRate(speechData),
      sentenceCompleteness: this.analyzeSentenceCompleteness(speechData)
    };

    // Weighted scoring
    const score = this.computeWeightedScore(metrics);

    return {
      score,
      metrics,
      feedback: this.generateFeedback(metrics)
    };
  }

  private calculateSpeechRate(data: SpeechData): number {
    const totalWords = data.transcript.split(/\s+/).length;
    const totalTime = data.duration; // in seconds
    const wordsPerMinute = (totalWords / totalTime) * 60;

    // Optimal range: 120-160 WPM for ESL speakers
    const optimalMin = 120;
    const optimalMax = 160;

    if (wordsPerMinute >= optimalMin && wordsPerMinute <= optimalMax) {
      return 100;
    } else if (wordsPerMinute < optimalMin) {
      // Too slow
      return Math.max(0, 100 - (optimalMin - wordsPerMinute) * 0.5);
    } else {
      // Too fast
      return Math.max(0, 100 - (wordsPerMinute - optimalMax) * 0.5);
    }
  }

  private analyzePauses(data: SpeechData): PauseAnalysis {
    const pauses = data.pauses || [];
    let naturalPauses = 0;
    let hesitations = 0;
    let struggles = 0;

    for (const pause of pauses) {
      if (pause.duration < this.pauseThresholds.natural) {
        naturalPauses++;
      } else if (pause.duration < this.pauseThresholds.hesitation) {
        hesitations++;
      } else {
        struggles++;
      }
    }

    const totalPauses = pauses.length;
    const score = 100 - (hesitations * 5) - (struggles * 10);

    return {
      score: Math.max(0, score),
      naturalPauses,
      hesitations,
      struggles,
      averagePauseDuration: pauses.reduce((sum, p) => sum + p.duration, 0) / totalPauses
    };
  }

  private calculateFillerRatio(data: SpeechData): number {
    const fillerWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'so', 'well'];
    const transcript = data.transcript.toLowerCase();
    const words = transcript.split(/\s+/);
    const totalWords = words.length;

    let fillerCount = 0;
    for (const word of words) {
      if (fillerWords.includes(word)) {
        fillerCount++;
      }
    }

    const fillerRatio = fillerCount / totalWords;

    // Score based on filler ratio (lower is better)
    if (fillerRatio < 0.02) return 100;        // Excellent
    if (fillerRatio < 0.05) return 90;         // Very good
    if (fillerRatio < 0.10) return 75;         // Good
    if (fillerRatio < 0.15) return 60;         // Fair
    return Math.max(0, 50 - fillerRatio * 100); // Poor
  }

  private computeWeightedScore(metrics: FluencyMetrics): number {
    const weights = {
      speechRate: 0.25,
      pauseFrequency: 0.25,
      fillerWordRatio: 0.20,
      repetitionRate: 0.15,
      sentenceCompleteness: 0.15
    };

    let weightedSum = 0;
    weightedSum += metrics.speechRate * weights.speechRate;
    weightedSum += metrics.pauseFrequency.score * weights.pauseFrequency;
    weightedSum += metrics.fillerWordRatio * weights.fillerWordRatio;
    weightedSum += metrics.repetitionRate * weights.repetitionRate;
    weightedSum += metrics.sentenceCompleteness * weights.sentenceCompleteness;

    return Math.round(weightedSum);
  }
}
```

### 3. Vocabulary Richness Algorithm

```typescript
// lib/evaluation/algorithms/vocabulary-scorer.ts
export class VocabularyScorer {
  private wordLists: Map<string, Set<string>>;
  private cefr Levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  constructor() {
    this.loadWordLists();
  }

  calculateVocabularyScore(text: string): VocabularyScore {
    const tokens = this.tokenize(text);
    const uniqueTokens = new Set(tokens);

    const metrics = {
      totalWords: tokens.length,
      uniqueWords: uniqueTokens.size,
      lexicalDiversity: this.calculateLexicalDiversity(tokens, uniqueTokens),
      sophistication: this.calculateSophistication(uniqueTokens),
      cefrLevel: this.determineCEFRLevel(uniqueTokens),
      rareWords: this.identifyRareWords(uniqueTokens),
      academicWords: this.identifyAcademicWords(uniqueTokens)
    };

    const score = this.computeScore(metrics);

    return {
      score,
      metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  private calculateLexicalDiversity(tokens: string[], uniqueTokens: Set<string>): number {
    // Type-Token Ratio (TTR)
    const ttr = uniqueTokens.size / tokens.length;

    // Moving Average TTR (more stable for longer texts)
    const windowSize = 100;
    let mattr = 0;
    let windows = 0;

    for (let i = 0; i <= tokens.length - windowSize; i += 10) {
      const window = tokens.slice(i, i + windowSize);
      const uniqueInWindow = new Set(window);
      mattr += uniqueInWindow.size / windowSize;
      windows++;
    }

    const mattrScore = windows > 0 ? mattr / windows : ttr;

    // Convert to 0-100 scale
    return Math.min(100, mattrScore * 150);
  }

  private calculateSophistication(uniqueWords: Set<string>): number {
    let sophisticatedCount = 0;
    let totalWords = uniqueWords.size;

    for (const word of uniqueWords) {
      const level = this.getWordLevel(word);
      if (level >= 4) { // B2 and above
        sophisticatedCount++;
      }
    }

    return (sophisticatedCount / totalWords) * 100;
  }

  private determineCEFRLevel(uniqueWords: Set<string>): string {
    const levelCounts = new Map<string, number>();

    for (const word of uniqueWords) {
      const level = this.getWordCEFRLevel(word);
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    }

    // Find dominant level
    let maxCount = 0;
    let dominantLevel = 'A1';

    for (const [level, count] of levelCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantLevel = level;
      }
    }

    return dominantLevel;
  }

  private getWordLevel(word: string): number {
    // Return numeric level (1-6) based on word difficulty
    // Uses frequency lists and academic word lists
    const frequency = this.getWordFrequency(word);

    if (frequency > 5000) return 1;  // A1 - Most common
    if (frequency > 3000) return 2;  // A2
    if (frequency > 1500) return 3;  // B1
    if (frequency > 750) return 4;   // B2
    if (frequency > 250) return 5;   // C1
    return 6;                         // C2 - Rare/Advanced
  }

  private computeScore(metrics: VocabularyMetrics): number {
    const weights = {
      diversity: 0.30,
      sophistication: 0.30,
      level: 0.20,
      academic: 0.20
    };

    let score = 0;

    // Diversity component
    score += metrics.lexicalDiversity * weights.diversity;

    // Sophistication component
    score += metrics.sophistication * weights.sophistication;

    // Level component (map to 0-100)
    const levelScore = (this.cefrLevels.indexOf(metrics.cefrLevel) / 5) * 100;
    score += levelScore * weights.level;

    // Academic vocabulary component
    const academicRatio = metrics.academicWords.length / metrics.uniqueWords;
    score += (academicRatio * 100) * weights.academic;

    return Math.round(score);
  }
}
```

### 4. Pronunciation Scoring Algorithm

```typescript
// lib/evaluation/algorithms/pronunciation-scorer.ts
export class PronunciationScorer {
  private phoneticAnalyzer: PhoneticAnalyzer;
  private acousticModel: AcousticModel;

  async calculatePronunciationScore(
    audio: AudioData,
    expectedText: string
  ): Promise<PronunciationScore> {
    // Forced alignment
    const alignment = await this.forceAlign(audio, expectedText);

    // Phone-level analysis
    const phoneScores = await this.analyzePhones(alignment);

    // Prosody analysis
    const prosodyScore = await this.analyzeProsody(audio, alignment);

    // Intelligibility
    const intelligibility = await this.assessIntelligibility(audio, expectedText);

    // Calculate overall score
    const overallScore = this.computeOverallScore({
      phoneScores,
      prosodyScore,
      intelligibility
    });

    return {
      score: overallScore,
      phoneScores,
      prosodyScore,
      intelligibility,
      problematicSounds: this.identifyProblematicSounds(phoneScores),
      feedback: this.generateFeedback(phoneScores, prosodyScore)
    };
  }

  private async forceAlign(audio: AudioData, text: string): Promise<Alignment> {
    // Use acoustic model to align audio with expected phonemes
    const phonemes = this.textToPhonemes(text);
    const audioFeatures = await this.extractAudioFeatures(audio);

    return this.acousticModel.align(audioFeatures, phonemes);
  }

  private async analyzePhones(alignment: Alignment): Promise<PhoneScore[]> {
    const scores: PhoneScore[] = [];

    for (const segment of alignment.segments) {
      const score = await this.scorePhoneSegment(segment);
      scores.push({
        phone: segment.phone,
        score: score,
        startTime: segment.startTime,
        endTime: segment.endTime
      });
    }

    return scores;
  }

  private async scorePhoneSegment(segment: AlignmentSegment): Promise<number> {
    // Compare acoustic features with native speaker model
    const nativeFeatures = await this.getNativeFeatures(segment.phone);
    const userFeatures = segment.features;

    // Calculate distance metrics
    const spectralDistance = this.calculateSpectralDistance(
      userFeatures.spectrum,
      nativeFeatures.spectrum
    );

    const formantDistance = this.calculateFormantDistance(
      userFeatures.formants,
      nativeFeatures.formants
    );

    // Convert to score (0-100)
    const maxDistance = 100;
    const score = Math.max(0, 100 - (spectralDistance + formantDistance) / 2);

    return score;
  }

  private async analyzeProsody(audio: AudioData, alignment: Alignment): Promise<number> {
    const features = {
      pitch: await this.extractPitch(audio),
      intensity: await this.extractIntensity(audio),
      rhythm: await this.extractRhythm(audio, alignment)
    };

    // Compare with native prosody patterns
    const nativePatterns = await this.getNativeProsodyPatterns();

    const pitchScore = this.comparePitchContours(features.pitch, nativePatterns.pitch);
    const intensityScore = this.compareIntensityPatterns(features.intensity, nativePatterns.intensity);
    const rhythmScore = this.compareRhythmPatterns(features.rhythm, nativePatterns.rhythm);

    // Weighted average
    return (pitchScore * 0.4 + intensityScore * 0.3 + rhythmScore * 0.3);
  }

  private identifyProblematicSounds(phoneScores: PhoneScore[]): ProblematicSound[] {
    const problematic: ProblematicSound[] = [];
    const threshold = 70; // Score below this is considered problematic

    // Group by phone type
    const phoneGroups = new Map<string, PhoneScore[]>();
    for (const score of phoneScores) {
      const phone = score.phone;
      if (!phoneGroups.has(phone)) {
        phoneGroups.set(phone, []);
      }
      phoneGroups.get(phone)!.push(score);
    }

    // Identify consistently problematic phones
    for (const [phone, scores] of phoneGroups) {
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

      if (avgScore < threshold) {
        problematic.push({
          phone,
          averageScore: avgScore,
          occurrences: scores.length,
          examples: scores.slice(0, 3).map(s => ({
            timestamp: s.startTime,
            score: s.score
          }))
        });
      }
    }

    return problematic.sort((a, b) => a.averageScore - b.averageScore);
  }
}
```

### 5. Comprehension Scoring Algorithm

```typescript
// lib/evaluation/algorithms/comprehension-scorer.ts
export class ComprehensionScorer {
  private semanticAnalyzer: SemanticAnalyzer;

  async calculateComprehensionScore(
    conversation: Conversation
  ): Promise<ComprehensionScore> {
    const metrics = {
      responseRelevance: await this.assessResponseRelevance(conversation),
      contextualUnderstanding: await this.assessContextualUnderstanding(conversation),
      questionAnswering: await this.assessQuestionAnswering(conversation),
      topicCoherence: await this.assessTopicCoherence(conversation),
      inferenceAbility: await this.assessInferenceAbility(conversation)
    };

    const overallScore = this.computeWeightedScore(metrics);

    return {
      score: overallScore,
      metrics,
      details: this.generateDetails(conversation, metrics)
    };
  }

  private async assessResponseRelevance(conversation: Conversation): Promise<number> {
    let totalRelevance = 0;
    let responseCount = 0;

    for (let i = 0; i < conversation.messages.length - 1; i++) {
      const prompt = conversation.messages[i];
      const response = conversation.messages[i + 1];

      if (prompt.role === 'assistant' && response.role === 'user') {
        const relevance = await this.calculateRelevance(prompt.content, response.content);
        totalRelevance += relevance;
        responseCount++;
      }
    }

    return responseCount > 0 ? (totalRelevance / responseCount) * 100 : 0;
  }

  private async calculateRelevance(prompt: string, response: string): Promise<number> {
    // Use semantic similarity
    const promptEmbedding = await this.semanticAnalyzer.embed(prompt);
    const responseEmbedding = await this.semanticAnalyzer.embed(response);

    const similarity = this.cosineSimilarity(promptEmbedding, responseEmbedding);

    // Check for key concept matching
    const promptConcepts = await this.extractConcepts(prompt);
    const responseConcepts = await this.extractConcepts(response);

    const conceptOverlap = this.calculateConceptOverlap(promptConcepts, responseConcepts);

    // Combine metrics
    return (similarity * 0.6 + conceptOverlap * 0.4);
  }

  private async assessContextualUnderstanding(conversation: Conversation): Promise<number> {
    let score = 100;

    // Check for context maintenance
    const contextBreaks = this.detectContextBreaks(conversation);
    score -= contextBreaks * 10;

    // Check for pronoun resolution
    const pronounErrors = await this.checkPronounResolution(conversation);
    score -= pronounErrors * 5;

    // Check for temporal understanding
    const temporalErrors = await this.checkTemporalUnderstanding(conversation);
    score -= temporalErrors * 5;

    return Math.max(0, score);
  }

  private detectContextBreaks(conversation: Conversation): number {
    let breaks = 0;
    const topics = [];

    for (const message of conversation.messages) {
      if (message.role === 'user') {
        const topic = this.extractTopic(message.content);

        if (topics.length > 0) {
          const previousTopic = topics[topics.length - 1];
          const similarity = this.topicSimilarity(previousTopic, topic);

          if (similarity < 0.3) {
            // Significant topic change without transition
            breaks++;
          }
        }

        topics.push(topic);
      }
    }

    return breaks;
  }

  private async assessQuestionAnswering(conversation: Conversation): Promise<number> {
    const questions = this.extractQuestions(conversation);
    let correctAnswers = 0;

    for (const question of questions) {
      const answer = this.findAnswer(conversation, question);

      if (answer) {
        const isCorrect = await this.evaluateAnswer(question, answer);
        if (isCorrect) {
          correctAnswers++;
        }
      }
    }

    return questions.length > 0 ? (correctAnswers / questions.length) * 100 : 100;
  }

  private computeWeightedScore(metrics: ComprehensionMetrics): number {
    const weights = {
      responseRelevance: 0.30,
      contextualUnderstanding: 0.25,
      questionAnswering: 0.20,
      topicCoherence: 0.15,
      inferenceAbility: 0.10
    };

    let weightedSum = 0;
    for (const [key, value] of Object.entries(metrics)) {
      weightedSum += value * weights[key as keyof typeof weights];
    }

    return Math.round(weightedSum);
  }
}
```

### 6. Adaptive Scoring Algorithm

```typescript
// lib/evaluation/algorithms/adaptive-scorer.ts
export class AdaptiveScorer {
  private userHistoryAnalyzer: UserHistoryAnalyzer;
  private difficultyEstimator: DifficultyEstimator;

  async calculateAdaptiveScore(
    rawScore: number,
    userId: string,
    sessionContext: SessionContext
  ): Promise<AdaptiveScore> {
    // Get user's learning profile
    const userProfile = await this.getUserProfile(userId);

    // Estimate task difficulty
    const taskDifficulty = await this.estimateTaskDifficulty(sessionContext);

    // Calculate expected performance
    const expectedScore = this.calculateExpectedScore(userProfile, taskDifficulty);

    // Apply adaptive adjustment
    const adjustedScore = this.applyAdaptiveAdjustment(
      rawScore,
      expectedScore,
      userProfile,
      taskDifficulty
    );

    return {
      rawScore,
      adjustedScore,
      expectedScore,
      difficulty: taskDifficulty,
      improvement: this.calculateImprovement(userProfile, adjustedScore),
      feedback: this.generateAdaptiveFeedback(rawScore, adjustedScore, expectedScore)
    };
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    const history = await this.userHistoryAnalyzer.getHistory(userId);

    return {
      averageScore: this.calculateAverageScore(history),
      learningRate: this.calculateLearningRate(history),
      strengthAreas: this.identifyStrengths(history),
      weaknessAreas: this.identifyWeaknesses(history),
      consistencyScore: this.calculateConsistency(history),
      sessionCount: history.length
    };
  }

  private async estimateTaskDifficulty(context: SessionContext): Promise<number> {
    const factors = {
      moduleComplexity: this.getModuleComplexity(context.moduleType),
      scenarioComplexity: await this.getScenarioComplexity(context.scenarioId),
      timeConstraint: this.getTimeConstraintDifficulty(context.timeLimit),
      linguisticComplexity: await this.getLinguisticComplexity(context.content)
    };

    // Weighted combination
    const weights = {
      moduleComplexity: 0.25,
      scenarioComplexity: 0.35,
      timeConstraint: 0.15,
      linguisticComplexity: 0.25
    };

    let difficulty = 0;
    for (const [factor, value] of Object.entries(factors)) {
      difficulty += value * weights[factor as keyof typeof weights];
    }

    return difficulty; // 0-100 scale
  }

  private applyAdaptiveAdjustment(
    rawScore: number,
    expectedScore: number,
    userProfile: UserProfile,
    taskDifficulty: number
  ): number {
    // Calculate performance delta
    const performanceDelta = rawScore - expectedScore;

    // Difficulty modifier
    const difficultyModifier = this.getDifficultyModifier(taskDifficulty);

    // Learning stage modifier
    const learningStageModifier = this.getLearningStageModifier(userProfile.sessionCount);

    // Calculate adjustment
    let adjustment = 0;

    if (performanceDelta > 0) {
      // Exceeded expectations - bonus based on difficulty
      adjustment = performanceDelta * difficultyModifier * learningStageModifier;
    } else {
      // Below expectations - smaller penalty for beginners
      adjustment = performanceDelta * (1 - learningStageModifier * 0.5);
    }

    // Apply adjustment with bounds
    const adjustedScore = rawScore + adjustment;
    return Math.max(0, Math.min(100, adjustedScore));
  }

  private getDifficultyModifier(difficulty: number): number {
    // Higher difficulty = larger bonus/penalty
    return 0.5 + (difficulty / 100) * 0.5; // Range: 0.5 - 1.0
  }

  private getLearningStageModifier(sessionCount: number): number {
    // Early stage: more forgiving, Late stage: more strict
    if (sessionCount < 5) return 0.7;
    if (sessionCount < 10) return 0.8;
    if (sessionCount < 20) return 0.9;
    return 1.0;
  }

  private calculateImprovement(profile: UserProfile, newScore: number): number {
    const improvement = newScore - profile.averageScore;
    const relativeImprovement = (improvement / profile.averageScore) * 100;

    return relativeImprovement;
  }
}
```

## Composite Scoring

### Multi-Metric Integration

```typescript
// lib/evaluation/algorithms/composite-scorer.ts
export class CompositeScorer {
  private scorers: Map<string, IScorer> = new Map();

  constructor() {
    this.initializeScorers();
  }

  private initializeScorers(): void {
    this.scorers.set('grammar', new GrammarScorer());
    this.scorers.set('fluency', new FluencyScorer());
    this.scorers.set('vocabulary', new VocabularyScorer());
    this.scorers.set('pronunciation', new PronunciationScorer());
    this.scorers.set('comprehension', new ComprehensionScorer());
  }

  async calculateCompositeScore(
    sessionData: SessionData,
    weights: ScoreWeights
  ): Promise<CompositeScore> {
    const individualScores: Map<string, number> = new Map();

    // Calculate individual scores in parallel
    const scorePromises = Array.from(this.scorers.entries()).map(async ([name, scorer]) => {
      const score = await scorer.calculate(sessionData);
      return { name, score };
    });

    const results = await Promise.all(scorePromises);

    for (const { name, score } of results) {
      individualScores.set(name, score);
    }

    // Calculate weighted composite
    const compositeScore = this.calculateWeightedComposite(individualScores, weights);

    // Calculate confidence interval
    const confidence = this.calculateConfidence(individualScores);

    return {
      overall: compositeScore,
      components: Object.fromEntries(individualScores),
      confidence,
      interpretation: this.interpretScore(compositeScore)
    };
  }

  private calculateWeightedComposite(
    scores: Map<string, number>,
    weights: ScoreWeights
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [component, score] of scores) {
      const weight = weights[component] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private calculateConfidence(scores: Map<string, number>): ConfidenceInterval {
    const values = Array.from(scores.values());
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    // Calculate standard deviation
    const squaredDifferences = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 95% confidence interval
    const marginOfError = 1.96 * (stdDev / Math.sqrt(values.length));

    return {
      lower: Math.max(0, mean - marginOfError),
      upper: Math.min(100, mean + marginOfError),
      confidence: 0.95
    };
  }
}
```

---

*Document Version: 1.0*
*Last Updated: October 2025*
*Next Review: November 2025*
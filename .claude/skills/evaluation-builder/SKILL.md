---
name: Evaluation Builder
description: Build AI evaluation systems for HireXp that score conversations and provide feedback
---

# Evaluation Builder

Create AI-powered evaluation systems for HireXp training sessions.

## Context

Per `.docs/.features/evaluation-engine/`:
- Grammar, fluency, vocabulary, pronunciation scoring
- Feedback generation with GPT-4
- Progress tracking
- Strengths and improvements identification

## Evaluation Service

```typescript
// lib/evaluation/evaluation-service.ts
import { OpenAI } from "openai";
import type { Session, Message } from "@prisma/client";

interface EvaluationResult {
  grammarScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  pronunciationScore: number | null;
  overallScore: number;
  feedback: {
    grammar: string[];
    fluency: string[];
    vocabulary: string[];
    pronunciation: string[];
  };
  strengths: string[];
  improvements: string[];
}

export class EvaluationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async evaluateSession(
    session: Session & { messages: Message[] }
  ): Promise<EvaluationResult> {
    const userMessages = session.messages.filter(m => m.role === 'USER');

    const evaluationPrompt = this.buildEvaluationPrompt(userMessages);

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: EVALUATION_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: evaluationPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(response.choices[0].message.content!);

    return this.formatEvaluation(evaluation);
  }

  private buildEvaluationPrompt(messages: Message[]): string {
    const conversation = messages
      .map(m => m.content)
      .join('\n');

    return `
Evaluate this English conversation:

${conversation}

Provide scores (0-100) for:
1. Grammar
2. Fluency
3. Vocabulary
4. Pronunciation (if applicable)

Also provide:
- Specific feedback for each category
- Top 3 strengths
- Top 3 areas for improvement
- Overall assessment

Format response as JSON.
    `;
  }

  private formatEvaluation(raw: any): EvaluationResult {
    const overallScore = Math.round(
      (raw.grammar + raw.fluency + raw.vocabulary + (raw.pronunciation || 0)) /
      (raw.pronunciation ? 4 : 3)
    );

    return {
      grammarScore: raw.grammar,
      fluencyScore: raw.fluency,
      vocabularyScore: raw.vocabulary,
      pronunciationScore: raw.pronunciation || null,
      overallScore,
      feedback: {
        grammar: raw.feedback.grammar || [],
        fluency: raw.feedback.fluency || [],
        vocabulary: raw.feedback.vocabulary || [],
        pronunciation: raw.feedback.pronunciation || []
      },
      strengths: raw.strengths || [],
      improvements: raw.improvements || []
    };
  }
}

const EVALUATION_SYSTEM_PROMPT = `
You are an expert English language evaluator for call center training.

Evaluate conversations based on:

1. **Grammar** (0-100):
   - Sentence structure correctness
   - Verb tenses usage
   - Subject-verb agreement
   - Common errors

2. **Fluency** (0-100):
   - Natural conversation flow
   - Hesitation frequency
   - Response time
   - Coherence

3. **Vocabulary** (0-100):
   - Word variety
   - Appropriate word choice
   - Professional terminology
   - Complexity level

4. **Pronunciation** (0-100, if audio available):
   - Clarity
   - Accent comprehensibility
   - Stress patterns
   - Intonation

Provide constructive, specific feedback.
`;
```

## Evaluation UI Component

```typescript
// components/evaluation-results.tsx
'use client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface EvaluationResultsProps {
  evaluation: EvaluationResult;
}

export function EvaluationResults({ evaluation }: EvaluationResultsProps) {
  const categories = [
    { name: 'Grammar', score: evaluation.grammarScore, feedback: evaluation.feedback.grammar },
    { name: 'Fluency', score: evaluation.fluencyScore, feedback: evaluation.feedback.fluency },
    { name: 'Vocabulary', score: evaluation.vocabularyScore, feedback: evaluation.feedback.vocabulary },
  ];

  if (evaluation.pronunciationScore) {
    categories.push({
      name: 'Pronunciation',
      score: evaluation.pronunciationScore,
      feedback: evaluation.feedback.pronunciation
    });
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2">
            {evaluation.overallScore}
          </div>
          <div className="text-muted-foreground">Overall Score</div>
        </div>
      </Card>

      {/* Category Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.name} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{category.name}</h3>
              <span className="text-2xl font-bold">{category.score}</span>
            </div>
            <Progress value={category.score} className="mb-3" />
            <ul className="text-sm space-y-1 text-muted-foreground">
              {category.feedback.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Strengths */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">✨ Strengths</h3>
        <div className="flex flex-wrap gap-2">
          {evaluation.strengths.map((strength, i) => (
            <Badge key={i} variant="secondary">{strength}</Badge>
          ))}
        </div>
      </Card>

      {/* Areas for Improvement */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">📈 Focus Areas</h3>
        <div className="space-y-2">
          {evaluation.improvements.map((improvement, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-muted-foreground">{i + 1}.</span>
              <span>{improvement}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

## API Route

```typescript
// app/api/evaluation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { EvaluationService } from "@/lib/evaluation/evaluation-service";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    // Fetch session with messages
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: true }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Evaluate
    const service = new EvaluationService();
    const result = await service.evaluateSession(session);

    // Save evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        sessionId,
        grammarScore: result.grammarScore,
        fluencyScore: result.fluencyScore,
        vocabularyScore: result.vocabularyScore,
        pronunciationScore: result.pronunciationScore,
        overallScore: result.overallScore,
        feedback: result.feedback,
        strengths: result.strengths,
        improvements: result.improvements
      }
    });

    return NextResponse.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Checklist

- [ ] GPT-4 for evaluation
- [ ] Structured JSON output
- [ ] All score categories
- [ ] Specific feedback
- [ ] Strengths identified
- [ ] Improvements suggested
- [ ] UI component created
- [ ] Saved to database
- [ ] Progress tracking

## Your Task

Ask:
1. What to evaluate?
2. Score categories?
3. Feedback detail level?
4. Progress tracking needed?

Then implement the evaluation system.

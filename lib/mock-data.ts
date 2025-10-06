// Mock data for dashboard demonstrations

export const mockTraineeData = {
  user: {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    level: 'Intermediate' as const,
    enrolledDate: '2025-01-15',
  },
  stats: {
    overallProgress: 45,
    modulesCompleted: 2,
    totalModules: 5,
    overallScore: 78,
    timeSpent: 24, // hours
    streakDays: 7,
  },
  modules: [
    {
      id: 'assessments',
      title: 'English Assessments',
      description: 'Master reading, grammar, and vocabulary with interactive lessons',
      progress: 100,
      status: 'completed' as const,
      score: 85,
      metrics: {
        scorePercentage: 85,
        improvementRate: 12,
        topicsMastered: 8,
      }
    },
    {
      id: 'chat',
      title: 'AI Chat-Chat',
      description: 'Practice conversations with AI for real-time feedback',
      progress: 60,
      status: 'in-progress' as const,
      score: 72,
      metrics: {
        conversationQuality: 75,
        grammarAccuracy: 80,
        vocabularyUsage: 65,
      }
    },
    {
      id: 'interview',
      title: 'AI Interview',
      description: 'Prepare for job interviews with realistic AI-powered simulations',
      progress: 30,
      status: 'in-progress' as const,
      score: 68,
      metrics: {
        overallRating: 3.5,
        answerQuality: 70,
        confidenceScore: 65,
      }
    },
    {
      id: 'typing',
      title: 'Typing Test',
      description: 'Improve your typing speed and accuracy',
      progress: 0,
      status: 'not-started' as const,
      score: 0,
      metrics: {
        wpmScore: 0,
        accuracyPercentage: 0,
        consistency: 0,
      }
    },
    {
      id: 'mock-call',
      title: 'AI Mock Call',
      description: 'Simulate real customer service calls',
      progress: 0,
      status: 'locked' as const,
      score: 0,
      metrics: {
        issueResolution: 0,
        communicationClarity: 0,
        professionalismScore: 0,
      }
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: 'chat',
      title: 'Completed Chat Session',
      description: 'Practiced customer service conversation - scored 85%',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'interview',
      title: 'AI Interview Practice',
      description: 'Completed mock interview with 8 questions',
      timestamp: '1 day ago',
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Grammar Assessment',
      description: 'Achieved 90% on advanced grammar test',
      timestamp: '2 days ago',
    },
    {
      id: 4,
      type: 'chat',
      title: 'Conversation Practice',
      description: 'Completed 30-minute conversation session',
      timestamp: '3 days ago',
    },
  ],
  strengths: [
    'Grammar accuracy (90%)',
    'Vocabulary usage',
    'Reading comprehension',
    'Written communication',
  ],
  improvements: [
    'Speaking confidence',
    'Typing speed',
    'Active listening',
    'Call handling',
  ],
  recommendations: [
    'Focus on typing practice to improve WPM',
    'Complete AI Interview module for confidence building',
    'Practice more conversational scenarios',
  ]
}

export const mockCandidates = [
  {
    id: 'CAND-1234',
    name: 'Candidate #1234',
    englishLevel: 'Advanced' as const,
    overallScore: 92,
    modulesCompleted: 5,
    totalModules: 5,
    typingSpeed: 65,
    interviewRating: 5,
    available: true,
    completedDate: '2025-02-01',
    metrics: {
      grammarScore: 95,
      conversationQuality: 90,
      professionalismScore: 88,
    }
  },
  {
    id: 'CAND-1235',
    name: 'Candidate #1235',
    englishLevel: 'Intermediate' as const,
    overallScore: 85,
    modulesCompleted: 5,
    totalModules: 5,
    typingSpeed: 58,
    interviewRating: 4,
    available: true,
    completedDate: '2025-02-03',
    metrics: {
      grammarScore: 82,
      conversationQuality: 88,
      professionalismScore: 85,
    }
  },
  {
    id: 'CAND-1236',
    name: 'Candidate #1236',
    englishLevel: 'Advanced' as const,
    overallScore: 88,
    modulesCompleted: 5,
    totalModules: 5,
    typingSpeed: 72,
    interviewRating: 5,
    available: true,
    completedDate: '2025-02-05',
    metrics: {
      grammarScore: 90,
      conversationQuality: 85,
      professionalismScore: 90,
    }
  },
  {
    id: 'CAND-1237',
    name: 'Candidate #1237',
    englishLevel: 'Intermediate' as const,
    overallScore: 80,
    modulesCompleted: 5,
    totalModules: 5,
    typingSpeed: 55,
    interviewRating: 4,
    available: false,
    completedDate: '2025-01-28',
    metrics: {
      grammarScore: 78,
      conversationQuality: 82,
      professionalismScore: 80,
    }
  },
  {
    id: 'CAND-1238',
    name: 'Candidate #1238',
    englishLevel: 'Beginner' as const,
    overallScore: 75,
    modulesCompleted: 5,
    totalModules: 5,
    typingSpeed: 48,
    interviewRating: 3,
    available: true,
    completedDate: '2025-02-08',
    metrics: {
      grammarScore: 72,
      conversationQuality: 75,
      professionalismScore: 78,
    }
  },
  {
    id: 'CAND-1239',
    name: 'Candidate #1239',
    englishLevel: 'Advanced' as const,
    overallScore: 95,
    modulesCompleted: 5,
    totalModules: 5,
    typingSpeed: 70,
    interviewRating: 5,
    available: true,
    completedDate: '2025-02-10',
    metrics: {
      grammarScore: 98,
      conversationQuality: 92,
      professionalismScore: 95,
    }
  },
]

export const mockCompanyData = {
  company: {
    name: 'Acme Corporation',
    partnerSince: '2025-01-01',
  },
  stats: {
    totalCandidates: 127,
    newThisWeek: 8,
    candidatesHired: 18,
    trainingCostSavings: 45000,
    averageCandidateScore: 82,
  },
  recentHires: [
    {
      candidateId: 'CAND-1201',
      hiredDate: '2025-02-15',
      role: 'Customer Service Representative',
      performance: 'Excellent',
    },
    {
      candidateId: 'CAND-1205',
      hiredDate: '2025-02-10',
      role: 'Technical Support Agent',
      performance: 'Good',
    },
    {
      candidateId: 'CAND-1198',
      hiredDate: '2025-02-05',
      role: 'Call Center Agent',
      performance: 'Excellent',
    },
  ]
}

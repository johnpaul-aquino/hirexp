-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TRAINEE', 'INSTRUCTOR', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('SIGN_IN', 'SIGN_OUT', 'SIGN_UP', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'PROFILE_UPDATED', 'AVATAR_CHANGED', 'ROLE_CHANGED', 'USER_SUSPENDED', 'USER_ACTIVATED', 'USER_DELETED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'CONTENT_CREATED', 'CONTENT_UPDATED', 'CONTENT_DELETED', 'SETTINGS_CHANGED', 'API_KEY_CREATED', 'API_KEY_REVOKED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('CHAT', 'CALL');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('CHAT_SCENARIO', 'CALL_SCENARIO', 'ASSESSMENT', 'LESSON', 'EXERCISE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TRAINEE',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255),
    "avatar" TEXT,
    "bio" TEXT,
    "phone" VARCHAR(20),
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "location" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "languages" TEXT[],
    "skills" TEXT[],
    "experience" TEXT,
    "education" TEXT,
    "linkedIn" TEXT,
    "github" TEXT,
    "website" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specializations" TEXT[],
    "certifications" TEXT[],
    "yearsOfExperience" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "companyLogo" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "website" TEXT,
    "description" TEXT,
    "address" TEXT,
    "country" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "hiringQuota" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "accessLevel" INTEGER NOT NULL DEFAULT 1,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "targetUserId" TEXT,
    "action" "AuditAction" NOT NULL,
    "details" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "audioUrl" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "recordingUrl" TEXT,

    CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_transcripts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "feedback" JSONB NOT NULL,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "overallScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certificateProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "modulesCompleted" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "points" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "skills" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "verificationUrl" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ContentType" NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "requiredSkills" TEXT[],
    "experienceLevel" TEXT NOT NULL,
    "location" TEXT,
    "salary" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_views" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyUserId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "isInterested" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "candidate_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_profiles_userId_key" ON "instructor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_userId_key" ON "company_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_email_token_key" ON "verification_tokens"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_email_token_key" ON "password_reset_tokens"("email", "token");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_targetUserId_idx" ON "audit_logs"("targetUserId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions"("status");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "call_sessions_userId_idx" ON "call_sessions"("userId");

-- CreateIndex
CREATE INDEX "call_sessions_status_idx" ON "call_sessions"("status");

-- CreateIndex
CREATE INDEX "call_transcripts_sessionId_idx" ON "call_transcripts"("sessionId");

-- CreateIndex
CREATE INDEX "assessments_userId_idx" ON "assessments"("userId");

-- CreateIndex
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_sessionId_key" ON "evaluations"("sessionId");

-- CreateIndex
CREATE INDEX "evaluations_userId_idx" ON "evaluations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_key" ON "user_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateCode_key" ON "certificates"("certificateCode");

-- CreateIndex
CREATE INDEX "certificates_userId_idx" ON "certificates"("userId");

-- CreateIndex
CREATE INDEX "certificates_certificateCode_idx" ON "certificates"("certificateCode");

-- CreateIndex
CREATE INDEX "content_creatorId_idx" ON "content"("creatorId");

-- CreateIndex
CREATE INDEX "content_type_idx" ON "content"("type");

-- CreateIndex
CREATE INDEX "content_isPublished_idx" ON "content"("isPublished");

-- CreateIndex
CREATE INDEX "job_postings_companyId_idx" ON "job_postings"("companyId");

-- CreateIndex
CREATE INDEX "job_postings_isActive_idx" ON "job_postings"("isActive");

-- CreateIndex
CREATE INDEX "candidate_views_candidateId_idx" ON "candidate_views"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_views_companyUserId_idx" ON "candidate_views"("companyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_views_candidateId_companyUserId_key" ON "candidate_views"("candidateId", "companyUserId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_profiles" ADD CONSTRAINT "instructor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_transcripts" ADD CONSTRAINT "call_transcripts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "call_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "eval_chat_session_fk" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "eval_call_session_fk" FOREIGN KEY ("sessionId") REFERENCES "call_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_views" ADD CONSTRAINT "candidate_views_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_views" ADD CONSTRAINT "candidate_views_companyUserId_fkey" FOREIGN KEY ("companyUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

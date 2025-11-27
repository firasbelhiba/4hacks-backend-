-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('CREDENTIAL', 'GOOGLE', 'GITHUB', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DISQUALIFIED', 'WINNER', 'FINALIST', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "HackathonCategory" AS ENUM ('WEB3', 'AI');

-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('GENERAL', 'TRACK', 'BOUNTY', 'SPONSOR');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('ENTERPRISE', 'STARTUP', 'DAO', 'NON_PROFIT', 'EDUCATIONAL_INSTITUTION', 'GOVERNMENT_AGENCY', 'COMMUNITY_DEVELOPER_GROUP', 'BLOCKCHAIN_FOUNDATION', 'STUDENT_ORGANIZATION');

-- CreateEnum
CREATE TYPE "OrganizationSize" AS ENUM ('ONE_TO_TEN', 'ELEVEN_TO_FIFTY', 'FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND', 'ONE_THOUSAND', 'COMMUNITY_DRIVEN');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('NORTH_AMERICA', 'SOUTH_AMERICA', 'EUROPE', 'AFRICA', 'ASIA', 'MIDDLE_EAST', 'OCEANIA', 'GLOBAL');

-- CreateEnum
CREATE TYPE "HackathonStatus" AS ENUM ('DRAFT', 'UPCOMING', 'REGISTRATION', 'ACTIVE', 'JUDGING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HackathonType" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "HackathonTargetAudience" AS ENUM ('STUDENTS', 'PROFESSIONALS', 'OTHER');

-- CreateEnum
CREATE TYPE "GeographicScope" AS ENUM ('GLOBAL', 'REGIONAL', 'LOCAL');

-- CreateEnum
CREATE TYPE "FundingSource" AS ENUM ('SELF_FUNDED', 'SPONSORS', 'GRANTS', 'TBD');

-- CreateEnum
CREATE TYPE "SponsorLevel" AS ENUM ('UNDER_5K', 'BETWEEN_5K_AND_25K', 'BETWEEN_25K_AND_100K', 'ABOVE_100K');

-- CreateEnum
CREATE TYPE "YesNoNotApplicable" AS ENUM ('YES', 'NO', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "MarketingHelpDetails" AS ENUM ('SOCIAL_MEDIA_PROMOTION', 'EMAIL_CAMPAIGNS', 'CONTENT_CREATION', 'PRESS_RELEASE_MEDIA_OUTREACH', 'INFLUENCER_PARTNERSHIPS', 'COMMUNITY_OUTREACH', 'SEO_LANDING_PAGE_OPTIMIZATION');

-- CreateEnum
CREATE TYPE "EstimatedReach" AS ENUM ('UNDER_500', 'BETWEEN_500_AND_5K', 'BETWEEN_5K_AND_50K', 'ABOVE_50K');

-- CreateEnum
CREATE TYPE "EventLogisticsDetails" AS ENUM ('REGISTRATION_MANAGEMENT', 'TEAM_FORMATION_SUPPORT', 'SCHEDULE_PLANNING', 'FOOD_CATERING_COORDINATION', 'SWAG_MERCHANDISE', 'TRAVEL_ACCOMMODATION_COORDINATION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "walletAddress" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "providers" "Provider"[] DEFAULT ARRAY[]::"Provider"[],
    "profession" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "org" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "telegram" TEXT,
    "twitter" TEXT,
    "whatsapp" TEXT,
    "otherSocials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordUpdatedAt" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorConfirmedAt" TIMESTAMP(3),
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "disabledAt" TIMESTAMP(3),
    "disabledReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL DEFAULT 'CREDENTIAL',
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_logins" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "identifier" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "logo" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "type" "OrganizationType" NOT NULL,
    "establishedYear" INTEGER NOT NULL,
    "size" "OrganizationSize" NOT NULL,
    "operatingRegions" "Region"[] DEFAULT ARRAY[]::"Region"[],
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "zipCode" TEXT,
    "loc_address" TEXT,
    "website" TEXT NOT NULL,
    "linkedin" TEXT NOT NULL,
    "github" TEXT NOT NULL,
    "twitter" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "discord" TEXT,
    "telegram" TEXT,
    "medium" TEXT,
    "youtube" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "reddit" TEXT,
    "warpcast" TEXT,
    "otherSocials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_creation_requests" (
    "id" TEXT NOT NULL,
    "hackTitle" TEXT NOT NULL,
    "hackSlug" TEXT NOT NULL,
    "hackId" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "organizationId" TEXT NOT NULL,
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "hackType" "HackathonType" NOT NULL,
    "hackCategory" "HackathonCategory" NOT NULL,
    "focus" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "expectedAttendees" INTEGER NOT NULL,
    "geographicScope" "GeographicScope" NOT NULL,
    "hackCountry" TEXT,
    "hackCity" TEXT,
    "hackState" TEXT,
    "hackZipCode" TEXT,
    "hackAddress" TEXT,
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "judgingStart" TIMESTAMP(3),
    "judgingEnd" TIMESTAMP(3),
    "prizePool" DOUBLE PRECISION NOT NULL,
    "prizeToken" TEXT NOT NULL DEFAULT 'USD',
    "expectedTotalWinners" INTEGER NOT NULL,
    "distributionPlan" TEXT NOT NULL,
    "fundingSources" "FundingSource"[],
    "confirmedSponsors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "needSponsorsHelp" BOOLEAN NOT NULL,
    "sponsorLevel" "SponsorLevel",
    "venueSecured" "YesNoNotApplicable" NOT NULL,
    "needVenueHelp" "YesNoNotApplicable" NOT NULL,
    "technicalSupport" BOOLEAN NOT NULL,
    "liveStreaming" "YesNoNotApplicable" NOT NULL,
    "marketingHelp" BOOLEAN NOT NULL,
    "marketingHelpDetails" "MarketingHelpDetails"[] DEFAULT ARRAY[]::"MarketingHelpDetails"[],
    "existingCommunity" BOOLEAN NOT NULL,
    "estimatedReach" "EstimatedReach" NOT NULL,
    "targetRegistrationGoal" INTEGER NOT NULL,
    "needWorkshopsHelp" BOOLEAN NOT NULL,
    "workshopsHelpDetails" TEXT NOT NULL DEFAULT '',
    "needTechnicalMentors" BOOLEAN NOT NULL,
    "technicalMentorCount" INTEGER NOT NULL DEFAULT 0,
    "needEducationalContent" BOOLEAN NOT NULL,
    "needSpeakers" BOOLEAN NOT NULL,
    "needJudges" BOOLEAN NOT NULL,
    "judgesCount" INTEGER NOT NULL DEFAULT 0,
    "judgesProfiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "needJudgingCriteria" BOOLEAN NOT NULL,
    "needEvaluationSystem" BOOLEAN NOT NULL,
    "needEventLogistics" BOOLEAN NOT NULL,
    "eventLogisticsDetails" "EventLogisticsDetails"[] DEFAULT ARRAY[]::"EventLogisticsDetails"[],
    "needVolunteerCoordinators" BOOLEAN NOT NULL,
    "needCommunitySetup" BOOLEAN NOT NULL,
    "needOnCallSupport" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_creation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "banner" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "location" TEXT,
    "category" "HackathonCategory" NOT NULL,
    "type" "HackathonType" NOT NULL DEFAULT 'ONLINE',
    "status" "HackathonStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prizePool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prizeToken" TEXT NOT NULL DEFAULT 'USD',
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "judgingStart" TIMESTAMP(3),
    "judgingEnd" TIMESTAMP(3),
    "maxTeamSize" INTEGER NOT NULL DEFAULT 4,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "maxParticipants" INTEGER,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "judgingCriteria" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "prizeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prizeToken" TEXT NOT NULL DEFAULT 'USD',
    "winnersCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "trackId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PrizeType" NOT NULL DEFAULT 'GENERAL',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "winnersCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_winners" (
    "id" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "prize_winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "trackId" TEXT,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "repoUrl" TEXT,
    "pitchUrl" TEXT,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "failed_logins_identifier_idx" ON "failed_logins"("identifier");

-- CreateIndex
CREATE INDEX "failed_logins_userId_idx" ON "failed_logins"("userId");

-- CreateIndex
CREATE INDEX "failed_logins_createdAt_idx" ON "failed_logins"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_ownerId_idx" ON "organizations"("ownerId");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_creation_requests_hackSlug_key" ON "hackathon_creation_requests"("hackSlug");

-- CreateIndex
CREATE INDEX "hackathon_creation_requests_status_idx" ON "hackathon_creation_requests"("status");

-- CreateIndex
CREATE INDEX "hackathon_creation_requests_createdAt_idx" ON "hackathon_creation_requests"("createdAt");

-- CreateIndex
CREATE INDEX "hackathon_creation_requests_organizationId_idx" ON "hackathon_creation_requests"("organizationId");

-- CreateIndex
CREATE INDEX "hackathon_creation_requests_rejectedById_idx" ON "hackathon_creation_requests"("rejectedById");

-- CreateIndex
CREATE INDEX "hackathon_creation_requests_approvedById_idx" ON "hackathon_creation_requests"("approvedById");

-- CreateIndex
CREATE UNIQUE INDEX "hackathons_slug_key" ON "hackathons"("slug");

-- CreateIndex
CREATE INDEX "hackathons_slug_idx" ON "hackathons"("slug");

-- CreateIndex
CREATE INDEX "hackathons_organizationId_idx" ON "hackathons"("organizationId");

-- CreateIndex
CREATE INDEX "hackathons_status_isPrivate_idx" ON "hackathons"("status", "isPrivate");

-- CreateIndex
CREATE INDEX "hackathons_startDate_endDate_idx" ON "hackathons"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "tracks_hackathonId_idx" ON "tracks"("hackathonId");

-- CreateIndex
CREATE INDEX "prizes_hackathonId_idx" ON "prizes"("hackathonId");

-- CreateIndex
CREATE INDEX "prizes_trackId_idx" ON "prizes"("trackId");

-- CreateIndex
CREATE INDEX "prize_winners_prizeId_idx" ON "prize_winners"("prizeId");

-- CreateIndex
CREATE INDEX "prize_winners_projectId_idx" ON "prize_winners"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "prize_winners_prizeId_projectId_key" ON "prize_winners"("prizeId", "projectId");

-- CreateIndex
CREATE INDEX "projects_hackathonId_status_idx" ON "projects"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "projects_trackId_idx" ON "projects"("trackId");

-- CreateIndex
CREATE INDEX "projects_creatorId_idx" ON "projects"("creatorId");

-- CreateIndex
CREATE INDEX "projects_submittedAt_idx" ON "projects"("submittedAt");

-- CreateIndex
CREATE INDEX "teams_hackathonId_idx" ON "teams"("hackathonId");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "failed_logins" ADD CONSTRAINT "failed_logins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_creation_requests" ADD CONSTRAINT "hackathon_creation_requests_hackId_fkey" FOREIGN KEY ("hackId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_creation_requests" ADD CONSTRAINT "hackathon_creation_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_creation_requests" ADD CONSTRAINT "hackathon_creation_requests_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_creation_requests" ADD CONSTRAINT "hackathon_creation_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_winners" ADD CONSTRAINT "prize_winners_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_winners" ADD CONSTRAINT "prize_winners_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

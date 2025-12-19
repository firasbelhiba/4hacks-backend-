import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  TableOfContents,
  StyleLevel,
  ShadingType,
  convertInchesToTwip,
  ITableCellOptions,
  IParagraphOptions,
  ISectionOptions,
  FileChild,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const REPORT_TITLE = '4Hacks Hackathon Management Platform';
const REPORT_SUBTITLE = 'Security & Technical Audit Report';
const REPORT_VERSION = '1.0';
const REPORT_DATE = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Color definitions for severity levels
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'FF0000',
  HIGH: 'FF6600',
  MEDIUM: 'FFCC00',
  LOW: '00CC00',
  INFO: '0066CC',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createHeading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

function createSubHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: '333333',
      }),
    ],
    spacing: { before: 300, after: 150 },
  });
}

function createParagraph(text: string, options?: { bold?: boolean }): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options?.bold,
        size: 22,
      }),
    ],
    spacing: { after: 120 },
  });
}

function createBulletPoint(text: string, level = 0): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level },
    spacing: { after: 80 },
  });
}

function createCodeBlock(code: string, language = ''): Paragraph[] {
  const lines = code.split('\n');
  const paragraphs: Paragraph[] = [];

  // Add language label if provided
  if (language) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: language,
            font: 'Consolas',
            size: 18,
            color: '666666',
            italics: true,
          }),
        ],
        spacing: { before: 200, after: 50 },
      }),
    );
  }

  // Add code lines
  lines.forEach((line) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line || ' ',
            font: 'Consolas',
            size: 18,
            color: '333333',
          }),
        ],
        shading: {
          type: ShadingType.SOLID,
          color: 'F5F5F5',
        },
        indent: { left: convertInchesToTwip(0.25) },
        spacing: { after: 0 },
      }),
    );
  });

  paragraphs.push(new Paragraph({ spacing: { after: 200 } }));
  return paragraphs;
}

function createTableHeader(cells: string[]): TableRow {
  return new TableRow({
    children: cells.map(
      (cell) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell,
                  bold: true,
                  size: 20,
                  color: 'FFFFFF',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: {
            type: ShadingType.SOLID,
            color: '2E5090',
          },
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100,
          },
        }),
    ),
    tableHeader: true,
  });
}

function createTableRow(cells: string[], severityIndex?: number): TableRow {
  return new TableRow({
    children: cells.map((cell, index) => {
      let shading: ITableCellOptions['shading'];
      if (severityIndex !== undefined && index === severityIndex && cell in SEVERITY_COLORS) {
        shading = {
          type: ShadingType.SOLID,
          color: SEVERITY_COLORS[cell],
        };
      }
      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: cell,
                size: 18,
                color: shading ? 'FFFFFF' : '333333',
                bold: shading ? true : false,
              }),
            ],
          }),
        ],
        shading,
        margins: {
          top: 80,
          bottom: 80,
          left: 100,
          right: 100,
        },
      });
    }),
  });
}

function pageBreak(): Paragraph {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

function emptyParagraph(spacing = 200): Paragraph {
  return new Paragraph({ spacing: { before: spacing } });
}

// ============================================================================
// REPORT SECTIONS
// ============================================================================

function createCoverPage(): FileChild[] {
  return [
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: REPORT_SUBTITLE,
          bold: true,
          size: 56,
          color: '2E5090',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: REPORT_TITLE,
          bold: true,
          size: 40,
          color: '333333',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 800 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'NestJS Backend Application',
          size: 28,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Version: ${REPORT_VERSION}`,
          size: 24,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${REPORT_DATE}`,
          size: 24,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Classification: CONFIDENTIAL',
          size: 24,
          color: 'CC0000',
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
    pageBreak(),
  ];
}

function createTableOfContents(): FileChild[] {
  return [
    createHeading('Table of Contents', HeadingLevel.HEADING_1),
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      headingStyleRange: '1-3',
      stylesWithLevels: [
        new StyleLevel('Heading1', 1),
        new StyleLevel('Heading2', 2),
        new StyleLevel('Heading3', 3),
      ],
    }),
    pageBreak(),
  ];
}

function createExecutiveSummary(): FileChild[] {
  return [
    createHeading('1. Executive Summary', HeadingLevel.HEADING_1),

    createSubHeading('1.1 Platform Overview'),
    createParagraph(
      'The 4Hacks Platform is a comprehensive hackathon management system built with NestJS, designed to handle the complete lifecycle of hackathon events. The platform enables organizations to create and manage hackathons, facilitate team formation, handle project submissions, and manage prize distribution.',
    ),

    createSubHeading('1.2 Technology Stack'),
    createBulletPoint('Framework: NestJS 11.0.1 with TypeScript 5.7.3'),
    createBulletPoint('Database: PostgreSQL 15 with Prisma ORM 7.0.0'),
    createBulletPoint('Caching: Redis for sessions and temporary data'),
    createBulletPoint(
      'Authentication: JWT + OAuth 2.0 (Google, GitHub, LinkedIn)',
    ),
    createBulletPoint('File Storage: Cloudflare R2 (S3-compatible)'),
    createBulletPoint('Email: Nodemailer with Gmail SMTP'),

    createSubHeading('1.3 Key Statistics'),
    new Table({
      rows: [
        createTableHeader(['Metric', 'Value']),
        createTableRow(['Total Modules', '26']),
        createTableRow(['Database Models', '26']),
        createTableRow(['API Endpoints', '50+']),
        createTableRow(['Lines in Schema', '1,198']),
        createTableRow(['Enum Definitions', '13']),
        createTableRow(['OAuth Providers', '3 (Google, GitHub, LinkedIn)']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),
    createSubHeading('1.4 Risk Assessment Summary'),
    new Table({
      rows: [
        createTableHeader(['Severity', 'Count', 'Status']),
        createTableRow(['CRITICAL', '0', 'N/A'], 0),
        createTableRow(['HIGH', '3', 'Action Required'], 0),
        createTableRow(['MEDIUM', '7', 'Should Address'], 0),
        createTableRow(['LOW', '2', 'Consider Fixing'], 0),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),
    createSubHeading('1.5 Overall Security Posture'),
    createParagraph(
      'The platform demonstrates a solid security foundation with proper use of industry-standard practices including bcrypt password hashing, JWT-based authentication, and Prisma ORM for SQL injection prevention. However, several high-priority issues were identified that should be addressed before production deployment, including missing brute-force protection, debug logging in production code, and incomplete authorization checks.',
    ),

    pageBreak(),
  ];
}

function createArchitectureSection(): FileChild[] {
  return [
    createHeading('2. Platform Architecture', HeadingLevel.HEADING_1),

    createSubHeading('2.1 System Overview'),
    createParagraph(
      'The 4Hacks platform follows a modular monolithic architecture using NestJS framework. Each feature is encapsulated in its own module with clear separation of concerns between controllers, services, and data transfer objects (DTOs).',
    ),

    createSubHeading('2.2 Module Structure'),
    createParagraph(
      'The application is organized into the following major module categories:',
    ),

    createParagraph('Core Authentication & User Management:', { bold: true }),
    createBulletPoint('auth/ - JWT, OAuth2, 2FA, password reset'),
    createBulletPoint('profile/ - User profile management'),
    createBulletPoint('admin/users/ - User administration'),

    createParagraph('Organization & Hackathon Management:', { bold: true }),
    createBulletPoint('organization/ - Organization CRUD operations'),
    createBulletPoint('hackathon/ - Core hackathon management'),
    createBulletPoint('hackathon-request/ - Hackathon creation workflow'),
    createBulletPoint('categories/ - Hackathon categorization'),

    createParagraph('Team & Submission Management:', { bold: true }),
    createBulletPoint('hackathon/teams/ - Team formation and management'),
    createBulletPoint('hackathon/teams/team-positions/ - Open team positions'),
    createBulletPoint(
      'hackathon/teams/team-applications/ - Position applications',
    ),
    createBulletPoint('hackathon/submissions/ - Project submission workflow'),

    createParagraph('Prizes & Judging:', { bold: true }),
    createBulletPoint('hackathon/prizes/ - Prize management'),
    createBulletPoint('hackathon/judges-invitations/ - Judge invitations'),
    createBulletPoint('hackathon/submission-scores/ - Scoring system'),

    createParagraph('Communication & Support:', { bold: true }),
    createBulletPoint('hackathon/announcements/ - Hackathon announcements'),
    createBulletPoint('hackathon/hackathon-faq/ - Q&A threads'),
    createBulletPoint('notifications/ - In-app notifications'),
    createBulletPoint('email/ - Email service'),

    createParagraph('Infrastructure:', { bold: true }),
    createBulletPoint('prisma/ - Database service wrapper'),
    createBulletPoint('file-upload/ - File upload orchestration'),
    createBulletPoint('r2/ - Cloudflare R2 storage integration'),

    createSubHeading('2.3 Design Patterns'),
    createParagraph('The codebase implements several well-established patterns:'),
    createBulletPoint(
      'Dependency Injection: All services use constructor injection',
    ),
    createBulletPoint('Repository Pattern: Prisma service abstracts database operations'),
    createBulletPoint('Guard Pattern: Authentication and authorization via guards'),
    createBulletPoint('Decorator Pattern: Custom decorators for user extraction'),
    createBulletPoint('DTO Pattern: Separate DTOs for create, update, and query operations'),
    createBulletPoint('Transaction Pattern: Prisma transactions for atomic operations'),

    createSubHeading('2.4 Data Flow'),
    createParagraph(
      'The typical request flow through the application follows this pattern:',
    ),
    createBulletPoint('1. Request received by Controller'),
    createBulletPoint('2. Guards validate authentication/authorization'),
    createBulletPoint('3. ValidationPipe validates and transforms DTO'),
    createBulletPoint('4. Controller delegates to Service'),
    createBulletPoint('5. Service executes business logic via Prisma'),
    createBulletPoint('6. Response returned with appropriate status code'),

    pageBreak(),
  ];
}

function createDatabaseSchemaSection(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('3. Database Schema Analysis', HeadingLevel.HEADING_1),

    createSubHeading('3.1 Overview'),
    createParagraph(
      'The database uses PostgreSQL 15 with Prisma ORM. The schema consists of 26 models and 13 enums, providing a comprehensive data structure for hackathon management.',
    ),

    createSubHeading('3.2 Core Models'),

    createParagraph('User & Session Management:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Model', 'Purpose', 'Key Fields']),
        createTableRow([
          'users',
          'User accounts',
          'email, username, password, role, providers, 2FA fields',
        ]),
        createTableRow([
          'Session',
          'Session tracking',
          'refreshToken, status, metadata (IP, UA, device)',
        ]),
        createTableRow([
          'FailedLogin',
          'Login attempt tracking',
          'identifier, reason, timestamp',
        ]),
        createTableRow([
          'UserActivityLog',
          'User action auditing',
          'action, targetType, description, metadata',
        ]),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Organization & Hackathon:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Model', 'Purpose', 'Key Fields']),
        createTableRow([
          'Organization',
          'Event organizers',
          'name, type, size, region, contacts',
        ]),
        createTableRow([
          'Hackathon',
          'Main event entity',
          'title, status, dates, settings, prizePool',
        ]),
        createTableRow([
          'HackathonCreationRequest',
          'Creation workflow',
          '40+ fields for event planning',
        ]),
        createTableRow([
          'HackathonCategory',
          'Categorization',
          'name, description',
        ]),
        createTableRow([
          'Track',
          'Competition tracks',
          'name, description, judgingCriteria',
        ]),
        createTableRow(['Bounty', 'Sponsor challenges', 'title, reward, maxWinners']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Teams & Submissions:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Model', 'Purpose', 'Key Fields']),
        createTableRow(['Team', 'Hackathon teams', 'name, hackathonId']),
        createTableRow(['TeamMember', 'Team membership', 'role (LEADER/MEMBER)']),
        createTableRow([
          'TeamInvitation',
          'Team invites',
          'status (PENDING/ACCEPTED/DECLINED)',
        ]),
        createTableRow(['TeamPosition', 'Open positions', 'title, requiredSkills']),
        createTableRow(['TeamApplication', 'Position applications', 'message, status']),
        createTableRow(['Submission', 'Project submissions', 'title, status, links']),
        createTableRow([
          'SubmissionBounty',
          'Many-to-many junction',
          'submissionId, bountyId',
        ]),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createSubHeading('3.3 Enum Definitions'),

    new Table({
      rows: [
        createTableHeader(['Enum', 'Values', 'Usage']),
        createTableRow(['UserRole', 'ADMIN, USER', 'Role-based access control']),
        createTableRow(['TeamRole', 'LEADER, MEMBER', 'Team hierarchy']),
        createTableRow(['Provider', 'CREDENTIAL, GOOGLE, GITHUB, LINKEDIN', 'Auth providers']),
        createTableRow([
          'SessionStatus',
          'ACTIVE, REVOKED, EXPIRED',
          'Session lifecycle',
        ]),
        createTableRow([
          'SubmissionStatus',
          'DRAFT, SUBMITTED, UNDER_REVIEW, REJECTED, WITHDRAWN',
          'Submission workflow',
        ]),
        createTableRow([
          'HackathonStatus',
          'DRAFT, ACTIVE, ARCHIVED, CANCELLED',
          'Event lifecycle',
        ]),
        createTableRow(['PrizeType', 'TRACK, BOUNTY', 'Prize categorization']),
        createTableRow([
          'RequestStatus',
          'PENDING, APPROVED, REJECTED, DELETED',
          'Approval workflow',
        ]),
        createTableRow([
          'InvitationStatus',
          'PENDING, ACCEPTED, DECLINED',
          'Invitation handling',
        ]),
        createTableRow(['HackathonType', 'IN_PERSON, ONLINE, HYBRID', 'Event format']),
        createTableRow([
          'AnnouncementVisibility',
          'PUBLIC, REGISTERED_ONLY',
          'Content access',
        ]),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createSubHeading('3.4 Indexing Strategy'),
    createParagraph(
      'The schema implements strategic indexing for query optimization:',
    ),
    createBulletPoint('Primary keys: Auto-generated CUID identifiers'),
    createBulletPoint('Unique constraints: email, username, slug, team name per hackathon'),
    createBulletPoint('Foreign key indexes: Automatic on relation fields'),
    createBulletPoint('Search indexes: email, username, name fields'),
    createBulletPoint('Composite indexes: (hackathonId, status), (userId, teamId)'),
    createBulletPoint('Timestamp indexes: createdAt for sorting'),

    createSubHeading('3.5 Data Integrity'),
    createParagraph('Referential integrity is maintained through:'),
    createBulletPoint('CASCADE: Deletes propagate to child records (hackathons, teams)'),
    createBulletPoint('SET NULL: Preserves records when referenced entity deleted'),
    createBulletPoint('RESTRICT: Prevents deletion of users with submissions'),
    createBulletPoint('Unique constraints: Prevent duplicate team members, registrations'),

    pageBreak(),
  ];

  return elements;
}

function createSecurityAuditSection(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('4. Security Audit', HeadingLevel.HEADING_1),

    createSubHeading('4.1 Authentication Analysis'),
    createParagraph('JWT Implementation:', { bold: true }),
    createParagraph(
      'The platform uses JSON Web Tokens for stateless authentication with the following configuration:',
    ),
    createBulletPoint('Secret: Stored in JWT_SECRET environment variable'),
    createBulletPoint('Access Token Expiration: 7 days (configurable via JWT_EXPIRATION)'),
    createBulletPoint('Refresh Token Expiration: 604,800 seconds (7 days)'),
    createBulletPoint('Token Storage: Refresh tokens stored in Redis with hash'),

    emptyParagraph(200),
    createParagraph('Code Reference (src/auth/auth.service.ts):', { bold: true }),
    ...createCodeBlock(
      `// JWT Token Generation
const accessToken = this.jwtService.sign(
  { sub: user.id, email: user.email, role: user.role },
  { expiresIn: process.env.JWT_EXPIRATION || '7d' }
);`,
      'typescript',
    ),

    createParagraph('OAuth 2.0 Providers:', { bold: true }),
    createParagraph(
      'The platform supports three OAuth providers for social login:',
    ),

    new Table({
      rows: [
        createTableHeader(['Provider', 'Strategy', 'Scopes']),
        createTableRow(['Google', 'passport-google-oauth20', 'email, profile']),
        createTableRow(['GitHub', 'passport-github2', 'user:email, read:user']),
        createTableRow(['LinkedIn', 'passport-oauth2', 'r_emailaddress, r_liteprofile']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Two-Factor Authentication:', { bold: true }),
    createParagraph(
      'Email-based 2FA is implemented with the following security measures:',
    ),
    createBulletPoint('6-digit verification codes'),
    createBulletPoint('5-minute TTL stored in Redis'),
    createBulletPoint('Rate limiting on code requests'),
    createBulletPoint('Secure storage of 2FA secrets in database'),

    createParagraph('Password Security:', { bold: true }),
    createBulletPoint('Hashing: bcrypt with 12 salt rounds'),
    createBulletPoint('Complexity: Minimum 8 chars, uppercase, lowercase, number, symbol'),
    createBulletPoint('Reset: Token-based with 15-minute expiration'),
    createBulletPoint('Change: Requires current password verification'),

    emptyParagraph(200),
    createParagraph('Code Reference (src/auth/auth.service.ts):', { bold: true }),
    ...createCodeBlock(
      `// Password Hashing - Secure Implementation
const hashedPassword = await bcrypt.hash(password, 12);

// Password Validation - Strong Requirements
@IsStrongPassword({
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
})`,
      'typescript',
    ),

    // Authorization Section
    createSubHeading('4.2 Authorization Analysis'),
    createParagraph('Guard Implementation:', { bold: true }),
    createParagraph('The platform implements multiple authorization guards:'),

    new Table({
      rows: [
        createTableHeader(['Guard', 'Purpose', 'File Location']),
        createTableRow([
          'JwtAuthGuard',
          'Validates JWT token presence and validity',
          'src/auth/guards/jwt.guard.ts',
        ]),
        createTableRow([
          'OptionalJwtAuthGuard',
          'Allows both authenticated and anonymous',
          'src/auth/guards/opt-jwt.guard.ts',
        ]),
        createTableRow([
          'RolesGuard',
          'Enforces role-based access (ADMIN/USER)',
          'src/admin/guards/roles.guard.ts',
        ]),
        createTableRow([
          'HackathonContextGuard',
          'Validates hackathon access',
          'src/hackathon/guards/',
        ]),
        createTableRow([
          'CustomThrottlerGuard',
          'Rate limiting implementation',
          'src/common/guards/',
        ]),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    // Vulnerability Assessment
    createSubHeading('4.3 Vulnerability Assessment'),
    createParagraph(
      'The following security vulnerabilities were identified during the audit:',
    ),

    new Table({
      rows: [
        createTableHeader(['#', 'Vulnerability', 'Severity', 'File', 'Line']),
        createTableRow([
          '1',
          'Debug console.log statements expose sensitive data',
          'HIGH',
          'auth.controller.ts',
          '228, 313, 337',
        ], 2),
        createTableRow([
          '2',
          'No brute-force protection on login endpoint',
          'HIGH',
          'auth.service.ts',
          'login()',
        ], 2),
        createTableRow([
          '3',
          'RolesGuard allows access when no @Roles decorator',
          'HIGH',
          'roles.guard.ts',
          '17-22',
        ], 2),
        createTableRow([
          '4',
          'Default JWT secret fallback in code',
          'MEDIUM',
          'auth.service.ts',
          '56',
        ], 2),
        createTableRow([
          '5',
          'Hardcoded localhost in CORS fallback',
          'MEDIUM',
          'main.ts',
          '21',
        ], 2),
        createTableRow([
          '6',
          'Session expiration not enforced proactively',
          'MEDIUM',
          'auth.service.ts',
          '-',
        ], 2),
        createTableRow([
          '7',
          'No token binding (IP/User-Agent)',
          'MEDIUM',
          'auth.service.ts',
          '-',
        ], 2),
        createTableRow([
          '8',
          'Missing presigned URLs for R2 files',
          'MEDIUM',
          'r2.service.ts',
          '-',
        ], 2),
        createTableRow([
          '9',
          'Rate limit too aggressive globally',
          'MEDIUM',
          'app.module.ts',
          '55-62',
        ], 2),
        createTableRow([
          '10',
          'Exception filter exposes stack traces',
          'MEDIUM',
          'all-exceptions.filter.ts',
          '18-30',
        ], 2),
        createTableRow([
          '11',
          'No file content verification (magic bytes)',
          'LOW',
          'file-upload.service.ts',
          '16-30',
        ], 2),
        createTableRow([
          '12',
          'Refresh token cookie not secure in dev',
          'LOW',
          'auth.controller.ts',
          '175-183',
        ], 2),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    // Detailed Vulnerability Descriptions
    createSubHeading('4.4 Vulnerability Details'),

    // Vuln 1: Debug Logging
    createParagraph('Vulnerability #1: Debug Console.log Statements', {
      bold: true,
    }),
    createParagraph(
      'Multiple console.log statements expose sensitive information including cookies, JWT payloads, and user data in production logs.',
    ),
    ...createCodeBlock(
      `// VULNERABLE CODE - auth.controller.ts:228
console.log('Cookies', req.cookies);

// VULNERABLE CODE - notifications.gateway.ts
console.log('jwtPayload', jwtPayload);
console.log(client.handshake);

// RECOMMENDATION: Remove all console.log or use Logger with appropriate levels
this.logger.debug('Processing request', { sanitizedData });`,
      'typescript',
    ),

    // Vuln 2: Brute Force
    createParagraph('Vulnerability #2: No Brute-Force Protection', {
      bold: true,
    }),
    createParagraph(
      'While FailedLogin table exists, there is no enforcement of account lockout after repeated failed attempts.',
    ),
    ...createCodeBlock(
      `// CURRENT IMPLEMENTATION - Only logs failures, no lockout
const failedLogin = await this.prisma.failedLogin.create({
  data: { userId: user?.id, identifier, reason: 'wrong-password' }
});

// RECOMMENDATION: Implement lockout mechanism
const recentFailures = await this.prisma.failedLogin.count({
  where: {
    userId: user.id,
    createdAt: { gte: fifteenMinutesAgo }
  }
});
if (recentFailures >= 5) {
  throw new UnauthorizedException('Account temporarily locked');
}`,
      'typescript',
    ),

    // Vuln 3: RolesGuard
    createParagraph('Vulnerability #3: RolesGuard Default Behavior', {
      bold: true,
    }),
    createParagraph(
      'The RolesGuard allows access when no @Roles decorator is present, potentially exposing endpoints.',
    ),
    ...createCodeBlock(
      `// VULNERABLE CODE - roles.guard.ts:17-22
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()],
  );

  // VULNERABILITY: Returns true if no roles required
  if (!requiredRoles) {
    return true;
  }
  // ...
}

// RECOMMENDATION: Make strict by default
if (!requiredRoles) {
  return false; // Deny by default, require explicit @Public() decorator
}`,
      'typescript',
    ),

    pageBreak(),
  ];

  return elements;
}

function createBusinessLogicSection(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('5. Business Logic Analysis', HeadingLevel.HEADING_1),

    createSubHeading('5.1 Hackathon Lifecycle'),
    createParagraph('The hackathon lifecycle follows this workflow:'),
    createBulletPoint('1. Organization creates HackathonCreationRequest'),
    createBulletPoint('2. Admin reviews and approves/rejects request'),
    createBulletPoint('3. Upon approval, Hackathon created with DRAFT status'),
    createBulletPoint('4. Organizer updates hackathon details'),
    createBulletPoint('5. Status transitions: DRAFT -> ACTIVE -> ARCHIVED/CANCELLED'),

    createParagraph('Status Transition Issues:', { bold: true }),
    createBulletPoint(
      'No validation prevents transitioning from COMPLETED back to ACTIVE',
    ),
    createBulletPoint('Missing check for active submissions before cancellation'),
    createBulletPoint('TODO comment found: "Check for hackathon submissions conditions before cancelling"'),

    createSubHeading('5.2 Team Management'),
    createParagraph(
      'Critical Issue: Race Condition in Team Capacity Check',
      { bold: true },
    ),
    createParagraph(
      'The team member addition process has a race condition vulnerability:',
    ),
    ...createCodeBlock(
      `// VULNERABLE CODE - teams.service.ts
async addMemberToTeam(...) {
  // Step 1: Check capacity OUTSIDE transaction
  if (team.members.length >= hackathon.maxTeamSize) {
    throw new BadRequestException('Team is already full');
  }

  // Step 2: Create invitation in transaction
  const teamInvitation = await this.prisma.$transaction(async (tx) => {
    // Only creates invitation, doesn't add member
  });
}

// VULNERABILITY: Between capacity check and invitation acceptance,
// another member could join, exceeding the limit.

// RECOMMENDATION: Check capacity inside acceptance transaction
async acceptTeamInvitation(...) {
  return await this.prisma.$transaction(async (tx) => {
    const currentCount = await tx.teamMember.count({ where: { teamId } });
    if (currentCount >= maxTeamSize) {
      throw new ConflictException('Team is now full');
    }
    // ... proceed with adding member
  });
}`,
      'typescript',
    ),

    createSubHeading('5.3 Submission Workflow'),
    createParagraph('Submission Status Machine:'),

    new Table({
      rows: [
        createTableHeader(['From Status', 'To Status', 'Action', 'Actor']),
        createTableRow(['(new)', 'DRAFT', 'Create submission', 'Team Leader']),
        createTableRow(['DRAFT', 'SUBMITTED', 'Submit for review', 'Team Leader']),
        createTableRow(['SUBMITTED', 'UNDER_REVIEW', 'Start review', 'Organizer']),
        createTableRow(['UNDER_REVIEW', 'REJECTED', 'Reject submission', 'Organizer']),
        createTableRow(['SUBMITTED/DRAFT', 'WITHDRAWN', 'Withdraw submission', 'Team Leader']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Issues Identified:', { bold: true }),
    createBulletPoint(
      'Missing validation that submission belongs to the hackathon being reviewed',
    ),
    createBulletPoint('No check that status is UNDER_REVIEW before accepting/rejecting'),
    createBulletPoint('Withdrawal allowed anytime without penalty or cooldown'),

    createSubHeading('5.4 Registration Auto-Approval'),
    createParagraph('All hackathon registrations are currently auto-approved:'),
    ...createCodeBlock(
      `// hackathon-registration.service.ts:~35
const registration = await this.prisma.hackathonRegistration.create({
  data: {
    hackathonId,
    userId: user.id,
    status: HackathonRegistrationStatus.APPROVED,
    // TODO: Change status flow if needed but for now auto approve
  },
});

// ISSUE: This bypasses:
// - Admin approval workflows for private hackathons
// - Email verification requirements
// - Registration whitelist checks
// - Invite-only passcode validation`,
      'typescript',
    ),

    createSubHeading('5.5 Date Validation Gaps'),
    createParagraph('Missing validations in hackathon creation request:'),
    createBulletPoint('No check that dates are in the future'),
    createBulletPoint('No minimum registration period duration'),
    createBulletPoint('No minimum hackathon duration'),
    ...createCodeBlock(
      `// CURRENT VALIDATION - hackathon-request.service.ts
if (registrationEnd > startDate) {
  throw new BadRequestException(
    'Registration must end before or when the hackathon starts',
  );
}

// MISSING VALIDATIONS:
const now = new Date();
if (registrationStart < now) {
  throw new BadRequestException('Registration start must be in the future');
}
if (registrationEnd.getTime() - registrationStart.getTime() < 24 * 60 * 60 * 1000) {
  throw new BadRequestException('Registration period must be at least 24 hours');
}`,
      'typescript',
    ),

    createSubHeading('5.6 Prize Distribution'),
    createParagraph('Prize assignment logic review:'),
    createBulletPoint('Prizes linked to either tracks OR bounties (never both)'),
    createBulletPoint('PrizeWinner model correctly enforces unique prize-submission'),
    createBulletPoint(
      'Issue: No validation if submission is already winner of competing prize',
    ),

    pageBreak(),
  ];

  return elements;
}

function createAPIDesignSection(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('6. API Design Review', HeadingLevel.HEADING_1),

    createSubHeading('6.1 Endpoint Catalog'),
    createParagraph('Authentication Endpoints:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Method', 'Endpoint', 'Auth', 'Description']),
        createTableRow(['POST', '/auth/register', 'No', 'User registration']),
        createTableRow(['POST', '/auth/login', 'No', 'User login']),
        createTableRow(['POST', '/auth/2fa/verify-login', 'No', '2FA verification']),
        createTableRow(['POST', '/auth/refresh', 'Cookie', 'Refresh access token']),
        createTableRow(['POST', '/auth/logout', 'JWT', 'Logout current session']),
        createTableRow(['POST', '/auth/logout-all', 'JWT', 'Logout all sessions']),
        createTableRow(['GET', '/auth/me', 'JWT', 'Get current user']),
        createTableRow(['POST', '/auth/email/verify', 'No', 'Verify email']),
        createTableRow(['POST', '/auth/password/reset', 'No', 'Reset password']),
        createTableRow(['GET', '/auth/google/login', 'No', 'Google OAuth']),
        createTableRow(['GET', '/auth/github/login', 'No', 'GitHub OAuth']),
        createTableRow(['GET', '/auth/linkedin/login', 'No', 'LinkedIn OAuth']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Hackathon Endpoints:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Method', 'Endpoint', 'Auth', 'Description']),
        createTableRow(['GET', '/hackathon', 'Optional', 'List hackathons']),
        createTableRow(['GET', '/hackathon/:id', 'Optional', 'Get hackathon details']),
        createTableRow(['PATCH', '/hackathon/:id', 'JWT', 'Update hackathon']),
        createTableRow(['PUT', '/hackathon/:id/tracks', 'JWT', 'Manage tracks']),
        createTableRow(['PUT', '/hackathon/:id/sponsors', 'JWT', 'Manage sponsors']),
        createTableRow(['PUT', '/hackathon/:id/bounties', 'JWT', 'Manage bounties']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Team Endpoints:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Method', 'Endpoint', 'Auth', 'Description']),
        createTableRow(['GET', '/hackathon/:hid/teams', 'Optional', 'List teams']),
        createTableRow(['POST', '/hackathon/:hid/teams', 'JWT', 'Create team']),
        createTableRow(['POST', '/teams/:id/invite', 'JWT', 'Invite member']),
        createTableRow(['POST', '/teams/:id/invitations/:iid/accept', 'JWT', 'Accept invite']),
        createTableRow(['POST', '/teams/:id/members/:mid/remove', 'JWT', 'Remove member']),
        createTableRow([
          'POST',
          '/teams/:id/transfer-leadership',
          'JWT',
          'Transfer leadership',
        ]),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createParagraph('Admin Endpoints:', { bold: true }),

    new Table({
      rows: [
        createTableHeader(['Method', 'Endpoint', 'Auth', 'Description']),
        createTableRow(['GET', '/admin/users', 'Admin', 'List all users']),
        createTableRow(['POST', '/admin/users/:id/ban', 'Admin', 'Ban user']),
        createTableRow([
          'POST',
          '/admin/hackathon-requests/:id/approve',
          'Admin',
          'Approve request',
        ]),
        createTableRow([
          'POST',
          '/admin/hackathon-requests/:id/reject',
          'Admin',
          'Reject request',
        ]),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createSubHeading('6.2 Response Patterns'),
    createParagraph('Pagination Response:', { bold: true }),
    ...createCodeBlock(
      `{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}`,
      'json',
    ),

    createParagraph('Error Response:', { bold: true }),
    ...createCodeBlock(
      `{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be an email",
    "password is too weak"
  ]
}`,
      'json',
    ),

    createSubHeading('6.3 Rate Limiting'),
    createParagraph('Current Configuration:'),
    ...createCodeBlock(
      `// app.module.ts
ThrottlerModule.forRoot({
  throttlers: [{
    ttl: 60_000,  // 60 seconds window
    limit: 10,    // 10 requests per window
  }],
})`,
      'typescript',
    ),

    createParagraph('Issues:'),
    createBulletPoint('10 requests/minute is too aggressive for SPA applications'),
    createBulletPoint('No endpoint-specific limits'),
    createBulletPoint('Login endpoints should have stricter limits'),
    createBulletPoint('Public read endpoints could have higher limits'),

    createSubHeading('6.4 Swagger Documentation'),
    createParagraph('Documentation is available at /api/docs with:'),
    createBulletPoint('Bearer token authentication configured'),
    createBulletPoint('Endpoints grouped by tags'),
    createBulletPoint('@Api* decorators on most endpoints'),
    createBulletPoint('Request/response schemas defined via DTOs'),

    pageBreak(),
  ];

  return elements;
}

function createCodeQualitySection(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('7. Code Quality Assessment', HeadingLevel.HEADING_1),

    createSubHeading('7.1 Input Validation'),
    createParagraph('Global ValidationPipe Configuration:', { bold: true }),
    ...createCodeBlock(
      `// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,           // Auto-transform payloads to DTO classes
  }),
);`,
      'typescript',
    ),

    createParagraph('DTO Validation Example:', { bold: true }),
    ...createCodeBlock(
      `// register.dto.ts
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}`,
      'typescript',
    ),

    createSubHeading('7.2 Error Handling'),
    createParagraph('Global Exception Filter:', { bold: true }),
    ...createCodeBlock(
      `// all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    // ISSUE: Full error object may expose stack traces
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}`,
      'typescript',
    ),

    createSubHeading('7.3 Test Coverage'),
    createParagraph(
      'Current test coverage is minimal. All test files contain only basic existence tests:',
    ),
    ...createCodeBlock(
      `// Example: teams.service.spec.ts
describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// Missing test coverage for:
// - Business logic validation
// - Edge cases and error scenarios
// - Race condition scenarios
// - Authorization checks
// - Integration tests`,
      'typescript',
    ),

    createSubHeading('7.4 Logging Practices'),
    createParagraph('Issues Identified:', { bold: true }),
    createBulletPoint('Multiple console.log statements used instead of Logger'),
    createBulletPoint('Sensitive data logged in production'),
    createBulletPoint('No structured logging format'),
    createBulletPoint('Missing request correlation IDs'),

    createParagraph('Recommended Pattern:', { bold: true }),
    ...createCodeBlock(
      `// Use NestJS Logger instead of console.log
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(credentials: LoginDto) {
    this.logger.debug(\`Login attempt for: \${credentials.email}\`);
    // Never log passwords or tokens
  }
}`,
      'typescript',
    ),

    createSubHeading('7.5 Performance Considerations'),
    createParagraph('Identified Issues:', { bold: true }),
    createBulletPoint(
      'N+1 query potential in submission listing with bounties',
    ),
    createBulletPoint('Large transactions blocking concurrent operations'),
    createBulletPoint('Missing database connection pooling configuration'),
    createBulletPoint('No caching for frequently accessed hackathon data'),

    createParagraph('Positive Patterns:', { bold: true }),
    createBulletPoint('Strategic indexes on search and filter fields'),
    createBulletPoint('Proper use of Prisma select for field projection'),
    createBulletPoint('Pagination implemented on all list endpoints'),

    pageBreak(),
  ];

  return elements;
}

function createRecommendationsSection(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('8. Recommendations', HeadingLevel.HEADING_1),

    createSubHeading('8.1 Priority 1 - Critical (Immediate Action Required)'),

    createParagraph('1. Remove All Debug Console.log Statements', { bold: true }),
    createParagraph(
      'Search and remove all console.log statements, especially those in auth.controller.ts and notifications.gateway.ts that expose sensitive data.',
    ),

    createParagraph('2. Implement Brute-Force Protection', { bold: true }),
    createParagraph(
      'Add account lockout mechanism after 5 failed login attempts. Lock account for 15 minutes. Track failed attempts in existing FailedLogin table.',
    ),

    createParagraph('3. Make RolesGuard Strict by Default', { bold: true }),
    createParagraph(
      'Modify RolesGuard to deny access when no @Roles decorator is present. Add @Public() decorator for explicitly public routes.',
    ),

    createSubHeading('8.2 Priority 2 - High (Address Within 1 Month)'),

    createParagraph('4. Differentiate Rate Limits by Endpoint', { bold: true }),
    createBulletPoint('Login/Register: 5 requests per minute'),
    createBulletPoint('Password Reset: 3 requests per minute'),
    createBulletPoint('General API: 60 requests per minute'),
    createBulletPoint('Admin endpoints: 30 requests per minute'),

    createParagraph('5. Add Atomic Team Capacity Checks', { bold: true }),
    createParagraph(
      'Move team size validation inside database transaction when accepting invitations to prevent race conditions.',
    ),

    createParagraph('6. Remove JWT Secret Fallback', { bold: true }),
    createParagraph(
      'Remove the fallback-secret-key from auth.service.ts. Application should fail loudly if JWT_SECRET is not set.',
    ),

    createParagraph('7. Add Generic Error Handling in Production', { bold: true }),
    createParagraph(
      'Modify AllExceptionsFilter to return generic messages in production while logging full details server-side.',
    ),

    createSubHeading('8.3 Priority 3 - Medium (Address Within 3 Months)'),

    createParagraph('8. Implement Token Binding', { bold: true }),
    createParagraph(
      'Add optional strict session validation matching IP and User-Agent from initial login.',
    ),

    createParagraph('9. Add Session Cleanup Cron Job', { bold: true }),
    createParagraph(
      'Implement scheduled task to mark expired sessions as EXPIRED and clean up old records.',
    ),

    createParagraph('10. Implement Presigned URLs for R2', { bold: true }),
    createParagraph(
      'Add getPresignedUrl method to R2Service for time-limited access to private files.',
    ),

    createParagraph('11. Add File Content Verification', { bold: true }),
    createParagraph(
      'Verify file magic bytes match claimed MIME type before upload. Consider virus scanning integration.',
    ),

    createParagraph('12. Implement Comprehensive Test Suite', { bold: true }),
    createBulletPoint('Unit tests for all services'),
    createBulletPoint('Integration tests for API endpoints'),
    createBulletPoint('E2E tests for critical workflows'),
    createBulletPoint('Target: 80%+ code coverage'),

    createSubHeading('8.4 Additional Recommendations'),

    createParagraph('Date Validation:', { bold: true }),
    createBulletPoint('Add future date validation for hackathon creation'),
    createBulletPoint('Enforce minimum registration period (24 hours)'),
    createBulletPoint('Enforce minimum hackathon duration (4 hours)'),

    createParagraph('Registration Workflow:', { bold: true }),
    createBulletPoint('Implement proper approval workflow for private hackathons'),
    createBulletPoint('Add email verification requirement'),
    createBulletPoint('Validate invite passcode for private events'),

    createParagraph('Audit Trail:', { bold: true }),
    createBulletPoint('Log admin approval/rejection actions'),
    createBulletPoint('Track prize winner assignments'),
    createBulletPoint('Record hackathon status changes'),
    createBulletPoint('Log failed authorization attempts'),

    pageBreak(),
  ];

  return elements;
}

function createAppendices(): FileChild[] {
  const elements: FileChild[] = [
    createHeading('9. Appendices', HeadingLevel.HEADING_1),

    createSubHeading('Appendix A: Files Analyzed'),

    new Table({
      rows: [
        createTableHeader(['Category', 'File Path', 'Lines']),
        createTableRow(['Bootstrap', 'src/main.ts', '130']),
        createTableRow(['Database', 'prisma/schema.prisma', '1,198']),
        createTableRow(['Auth', 'src/auth/auth.service.ts', '~1,300']),
        createTableRow(['Auth', 'src/auth/auth.controller.ts', '~400']),
        createTableRow(['Auth', 'src/auth/guards/jwt.guard.ts', '~50']),
        createTableRow(['Auth', 'src/admin/guards/roles.guard.ts', '~30']),
        createTableRow(['Error', 'src/common/filters/all-exceptions.filter.ts', '~50']),
        createTableRow(['Upload', 'src/file-upload/file-upload.service.ts', '~50']),
        createTableRow(['Storage', 'src/r2/r2.service.ts', '~60']),
        createTableRow(['Hackathon', 'src/hackathon/hackathon.service.ts', '~500']),
        createTableRow(['Teams', 'src/hackathon/teams/teams.service.ts', '~400']),
        createTableRow(['Submissions', 'src/hackathon/submissions/submissions.service.ts', '~400']),
        createTableRow(['Config', 'src/app.module.ts', '~100']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createSubHeading('Appendix B: Environment Variables'),

    new Table({
      rows: [
        createTableHeader(['Variable', 'Required', 'Description']),
        createTableRow(['DATABASE_URL', 'Yes', 'PostgreSQL connection string']),
        createTableRow(['REDIS_URL', 'Yes', 'Redis connection string']),
        createTableRow(['JWT_SECRET', 'Yes', 'JWT signing secret (min 32 chars)']),
        createTableRow(['JWT_EXPIRATION', 'No', 'Access token expiration (default: 7d)']),
        createTableRow(['FRONTEND_URL', 'Yes', 'CORS origin URL']),
        createTableRow(['EMAIL_USER', 'Yes', 'Gmail SMTP username']),
        createTableRow(['EMAIL_PASS', 'Yes', 'Gmail app password']),
        createTableRow(['GOOGLE_CLIENT_ID', 'No', 'Google OAuth client ID']),
        createTableRow(['GITHUB_CLIENT_ID', 'No', 'GitHub OAuth client ID']),
        createTableRow(['LINKEDIN_CLIENT_ID', 'No', 'LinkedIn OAuth client ID']),
        createTableRow(['R2_PUBLIC_URL', 'No', 'Cloudflare R2 public URL']),
        createTableRow(['R2_ACCESS_KEY_ID', 'No', 'R2 access key']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createSubHeading('Appendix C: Security Checklist'),

    new Table({
      rows: [
        createTableHeader(['Item', 'Status', 'Notes']),
        createTableRow(['Password hashing (bcrypt)', 'PASS', '12 salt rounds']),
        createTableRow(['JWT authentication', 'PASS', 'Properly configured']),
        createTableRow(['OAuth 2.0 integration', 'PASS', '3 providers']),
        createTableRow(['Input validation', 'PASS', 'Global ValidationPipe']),
        createTableRow(['SQL injection prevention', 'PASS', 'Prisma ORM']),
        createTableRow(['CORS configuration', 'PARTIAL', 'Has localhost fallback']),
        createTableRow(['Rate limiting', 'PARTIAL', 'Too aggressive globally']),
        createTableRow(['Brute-force protection', 'FAIL', 'Not implemented']),
        createTableRow(['Debug logging removal', 'FAIL', 'Multiple console.log found']),
        createTableRow(['Error message sanitization', 'PARTIAL', 'May expose stack traces']),
        createTableRow(['Session management', 'PARTIAL', 'No proactive expiration']),
        createTableRow(['File upload security', 'PARTIAL', 'No content verification']),
        createTableRow(['Helmet security headers', 'PASS', 'Enabled in main.ts']),
        createTableRow(['HTTPS enforcement', 'N/A', 'Infrastructure level']),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    emptyParagraph(300),

    createSubHeading('Appendix D: Severity Definitions'),

    new Table({
      rows: [
        createTableHeader(['Severity', 'Definition', 'Response Time']),
        createTableRow([
          'CRITICAL',
          'Immediate exploitation possible, data breach risk',
          'Immediate',
        ], 0),
        createTableRow([
          'HIGH',
          'Significant security risk, requires prompt action',
          'Within 1 week',
        ], 0),
        createTableRow([
          'MEDIUM',
          'Moderate risk, should be addressed in normal cycle',
          'Within 1 month',
        ], 0),
        createTableRow([
          'LOW',
          'Minor issue, best practice improvement',
          'Within 3 months',
        ], 0),
        createTableRow([
          'INFO',
          'Informational finding, no immediate action needed',
          'As convenient',
        ], 0),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),

    // Final page
    emptyParagraph(1000),
    new Paragraph({
      children: [
        new TextRun({
          text: '--- End of Report ---',
          size: 24,
          color: '666666',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];

  return elements;
}

// ============================================================================
// MAIN DOCUMENT GENERATION
// ============================================================================

async function generateAuditReport(): Promise<void> {
  console.log('Generating audit report...');

  const doc = new Document({
    creator: 'Security Audit Tool',
    title: REPORT_TITLE,
    description: REPORT_SUBTITLE,
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 36,
            bold: true,
            color: '2E5090',
          },
          paragraph: {
            spacing: {
              before: 400,
              after: 200,
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 28,
            bold: true,
            color: '333333',
          },
          paragraph: {
            spacing: {
              before: 300,
              after: 150,
            },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 24,
            bold: true,
            color: '444444',
          },
          paragraph: {
            spacing: {
              before: 200,
              after: 100,
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${REPORT_TITLE} - ${REPORT_SUBTITLE}`,
                    size: 18,
                    color: '666666',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 18,
                    color: '666666',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '666666',
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 18,
                    color: '666666',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: '666666',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          ...createCoverPage(),
          ...createTableOfContents(),
          ...createExecutiveSummary(),
          ...createArchitectureSection(),
          ...createDatabaseSchemaSection(),
          ...createSecurityAuditSection(),
          ...createBusinessLogicSection(),
          ...createAPIDesignSection(),
          ...createCodeQualitySection(),
          ...createRecommendationsSection(),
          ...createAppendices(),
        ],
      },
    ],
  });

  // Generate the document
  const buffer = await Packer.toBuffer(doc);

  // Write to file
  const outputPath = path.join(process.cwd(), 'audit-report.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Audit report generated successfully: ${outputPath}`);
}

// Run the generator
generateAuditReport().catch(console.error);

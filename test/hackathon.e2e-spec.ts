import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateHackathonRequestDto } from 'src/hackathon-request/dto/create-request.dto';
import { CreateOrganizationDto } from 'src/organization/dto/create.dto';
import {
  FundingSource,
  GeographicScope,
  HackathonCategory,
  HackathonType,
  MarketingHelpDetails,
  OrganizationSize,
  OrganizationType,
  Region,
} from '@prisma/client';

describe('HackathonController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicate main.ts setup
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    // Assuming default prefix 'api' as per main.ts fallback
    app.setGlobalPrefix('api');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create an admin user
    await prisma.users.create({
      data: {
        name: 'Admin',
        username: 'admin',
        email: 'admin@darblockchain.io',
        password: 'Admin@123',
      },
    });
  });

  afterAll(async () => {
    // Clear all the database
    await prisma.$transaction([
      prisma.users.deleteMany(),
      prisma.team.deleteMany(),
      prisma.organization.deleteMany(),
      prisma.submission.deleteMany(),
      prisma.hackathon.deleteMany(),
      prisma.hackathonCreationRequest.deleteMany(),
    ]);
    await app.close();
  });

  it('Complete workflow of hackathon', async () => {
    // Step 1: Register as a new user
    const registerDto: RegisterDto = {
      name: 'Ayoub Buoya',
      username: 'ayoubbuoya',
      email: 'ayoub@darblockchain.io',
      password: 'Ayoub@123',
    };

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerDto);

    console.log('Register Response: ', registerResponse.body);

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body.data.email).toBe(registerDto.email);
    expect(registerResponse.body.data.username).toBe(registerDto.username);
    expect(registerResponse.body.data.name).toBe(registerDto.name);

    // Step 2: Login as the new user
    const loginDto: LoginDto = {
      identifier: 'ayoub@darblockchain.io',
      password: 'Ayoub@123',
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginDto);
    expect(loginResponse.statusCode).toBe(201);

    const orgAccessToken = loginResponse.body.token;

    console.log('Organizer AccessToken: ', orgAccessToken);

    // Create organization
    const createOrgDto: CreateOrganizationDto = {
      name: 'Dar Blockchain',
      description: 'Dar Blockchain is a blockchain organization',
      slug: 'dar-blockchain',
      displayName: 'Dar Blockchain',
      tagline: 'Building the future of blockchain in Tunisia',
      type: OrganizationType.STARTUP,
      establishedYear: 2020,
      size: OrganizationSize.ELEVEN_TO_FIFTY,
      operatingRegions: [Region.AFRICA, Region.EUROPE],
      email: 'ayoub@darblockchain.io',
      phone: '+216 12 345 678',
      country: 'Tunisia',
      city: 'Tunis',
      state: 'Tunis',
      zipCode: '1000',
      loc_address: '123 Blockchain Street',
      website: 'https://darblockchain.io',
      linkedin: 'https://linkedin.com/company/darblockchain',
      github: 'https://github.com/darblockchain',
      twitter: 'https://twitter.com/darblockchain',
      discord: 'https://discord.gg/darblockchain',
      telegram: 'https://t.me/darblockchain',
      medium: 'https://medium.com/@darblockchain',
      youtube: 'https://youtube.com/@darblockchain',
      facebook: 'https://facebook.com/darblockchain',
      instagram: 'https://instagram.com/darblockchain',
      reddit: 'https://reddit.com/r/darblockchain',
    };

    const createOrgResponse = await request(app.getHttpServer())
      .post('/api/organization')
      .set('Authorization', `Bearer ${orgAccessToken}`)
      .send(createOrgDto);

    console.log('Create Organization Response: ', createOrgResponse.body);

    expect(createOrgResponse.statusCode).toBe(201);

    const orgId = createOrgResponse.body.data.id;

    console.log('Organization ID: ', orgId);

    // Create hackathon  request with that organization
    const createHackathonRequestDto: CreateHackathonRequestDto = {
      hackTitle: 'Dar Blockchain Hackathon',
      hackSlug: 'dar-blockchain-hackathon',
      hackType: HackathonType.ONLINE,
      organizationId: orgId,
      focus: 'Blockchain',
      hackCategory: HackathonCategory.WEB3,
      audience: 'Students',
      expectedAttendees: 100,
      geographicScope: GeographicScope.GLOBAL,
      registrationStart: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      registrationEnd: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      startDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      prizePool: 10000,
      prizeToken: 'USD',
      expectedTotalWinners: 10,
      distributionPlan: 'Distribution plan',
      fundingSources: [FundingSource.GRANTS],
      marketingHelp: false,
      marketingHelpDetails: [MarketingHelpDetails.COMMUNITY_OUTREACH],
      
    };
  });
});

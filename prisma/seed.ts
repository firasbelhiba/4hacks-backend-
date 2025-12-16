import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Create a pg Pool and Prisma adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to generate random data
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Data pools for generation
const hackathonTitles = [
  'Web3 Builders Summit',
  'DeFi Innovation Challenge',
  'NFT Creator Fest',
  'Blockchain Developer Bootcamp',
  'Crypto Hackathon',
  'Smart Contract Showdown',
  'Decentralized Future',
  'Chain Builders',
  'Protocol Pioneers',
  'DApp Developers',
  'Tokenomics Tournament',
  'Cross-Chain Challenge',
  'Layer 2 Launchpad',
  'DAO Democracy',
  'Privacy Protocol',
  'Gaming Guild',
  'Metaverse Masters',
  'Infrastructure Innovators',
  'Security Summit',
  'Scalability Sprint',
];

const cities = [
  'San Francisco', 'New York', 'London', 'Singapore', 'Tokyo', 'Berlin', 'Paris',
  'Toronto', 'Sydney', 'Dubai', 'Amsterdam', 'Zurich', 'Seoul', 'Mumbai',
  'São Paulo', 'Barcelona', 'Vancouver', 'Austin', 'Boston', 'Chicago',
];

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Japan',
  'Singapore', 'Australia', 'Netherlands', 'Switzerland', 'South Korea',
  'India', 'Brazil', 'Spain', 'United Arab Emirates',
];

const teamNames = [
  'Code Warriors', 'Blockchain Bandits', 'Crypto Crusaders', 'DeFi Developers',
  'Smart Squad', 'Chain Champions', 'Protocol Pioneers', 'Token Titans',
  'DApp Dreamers', 'Web3 Wizards', 'NFT Ninjas', 'DAO Defenders',
  'Layer 2 Legends', 'Privacy Protectors', 'Security Savants', 'Scalability Stars',
  'Innovation Inc', 'Builders Brigade', 'Hack Heroes', 'Tech Titans',
];

const projectTitles = [
  'DeFi Aggregator', 'NFT Marketplace', 'DAO Tool', 'Cross-Chain Bridge',
  'Gaming Platform', 'Identity Solution', 'Payment Protocol', 'Oracle Service',
  'Staking Platform', 'Lending Protocol', 'DEX', 'Yield Optimizer',
  'Portfolio Tracker', 'Wallet App', 'Analytics Dashboard', 'Governance Tool',
];

const technologies = [
  'Solidity', 'Rust', 'TypeScript', 'JavaScript', 'React', 'Next.js',
  'Vue.js', 'Node.js', 'Python', 'Go', 'Anchor', 'Hardhat', 'Foundry',
  'Ethers.js', 'Web3.js', 'Wagmi', 'The Graph', 'IPFS', 'Arweave',
];

const skills = [
  'Solidity', 'Rust', 'TypeScript', 'JavaScript', 'React', 'Smart Contracts',
  'DeFi', 'NFT', 'Web3', 'Blockchain', 'Cryptography', 'Security',
  'Frontend', 'Backend', 'Full Stack', 'DevOps', 'UI/UX', 'Product',
];

// Nice, eye-friendly color palette (inspired by seed.ts)
const niceColors = [
  '627EEA', // Ethereum purple-blue
  '14F195', // Solana green
  '8247E5', // Polygon purple
  '375BD2', // Chainlink blue
  '6F4CFF', // The Graph purple
  'B6509E', // Aave pink
  '8B5CF6', // Jupiter purple
  '4A90E2', // Sky blue
  '00D4AA', // Teal
  'FF6B6B', // Coral red
  '4ECDC4', // Turquoise
  '95E1D3', // Mint green
  'F38181', // Soft pink
  'AA96DA', // Lavender
  'FCBAD3', // Light pink
  'A8E6CF', // Light green
];

async function main() {
  console.log('🌱 Starting MAX database seed...\n');
  console.log('⚠️  This will generate a large amount of data (50 hackathons, 200 teams, 600+ users)\n');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.announcement.deleteMany();
  await prisma.hackathonQuestionReply.deleteMany();
  await prisma.hackathonQuestionThread.deleteMany();
  await prisma.hackathonRegistrationAnswer.deleteMany();
  await prisma.hackathonRegistrationQuestion.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.teamInvitation.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.prizeWinner.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.team.deleteMany();
  await prisma.hackathonRegistration.deleteMany();
  await prisma.prize.deleteMany();
  await prisma.bounty.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.track.deleteMany();
  await prisma.customHackathonTab.deleteMany();
  await prisma.hackathonCreationRequest.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.hackathonCategory.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.userActivityLog.deleteMany();
  await prisma.failedLogin.deleteMany();
  await prisma.session.deleteMany();
  await prisma.users.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  // ============================================
  // 1. CREATE USERS (600-700 users)
  // ============================================
  console.log('👤 Creating users (600-700)...');

  // Admin user (exactly like seed.ts)
  const adminUser = await prisma.users.create({
    data: {
      email: 'admin@4hacks.io',
      username: 'admin',
      password: hashedPassword,
      name: 'Platform Admin',
      role: 'ADMIN',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'Platform Administrator',
      bio: 'Managing the 4Hacks platform - The home for Web3 builders',
      skills: ['Platform Management', 'Developer Relations', 'Web3'],
    },
  });

  const users = [adminUser];

  // Create users individually (like seed.ts) but scaled up
  // We'll create 700 total: 1 admin + 12 org owners + 687 regular users
  const totalRegularUsers = 687; // Regular users (excluding admin and org owners)
  
  for (let i = 1; i <= totalRegularUsers; i++) {
    const userNum = i;
    const email = `user${userNum}@example.com`;
    const username = `user${userNum}`;
    
    const user = await prisma.users.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: `User${userNum} Dev${userNum}`,
        role: 'USER',
        isEmailVerified: true,
        providers: ['CREDENTIAL'],
        profession: randomChoice(['Smart Contract Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Blockchain Engineer', 'DeFi Developer', 'NFT Developer']),
        bio: `Web3 developer passionate about ${randomChoice(['DeFi', 'NFTs', 'DAOs', 'Infrastructure', 'Privacy', 'Gaming'])}`,
        location: `${randomChoice(cities)}, ${randomChoice(countries)}`,
        skills: Array.from({ length: randomInt(2, 5) }, () => randomChoice(skills)),
        github: `https://github.com/${username}`,
        walletAddress: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      },
    });
    
    users.push(user);
    
    // Log progress every 100 users
    if (i % 100 === 0) {
      console.log(`   Created ${i}/${totalRegularUsers} regular users`);
    }
  }

  console.log(`✅ Created ${users.length} users\n`);

  // ============================================
  // 2. CREATE HACKATHON CATEGORIES
  // ============================================
  console.log('📁 Creating hackathon categories...');
  await prisma.hackathonCategory.createMany({
    data: [
      { name: 'DEFI', description: 'Decentralized Finance' },
      { name: 'NFT & GAMING', description: 'NFTs and Gaming' },
      { name: 'INFRASTRUCTURE', description: 'Infrastructure and Tools' },
      { name: 'ZK & PRIVACY', description: 'Zero-Knowledge and Privacy' },
      { name: 'DAO & GOVERNANCE', description: 'DAOs and Governance' },
      { name: 'AI X WEB3', description: 'AI and Web3' },
      { name: 'OPEN TRACK', description: 'Open Track' },
    ],
  });
  const categoryRecords = await prisma.hackathonCategory.findMany();
  console.log(`✅ Created ${categoryRecords.length} categories\n`);

  // ============================================
  // 3. CREATE ORGANIZATION OWNERS & ORGANIZATIONS
  // ============================================
  console.log('🏢 Creating organization owners and organizations...');
  const orgNames = [
    'Ethereum Foundation', 'Solana Labs', 'Polygon DAO', 'Avalanche Foundation',
    'Chainlink Labs', 'The Graph Foundation', 'Uniswap Labs', 'Aave Protocol',
    'Arbitrum Foundation', 'Optimism Foundation', 'Base', 'zkSync',
  ];
  
  // Create organization owners with clear naming
  const orgOwners: Array<{ userId: string; orgName: string }> = [];
  for (let i = 0; i < orgNames.length; i++) {
    const orgNameShort = orgNames[i].toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const orgOwner = await prisma.users.create({
      data: {
        email: `org_owner_${orgNameShort}@4hacks.io`,
        username: `org_owner_${orgNameShort}`,
        password: hashedPassword,
        name: `${orgNames[i]} Owner`,
        role: 'USER',
        isEmailVerified: true,
        providers: ['CREDENTIAL'],
        profession: 'Organization Founder',
        bio: `Founder and owner of ${orgNames[i]}`,
        skills: ['Organization Management', 'Web3', 'Blockchain'],
      },
    });
    users.push(orgOwner);
    orgOwners.push({ userId: orgOwner.id, orgName: orgNames[i] });
  }
  console.log(`   Created ${orgOwners.length} organization owners\n`);
  
  // Create organizations with their owners
  const orgToOwnerMap = new Map<string, string>(); // orgId -> ownerId
  const hackathonToOrgOwnerMap = new Map<string, string>(); // hackathonId -> ownerId
  
  // Create first organization to initialize array type
  const firstOrgSlug = orgNames[0].toLowerCase().replace(/\s+/g, '-');
  const firstOrgOwner = orgOwners[0];
  const firstOrg = await prisma.organization.create({
    data: {
      name: orgNames[0],
      slug: firstOrgSlug,
      displayName: orgNames[0],
      logo: `https://placehold.co/200x200/${niceColors[0]}/FFFFFF?text=${orgNames[0].substring(0, 3)}`,
      tagline: `Building the future of ${randomChoice(['blockchain', 'DeFi', 'Web3', 'crypto'])}`,
      description: `Organization focused on ${orgNames[0]}`,
      type: randomChoice(['BLOCKCHAIN_FOUNDATION', 'STARTUP', 'DAO', 'ENTERPRISE']),
      establishedYear: randomInt(2015, 2022),
      size: randomChoice(['FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'COMMUNITY_DRIVEN']),
      operatingRegions: [randomChoice(['GLOBAL', 'NORTH_AMERICA', 'EUROPE', 'ASIA'])],
      email: `contact@${firstOrgSlug.replace(/-/g, '')}.io`,
      phone: '+1-555-0001',
      country: randomChoice(countries),
      city: randomChoice(cities),
      website: `https://${firstOrgSlug.replace(/-/g, '')}.io`,
      linkedin: `https://linkedin.com/company/${firstOrgSlug}`,
      github: `https://github.com/${firstOrgSlug.replace(/-/g, '')}`,
      twitter: `https://twitter.com/${firstOrgSlug.replace(/-/g, '')}`,
      ownerId: firstOrgOwner.userId,
    },
  });
  const organizations = [firstOrg];
  orgToOwnerMap.set(firstOrg.id, firstOrgOwner.userId);
  
  for (let i = 1; i < orgNames.length; i++) {
    const orgSlug = orgNames[i].toLowerCase().replace(/\s+/g, '-');
    const orgOwner = orgOwners[i];
    const org = await prisma.organization.create({
      data: {
        name: orgNames[i],
        slug: orgSlug,
        displayName: orgNames[i],
        logo: `https://placehold.co/200x200/${niceColors[i % niceColors.length]}/FFFFFF?text=${orgNames[i].substring(0, 3)}`,
        tagline: `Building the future of ${randomChoice(['blockchain', 'DeFi', 'Web3', 'crypto'])}`,
        description: `Organization focused on ${orgNames[i]}`,
        type: randomChoice(['BLOCKCHAIN_FOUNDATION', 'STARTUP', 'DAO', 'ENTERPRISE']),
        establishedYear: randomInt(2015, 2022),
        size: randomChoice(['FIFTY_ONE_TO_TWO_HUNDRED', 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED', 'COMMUNITY_DRIVEN']),
        operatingRegions: [randomChoice(['GLOBAL', 'NORTH_AMERICA', 'EUROPE', 'ASIA'])],
        email: `contact@${orgSlug.replace(/-/g, '')}.io`,
        phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
        country: randomChoice(countries),
        city: randomChoice(cities),
        website: `https://${orgSlug.replace(/-/g, '')}.io`,
        linkedin: `https://linkedin.com/company/${orgSlug}`,
        github: `https://github.com/${orgSlug.replace(/-/g, '')}`,
        twitter: `https://twitter.com/${orgSlug.replace(/-/g, '')}`,
        ownerId: orgOwner.userId,
      },
    });
    organizations.push(org);
    orgToOwnerMap.set(org.id, orgOwner.userId);
  }
  console.log(`✅ Created ${organizations.length} organizations\n`);

  // ============================================
  // 4. CREATE HACKATHONS (50 hackathons)
  // ============================================
  console.log('🏆 Creating hackathons (50)...');
  
  // Create first hackathon to initialize array type
  const firstTitle = `${randomChoice(hackathonTitles)} 2024`;
  const firstSlug = firstTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-0';
  const firstCategory = randomChoice(categoryRecords);
  const firstHackathonOrg = randomChoice(organizations);
  
  // Generate dates that make most hackathons ACTIVE (registration open, event ongoing or upcoming)
  const firstRegistrationStart = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));
  const firstRegistrationEnd = randomDate(new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
  const firstStartDate = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
  const firstEndDate = new Date(firstStartDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
  const firstJudgingStart = firstEndDate;
  const firstJudgingEnd = new Date(firstJudgingStart.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000);
  
  // Determine status: Most should be ACTIVE, some DRAFT/ARCHIVED/CANCELLED
  let firstStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'CANCELLED' = 'ACTIVE';
  const statusRoll = Math.random();
  if (statusRoll < 0.7) {
    // 70% ACTIVE - registration open and event ongoing/upcoming
    firstStatus = 'ACTIVE';
  } else if (statusRoll < 0.85) {
    // 15% DRAFT - future events
    firstStatus = 'DRAFT';
    // Adjust dates to be in the future
    firstRegistrationStart.setTime(now.getTime() + randomInt(10, 30) * 24 * 60 * 60 * 1000);
    firstRegistrationEnd.setTime(firstRegistrationStart.getTime() + randomInt(5, 15) * 24 * 60 * 60 * 1000);
    firstStartDate.setTime(firstRegistrationEnd.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000);
    firstEndDate.setTime(firstStartDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
    firstJudgingStart.setTime(firstEndDate.getTime());
    firstJudgingEnd.setTime(firstJudgingStart.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000);
  } else if (statusRoll < 0.95) {
    // 10% ARCHIVED - past events
    firstStatus = 'ARCHIVED';
    // Adjust dates to be in the past
    firstRegistrationStart.setTime(now.getTime() - randomInt(60, 90) * 24 * 60 * 60 * 1000);
    firstRegistrationEnd.setTime(firstRegistrationStart.getTime() + randomInt(10, 20) * 24 * 60 * 60 * 1000);
    firstStartDate.setTime(now.getTime() - randomInt(30, 60) * 24 * 60 * 60 * 1000);
    firstEndDate.setTime(now.getTime() - randomInt(20, 30) * 24 * 60 * 60 * 1000);
    firstJudgingStart.setTime(firstEndDate.getTime());
    firstJudgingEnd.setTime(now.getTime() - randomInt(10, 20) * 24 * 60 * 60 * 1000);
  } else {
    // 5% CANCELLED
    firstStatus = 'CANCELLED';
    // Similar to archived but marked as cancelled
    firstRegistrationStart.setTime(now.getTime() - randomInt(60, 90) * 24 * 60 * 60 * 1000);
    firstRegistrationEnd.setTime(firstRegistrationStart.getTime() + randomInt(10, 20) * 24 * 60 * 60 * 1000);
    firstStartDate.setTime(now.getTime() - randomInt(30, 60) * 24 * 60 * 60 * 1000);
    firstEndDate.setTime(now.getTime() - randomInt(20, 30) * 24 * 60 * 60 * 1000);
    firstJudgingStart.setTime(firstEndDate.getTime());
    firstJudgingEnd.setTime(now.getTime() - randomInt(10, 20) * 24 * 60 * 60 * 1000);
  }
  
  const firstIsPrivate = Math.random() > 0.9; // 10% private
  const firstInvitePasscode = firstIsPrivate ? await bcrypt.hash('PASSCODE123', 10) : null;
  
  const firstHackathon = await prisma.hackathon.create({
    data: {
      title: firstTitle,
      slug: firstSlug,
      organizationId: firstHackathonOrg.id,
      categoryId: firstCategory.id,
      banner: `https://placehold.co/1200x400/${niceColors[0]}/FFFFFF?text=${encodeURIComponent(firstTitle)}`,
      tagline: `Join ${randomInt(100, 1000)}+ builders for ${firstTitle}`,
      description: `# ${firstTitle}\n\nBuild amazing Web3 projects. Prize pool: $${randomInt(50000, 500000)}.`,
      type: randomChoice(['ONLINE', 'HYBRID', 'IN_PERSON']),
      status: firstStatus,
      tags: Array.from({ length: randomInt(3, 6) }, () => randomChoice(['Ethereum', 'Solana', 'DeFi', 'NFT', 'Web3', 'Blockchain', 'Crypto'])),
      prizePool: randomInt(50000, 500000),
      prizeToken: randomChoice(['USD', 'USDC', 'ETH', 'SOL']),
      eligibilityRequirements: 'Open to all developers 18+.',
      submissionGuidelines: 'Submit your project with code, demo, and documentation.',
      ressources: 'Check our developer resources page.',
      registrationStart: firstRegistrationStart,
      registrationEnd: firstRegistrationEnd,
      startDate: firstStartDate,
      endDate: firstEndDate,
      judgingStart: firstJudgingStart,
      judgingEnd: firstJudgingEnd,
      location: {
        country: randomChoice(countries),
        city: randomChoice(cities),
      },
      maxTeamSize: randomInt(3, 6),
      minTeamSize: 1,
      requiresApproval: Math.random() > 0.7,
      isPrivate: firstIsPrivate,
      invitePasscode: firstInvitePasscode,
      requiredSubmissionMaterials: randomChoice([
        ['VIDEO_DEMO', 'GITHUB_REPOSITORY'],
        ['VIDEO_DEMO', 'GITHUB_REPOSITORY', 'PITCH_DECK'],
        ['GITHUB_REPOSITORY'],
      ]),
    },
  });
  const hackathons = [firstHackathon];
  // Track the organization owner for this hackathon
  const firstOrgOwnerId = orgToOwnerMap.get(firstHackathonOrg.id);
  if (firstOrgOwnerId) {
    hackathonToOrgOwnerMap.set(firstHackathon.id, firstOrgOwnerId);
  }
  
  for (let i = 1; i < 50; i++) {
    const title = `${randomChoice(hackathonTitles)} ${2024 + (i % 3)}`;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + `-${i}`;
    const category = randomChoice(categoryRecords);
    const org = randomChoice(organizations);
    
    // Generate dates that make most hackathons ACTIVE
    let registrationStart = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));
    let registrationEnd = randomDate(new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    let startDate = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    let endDate = new Date(startDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
    let judgingStart = endDate;
    let judgingEnd = new Date(judgingStart.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000);
    
    // Determine status: Most should be ACTIVE, some DRAFT/ARCHIVED/CANCELLED
    let status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'CANCELLED' = 'ACTIVE';
    const statusRoll = Math.random();
    if (statusRoll < 0.7) {
      // 70% ACTIVE - registration open and event ongoing/upcoming
      status = 'ACTIVE';
    } else if (statusRoll < 0.85) {
      // 15% DRAFT - future events
      status = 'DRAFT';
      // Adjust dates to be in the future
      registrationStart = new Date(now.getTime() + randomInt(10, 30) * 24 * 60 * 60 * 1000);
      registrationEnd = new Date(registrationStart.getTime() + randomInt(5, 15) * 24 * 60 * 60 * 1000);
      startDate = new Date(registrationEnd.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
      judgingStart = endDate;
      judgingEnd = new Date(judgingStart.getTime() + randomInt(3, 7) * 24 * 60 * 60 * 1000);
    } else if (statusRoll < 0.95) {
      // 10% ARCHIVED - past events
      status = 'ARCHIVED';
      // Adjust dates to be in the past
      registrationStart = new Date(now.getTime() - randomInt(60, 90) * 24 * 60 * 60 * 1000);
      registrationEnd = new Date(registrationStart.getTime() + randomInt(10, 20) * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - randomInt(30, 60) * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() - randomInt(20, 30) * 24 * 60 * 60 * 1000);
      judgingStart = endDate;
      judgingEnd = new Date(now.getTime() - randomInt(10, 20) * 24 * 60 * 60 * 1000);
    } else {
      // 5% CANCELLED
      status = 'CANCELLED';
      // Similar to archived but marked as cancelled
      registrationStart = new Date(now.getTime() - randomInt(60, 90) * 24 * 60 * 60 * 1000);
      registrationEnd = new Date(registrationStart.getTime() + randomInt(10, 20) * 24 * 60 * 60 * 1000);
      startDate = new Date(now.getTime() - randomInt(30, 60) * 24 * 60 * 60 * 1000);
      endDate = new Date(now.getTime() - randomInt(20, 30) * 24 * 60 * 60 * 1000);
      judgingStart = endDate;
      judgingEnd = new Date(now.getTime() - randomInt(10, 20) * 24 * 60 * 60 * 1000);
    }
    
    const isPrivate = Math.random() > 0.9; // 10% private
    const invitePasscode = isPrivate ? await bcrypt.hash('PASSCODE123', 10) : null;
    
    const hackathon = await prisma.hackathon.create({
      data: {
        title,
        slug,
        organizationId: org.id,
        categoryId: category.id,
        banner: `https://placehold.co/1200x400/${niceColors[i % niceColors.length]}/FFFFFF?text=${encodeURIComponent(title)}`,
        tagline: `Join ${randomInt(100, 1000)}+ builders for ${title}`,
        description: `# ${title}\n\nBuild amazing Web3 projects. Prize pool: $${randomInt(50000, 500000)}.`,
        type: randomChoice(['ONLINE', 'HYBRID', 'IN_PERSON']),
        status,
        tags: Array.from({ length: randomInt(3, 6) }, () => randomChoice(['Ethereum', 'Solana', 'DeFi', 'NFT', 'Web3', 'Blockchain', 'Crypto'])),
        prizePool: randomInt(50000, 500000),
        prizeToken: randomChoice(['USD', 'USDC', 'ETH', 'SOL']),
        eligibilityRequirements: 'Open to all developers 18+.',
        submissionGuidelines: 'Submit your project with code, demo, and documentation.',
        ressources: 'Check our developer resources page.',
        registrationStart,
        registrationEnd,
        startDate,
        endDate,
        judgingStart,
        judgingEnd,
        location: {
          country: randomChoice(countries),
          city: randomChoice(cities),
        },
      maxTeamSize: randomInt(3, 6),
      minTeamSize: 1,
      requiresApproval: Math.random() > 0.7,
      isPrivate: isPrivate,
      invitePasscode: invitePasscode,
      requiredSubmissionMaterials: randomChoice([
        ['VIDEO_DEMO', 'GITHUB_REPOSITORY'],
        ['VIDEO_DEMO', 'GITHUB_REPOSITORY', 'PITCH_DECK'],
        ['GITHUB_REPOSITORY'],
      ]),
    },
  });
    hackathons.push(hackathon);
    // Track the organization owner for this hackathon
    const orgOwnerId = orgToOwnerMap.get(org.id);
    if (orgOwnerId) {
      hackathonToOrgOwnerMap.set(hackathon.id, orgOwnerId);
    }
    
    if ((i + 1) % 10 === 0) {
      console.log(`   Created ${i + 1}/50 hackathons`);
    }
  }
  console.log(`✅ Created ${hackathons.length} hackathons\n`);

  // ============================================
  // 5. CREATE TRACKS (2-4 per hackathon)
  // ============================================
  console.log('🎯 Creating tracks...');
  let trackCount = 0;
  for (const hackathon of hackathons) {
    const trackCountForHackathon = randomInt(2, 4);
    const trackNames = ['Main Track', 'Innovation Track', 'Best Use Case', 'Community Choice'];
    
    for (let i = 0; i < trackCountForHackathon; i++) {
      await prisma.track.create({
        data: {
          hackathonId: hackathon.id,
          name: trackNames[i] || `Track ${i + 1}`,
          description: `Track ${i + 1} for ${hackathon.title}`,
          judgingCriteria: 'Innovation, Technical Implementation, User Experience, Viability',
          order: i + 1,
          winnersCount: randomInt(2, 4),
        },
      });
      trackCount++;
    }
  }
  console.log(`✅ Created ${trackCount} tracks\n`);

  // ============================================
  // 6. CREATE SPONSORS & BOUNTIES
  // ============================================
  console.log('💎 Creating sponsors and bounties...');
  let sponsorCount = 0;
  let bountyCount = 0;
  
  for (const hackathon of hackathons) {
    // Get the organization for this hackathon
    const hackathonOrg = organizations.find(o => o.id === hackathon.organizationId);
    if (!hackathonOrg) continue;
    
    // First sponsor is always the organization sponsor (isCurrentOrganization: true)
    const orgSponsor = await prisma.sponsor.create({
      data: {
        hackathonId: hackathon.id,
        name: hackathonOrg.name,
        logo: hackathonOrg.logo,
        isCurrentOrganization: true,
      },
    });
    sponsorCount++;
    
    // Create 1-2 bounties for organization sponsor
    const orgBountyCount = randomInt(1, 2);
    for (let j = 0; j < orgBountyCount; j++) {
      await prisma.bounty.create({
        data: {
          hackathonId: hackathon.id,
          sponsorId: orgSponsor.id,
          title: `${hackathonOrg.name} Main Bounty`,
          description: `Build innovative solutions with ${hackathonOrg.name} and win prizes!`,
          rewardAmount: randomInt(10000, 50000),
          rewardToken: 'USDC',
          maxWinners: randomInt(2, 5),
        },
      });
      bountyCount++;
    }
    
    // Then create additional external sponsors (isCurrentOrganization: false)
    const additionalSponsorCount = randomInt(1, 4);
    const sponsorNames = ['Chainlink', 'The Graph', 'Aave', 'Uniswap', 'Polygon', 'Arbitrum'];
    
    for (let i = 0; i < additionalSponsorCount; i++) {
      const sponsor = await prisma.sponsor.create({
        data: {
          hackathonId: hackathon.id,
          name: sponsorNames[i] || `Sponsor ${i + 1}`,
          logo: `https://placehold.co/150x150/${niceColors[(sponsorCount + i) % niceColors.length]}/FFFFFF?text=${sponsorNames[i]?.substring(0, 3) || 'SP'}`,
          isCurrentOrganization: false,
        },
      });
      sponsorCount++;
      
      // Create 1-2 bounties per external sponsor
      const bountyCountForSponsor = randomInt(1, 2);
      for (let j = 0; j < bountyCountForSponsor; j++) {
        await prisma.bounty.create({
          data: {
            hackathonId: hackathon.id,
            sponsorId: sponsor.id,
            title: `Best Use of ${sponsor.name}`,
            description: `Build with ${sponsor.name} and win prizes!`,
            rewardAmount: randomInt(5000, 50000),
            rewardToken: 'USDC',
            maxWinners: randomInt(2, 5),
          },
        });
        bountyCount++;
      }
    }
  }
  console.log(`✅ Created ${sponsorCount} sponsors and ${bountyCount} bounties\n`);

  // ============================================
  // 7. CREATE PRIZES
  // ============================================
  console.log('💰 Creating prizes...');
  let prizeCount = 0;
  
  const tracks = await prisma.track.findMany();
  for (const track of tracks) {
    const winnersCount = track.winnersCount || 3;
    for (let i = 1; i <= winnersCount; i++) {
      await prisma.prize.create({
        data: {
          hackathonId: track.hackathonId,
          trackId: track.id,
          type: 'TRACK',
          position: i,
          name: `${i === 1 ? 'First' : i === 2 ? 'Second' : i === 3 ? 'Third' : `${i}th`} Place`,
          amount: randomInt(5000, 50000),
          token: 'USDC',
        },
      });
      prizeCount++;
    }
  }
  
  const bounties = await prisma.bounty.findMany();
  for (const bounty of bounties) {
    const maxWinners = bounty.maxWinners || 3;
    for (let i = 1; i <= maxWinners; i++) {
      await prisma.prize.create({
        data: {
          hackathonId: bounty.hackathonId,
          bountyId: bounty.id,
          type: 'BOUNTY',
          position: i,
          name: `${i === 1 ? 'First' : i === 2 ? 'Second' : i === 3 ? 'Third' : `${i}th`} Place`,
          amount: randomInt(2000, 20000),
          token: 'USDC',
        },
      });
      prizeCount++;
    }
  }
  console.log(`✅ Created ${prizeCount} prizes\n`);

  // ============================================
  // 7.5. CREATE REGISTRATION QUESTIONS (for ~20% of hackathons)
  // ============================================
  console.log('❓ Creating registration questions...');
  let questionCount = 0;
  
  // Create questions for about 20% of hackathons (10 out of 50)
  const hackathonsWithQuestions = hackathons.slice(0, 10);
  const sampleQuestions = [
    {
      label: 'What is your experience level?',
      type: 'SELECT' as const,
      required: true,
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      order: 0,
    },
    {
      label: 'Which track interests you most?',
      type: 'SELECT' as const,
      required: true,
      options: ['DeFi', 'NFTs', 'Infrastructure', 'Gaming', 'DAO'],
      order: 1,
    },
    {
      label: 'Do you have a team?',
      type: 'SELECT' as const,
      required: false,
      options: ['Yes, complete team', 'Yes, looking for members', 'No, looking for team', 'Solo'],
      order: 2,
    },
    {
      label: 'Tell us about a project you\'re proud of',
      type: 'TEXTAREA' as const,
      required: false,
      placeholder: 'Describe a past project...',
      order: 3,
    },
    {
      label: 'How did you hear about this hackathon?',
      type: 'SELECT' as const,
      required: false,
      options: ['Twitter/X', 'Discord', 'Friend', 'Newsletter', 'Other'],
      order: 4,
    },
  ];
  
  // Map to store questions by hackathon ID: hackathonId -> questions[]
  const questionsByHackathon = new Map<string, Array<{ id: string; type: string; options?: string[]; required: boolean }>>();
  
  for (const hackathon of hackathonsWithQuestions) {
    const hackathonQuestions: Array<{ id: string; type: string; options?: string[]; required: boolean }> = [];
    
    for (const question of sampleQuestions) {
      const createdQuestion = await prisma.hackathonRegistrationQuestion.create({
        data: {
          hackathonId: hackathon.id,
          label: question.label,
          type: question.type,
          required: question.required,
          options: question.options || [],
          placeholder: question.placeholder,
          order: question.order,
        },
      });
      hackathonQuestions.push({
        id: createdQuestion.id,
        type: createdQuestion.type,
        options: createdQuestion.options,
        required: createdQuestion.required,
      });
      questionCount++;
    }
    
    questionsByHackathon.set(hackathon.id, hackathonQuestions);
  }
  console.log(`✅ Created ${questionCount} registration questions for ${hackathonsWithQuestions.length} hackathons\n`);

  // ============================================
  // 8. CREATE REGISTRATIONS (with answers for hackathons with questions)
  // ============================================
  console.log('📝 Creating registrations...');
  let registrationCount = 0;
  const registrationsWithAnswers: Array<{ registrationId: string; hackathonId: string }> = [];
  
  for (const hackathon of hackathons) {
    // Each hackathon gets 20-50 registrations
    const registrationCountForHackathon = randomInt(20, 50);
    // Exclude the organization owner from registering to their own hackathon
    const orgOwnerId = hackathonToOrgOwnerMap.get(hackathon.id);
    const eligibleUsers = users.filter(u => u.id !== orgOwnerId);
    const shuffledUsers = [...eligibleUsers].sort(() => Math.random() - 0.5);
    
    const hackathonQuestions = questionsByHackathon.get(hackathon.id);
    const hasQuestions = hackathonQuestions && hackathonQuestions.length > 0;
    
    for (let i = 0; i < Math.min(registrationCountForHackathon, shuffledUsers.length); i++) {
      // Prepare answers if this hackathon has questions
      const answersData = hasQuestions
        ? hackathonQuestions.map((q) => {
            let answerValue: string[];
            
            if (q.type === 'SELECT') {
              // Pick a random option from the question's options
              answerValue = [randomChoice(q.options || [])];
            } else if (q.type === 'TEXTAREA') {
              // Generate a random text answer
              const sampleTexts = [
                'Built a DeFi protocol that processed $1M+ in transactions.',
                'Created an NFT marketplace with advanced filtering.',
                'Developed a cross-chain bridge using LayerZero.',
                'Contributed to multiple open-source Web3 projects.',
                'Built a DAO governance tool with voting mechanisms.',
                'Created a yield farming aggregator.',
                'Developed a privacy-preserving identity solution.',
                'Built a gaming platform with NFT integration.',
              ];
              answerValue = [randomChoice(sampleTexts)];
            } else {
              // For other types, use a simple text answer
              answerValue = ['Sample answer'];
            }
            
            return {
              questionId: q.id,
              value: answerValue,
            };
          })
        : undefined;
      
      const registration = await prisma.hackathonRegistration.create({
        data: {
          hackathonId: hackathon.id,
          userId: shuffledUsers[i].id,
          status: 'APPROVED',
          ...(hasQuestions && answersData
            ? {
                answers: {
                  create: answersData,
                },
              }
            : {}),
        },
      });
      
      if (hasQuestions) {
        registrationsWithAnswers.push({
          registrationId: registration.id,
          hackathonId: hackathon.id,
        });
      }
      
      registrationCount++;
    }
  }
  console.log(`✅ Created ${registrationCount} registrations`);
  console.log(`   ${registrationsWithAnswers.length} registrations include answers to questions\n`);

  // ============================================
  // 9. CREATE TEAMS (200 teams)
  // ============================================
  console.log('👥 Creating teams (200)...');
  const teamMembersData: Array<{
    teamId: string;
    userId: string;
    isLeader: boolean;
    description: string;
  }> = [];
  
  // Distribute teams across hackathons
  const registrations = await prisma.hackathonRegistration.findMany({
    where: { status: 'APPROVED' },
  });
  
  // Group registrations by hackathon (excluding org owners from their own hackathons)
  const registrationsByHackathon = new Map<string, string[]>();
  for (const reg of registrations) {
    // Double-check: exclude org owners from their own hackathons
    const orgOwnerId = hackathonToOrgOwnerMap.get(reg.hackathonId);
    if (orgOwnerId && reg.userId === orgOwnerId) continue; // Skip if this is the org owner
    
    if (!registrationsByHackathon.has(reg.hackathonId)) {
      registrationsByHackathon.set(reg.hackathonId, []);
    }
    registrationsByHackathon.get(reg.hackathonId)!.push(reg.userId);
  }
  
  // Create first team to initialize array type
  let firstHackathonId = '';
  let firstUserIds: string[] = [];
  for (const [hackathonId, userIds] of registrationsByHackathon.entries()) {
    if (userIds.length >= 2) {
      firstHackathonId = hackathonId;
      firstUserIds = userIds;
      break;
    }
  }
  
  let teams: Awaited<ReturnType<typeof prisma.team.create>>[] = [];
  let teamCounter = 0;
  let usedUserIds = new Set<string>();
  
  // Create first team if we have a hackathon with enough registrations
  if (firstHackathonId && firstUserIds.length >= 2) {
    const firstTeam = await prisma.team.create({
      data: {
        hackathonId: firstHackathonId,
        name: `${randomChoice(teamNames)} 1`,
        tagline: `Building the future of ${randomChoice(['DeFi', 'NFTs', 'Web3', 'Blockchain'])}`,
      },
    });
    teams.push(firstTeam);
    
    // Add members to first team
    const firstTeamSize = Math.min(randomInt(2, 4), firstUserIds.length);
    for (let j = 0; j < firstTeamSize; j++) {
      teamMembersData.push({
        teamId: firstTeam.id,
        userId: firstUserIds[j],
        isLeader: j === 0,
        description: j === 0 ? 'Team Lead' : randomChoice(['Developer', 'Designer', 'Product Manager', 'Researcher']),
      });
      usedUserIds.add(firstUserIds[j]);
    }
    
    teamCounter = 1;
  }
  
  // Create teams across all hackathons
  for (const [hackathonId, userIds] of registrationsByHackathon.entries()) {
    if (teamCounter >= 200) break;
    
    // Filter out users already used in teams for this hackathon (allow some overlap)
    const availableUserIds = userIds.filter(id => !usedUserIds.has(id));
    if (availableUserIds.length < 2) continue;
    
    // Create 2-5 teams per hackathon, but ensure we have enough users
    const maxTeamsForHackathon = Math.min(randomInt(2, 5), Math.floor(availableUserIds.length / 2));
    const shuffledUserIds = [...availableUserIds].sort(() => Math.random() - 0.5);
    
    let userIndex = 0;
    for (let i = 0; i < maxTeamsForHackathon && teamCounter < 200 && userIndex < shuffledUserIds.length - 1; i++) {
      const teamName = `${randomChoice(teamNames)} ${teamCounter + 1}`;
      const team = await prisma.team.create({
        data: {
          hackathonId,
          name: teamName,
          tagline: `Building the future of ${randomChoice(['DeFi', 'NFTs', 'Web3', 'Blockchain'])}`,
        },
      });
      teams.push(team);
      
      // Add 2-4 members per team
      const teamSize = Math.min(randomInt(2, 4), shuffledUserIds.length - userIndex);
      const teamUserIds = shuffledUserIds.slice(userIndex, userIndex + teamSize);
      
      for (let j = 0; j < teamUserIds.length; j++) {
        teamMembersData.push({
          teamId: team.id,
          userId: teamUserIds[j],
          isLeader: j === 0,
          description: j === 0 ? 'Team Lead' : randomChoice(['Developer', 'Designer', 'Product Manager', 'Researcher']),
        });
        usedUserIds.add(teamUserIds[j]);
      }
      
      userIndex += teamSize;
      teamCounter++;
    }
  }
  
  // Create remaining teams if needed (allow user overlap)
  let attempts = 0;
  while (teamCounter < 200 && attempts < 500) {
    attempts++;
    const hackathon = randomChoice(hackathons);
    const hackathonRegistrations = registrations.filter(r => r.hackathonId === hackathon.id);
    if (hackathonRegistrations.length < 2) continue;
    
    const teamName = `${randomChoice(teamNames)} ${teamCounter + 1}`;
    const team = await prisma.team.create({
      data: {
        hackathonId: hackathon.id,
        name: teamName,
        tagline: `Building the future of ${randomChoice(['DeFi', 'NFTs', 'Web3', 'Blockchain'])}`,
      },
    });
    teams.push(team);
    
      const teamSize = randomInt(2, 4);
      // Exclude org owner from teams in their own hackathons
      const orgOwnerId = hackathonToOrgOwnerMap.get(hackathon.id);
      const eligibleRegs = hackathonRegistrations.filter(r => r.userId !== orgOwnerId);
      const shuffledRegs = [...eligibleRegs].sort(() => Math.random() - 0.5);
      for (let j = 0; j < Math.min(teamSize, shuffledRegs.length); j++) {
        teamMembersData.push({
          teamId: team.id,
          userId: shuffledRegs[j].userId,
          isLeader: j === 0,
          description: j === 0 ? 'Team Lead' : randomChoice(['Developer', 'Designer', 'Product Manager']),
        });
      }
    
    teamCounter++;
  }
  
  console.log(`✅ Created ${teams.length} teams\n`);

  // ============================================
  // 10. CREATE TEAM MEMBERS
  // ============================================
  console.log('🤝 Adding team members...');
  // Batch create team members
  const batchSize = 100;
  for (let i = 0; i < teamMembersData.length; i += batchSize) {
    const batch = teamMembersData.slice(i, i + batchSize);
    await prisma.teamMember.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
  console.log(`✅ Added ${teamMembersData.length} team members\n`);

  // ============================================
  // 11. CREATE SUBMISSIONS (150-200 submissions)
  // ============================================
  console.log('📦 Creating submissions (150-200)...');
  let submissionCount = 0;
  const targetSubmissions = randomInt(150, 200);
  
  const tracksWithHackathons = await prisma.track.findMany({
    include: { hackathon: true },
  });
  
  for (const team of teams) {
    if (submissionCount >= targetSubmissions) break;
    
    // 70-80% of teams have submissions
    if (Math.random() > 0.25) {
      const hackathonTracks = tracksWithHackathons.filter(t => t.hackathonId === team.hackathonId);
      if (hackathonTracks.length === 0) continue;
      
      const track = randomChoice(hackathonTracks);
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: team.id },
      });
      if (teamMembers.length === 0) continue;
      
      const creator = randomChoice(teamMembers);
      const projectTitle = `${randomChoice(projectTitles)} ${submissionCount + 1}`;
      
      await prisma.submission.create({
        data: {
          hackathonId: team.hackathonId,
          teamId: team.id,
          creatorId: creator.userId,
          trackId: track.id,
          title: projectTitle,
          tagline: `Revolutionary ${randomChoice(['DeFi', 'NFT', 'Web3', 'Blockchain'])} solution`,
          description: `# ${projectTitle}\n\n${randomChoice(['A cutting-edge', 'An innovative', 'A revolutionary'])} ${randomChoice(['DeFi', 'NFT', 'Web3', 'blockchain'])} project.`,
          status: randomChoice(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW']),
          demoUrl: `https://demo.example.com/${team.id}`,
          repoUrl: `https://github.com/team/${team.id}`,
          technologies: Array.from({ length: randomInt(3, 6) }, () => randomChoice(technologies)),
        },
      });
      submissionCount++;
    }
  }
  console.log(`✅ Created ${submissionCount} submissions\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═'.repeat(60));
  console.log('🎉 MAX Database seeded successfully!');
  console.log('═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   • Users: ${users.length}`);
  console.log(`   • Categories: ${categoryRecords.length}`);
  console.log(`   • Organizations: ${organizations.length}`);
  console.log(`   • Hackathons: ${hackathons.length}`);
  console.log(`   • Tracks: ${trackCount}`);
  console.log(`   • Sponsors: ${sponsorCount}`);
  console.log(`   • Bounties: ${bountyCount}`);
  console.log(`   • Prizes: ${prizeCount}`);
  console.log(`   • Registrations: ${registrationCount}`);
  console.log(`   • Teams: ${teams.length}`);
  console.log(`   • Team Members: ${teamMembersData.length}`);
  console.log(`   • Submissions: ${submissionCount}`);
  console.log('\n🔐 Test Credentials (all use Password123!):');
  console.log(`   Admin: admin@4hacks.io`);
  console.log(`   Organization Owners:`);
  for (const orgOwner of orgOwners) {
    const orgNameShort = orgOwner.orgName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    console.log(`     - org_owner_${orgNameShort}@4hacks.io (${orgOwner.orgName})`);
  }
  console.log(`   Regular Users: user1@example.com through user${totalRegularUsers}@example.com`);
  console.log('\n📌 Note: Organization owners do NOT register, create teams, or submit to their own hackathons (logically correct!)');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Create a pg Pool and Prisma adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.announcement.deleteMany();
  await prisma.hackathonQuestionReply.deleteMany();
  await prisma.hackathonQuestionThread.deleteMany();
  await prisma.hackathonRegistrationAnswer.deleteMany();
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
  // 1. CREATE USERS
  // ============================================
  console.log('👤 Creating users...');

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

  // Web3 Developers
  const hacker1 = await prisma.users.create({
    data: {
      email: 'vitalik@example.com',
      username: 'vitalik_eth',
      password: hashedPassword,
      name: 'Vitalik B.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'Smart Contract Developer',
      bio: 'Building the decentralized future. Solidity enthusiast.',
      location: 'Singapore',
      skills: ['Solidity', 'Ethereum', 'EVM', 'Foundry', 'Hardhat'],
      github: 'https://github.com/vitalikb',
      twitter: 'https://twitter.com/vitalikb',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f8c4A1',
    },
  });

  const hacker2 = await prisma.users.create({
    data: {
      email: 'satoshi@example.com',
      username: 'satoshi_dev',
      password: hashedPassword,
      name: 'Satoshi N.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'Blockchain Engineer',
      bio: 'Full stack Web3 developer. Building DeFi protocols.',
      location: 'Tokyo, Japan',
      skills: ['Rust', 'Solana', 'Anchor', 'TypeScript', 'React'],
      github: 'https://github.com/satoshin',
      linkedin: 'https://linkedin.com/in/satoshin',
      walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBa72',
    },
  });

  const hacker3 = await prisma.users.create({
    data: {
      email: 'ada@example.com',
      username: 'ada_zk',
      password: hashedPassword,
      name: 'Ada L.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'ZK Researcher',
      bio: 'Zero-knowledge proof researcher. Privacy advocate.',
      location: 'Berlin, Germany',
      skills: ['Circom', 'ZK-SNARKs', 'Noir', 'Rust', 'Cryptography'],
      github: 'https://github.com/adazk',
      twitter: 'https://twitter.com/adazk',
    },
  });

  const hacker4 = await prisma.users.create({
    data: {
      email: 'charlie@example.com',
      username: 'charlie_defi',
      password: hashedPassword,
      name: 'Charlie W.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'DeFi Developer',
      bio: 'Building the future of finance. AMM and lending protocol specialist.',
      location: 'New York, NY',
      skills: ['Solidity', 'Vyper', 'DeFi', 'MEV', 'Flash Loans'],
      github: 'https://github.com/charliedefi',
      telegram: 'https://t.me/charliedefi',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
  });

  const hacker5 = await prisma.users.create({
    data: {
      email: 'diana@example.com',
      username: 'diana_nft',
      password: hashedPassword,
      name: 'Diana P.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'NFT/Gaming Developer',
      bio: 'Creating digital experiences on-chain. Game dev turned Web3.',
      location: 'Los Angeles, CA',
      skills: ['Unity', 'Solidity', 'ERC721', 'ERC1155', 'IPFS'],
      github: 'https://github.com/diananft',
      twitter: 'https://twitter.com/diananft',
    },
  });

  const hacker6 = await prisma.users.create({
    data: {
      email: 'ethan@example.com',
      username: 'ethan_infra',
      password: hashedPassword,
      name: 'Ethan R.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'Infrastructure Engineer',
      bio: 'Building scalable blockchain infrastructure. Node operator.',
      location: 'Austin, TX',
      skills: ['Go', 'Kubernetes', 'AWS', 'Tendermint', 'Cosmos SDK'],
      github: 'https://github.com/ethaninfra',
      linkedin: 'https://linkedin.com/in/ethaninfra',
    },
  });

  // Organization owner (non-admin user who can create hackathons)
  const orgOwner = await prisma.users.create({
    data: {
      email: 'founder@solanalabs.io',
      username: 'solana_founder',
      password: hashedPassword,
      name: 'Raj G.',
      role: 'USER',
      isEmailVerified: true,
      providers: ['CREDENTIAL'],
      profession: 'Protocol Founder',
      bio: 'Building high-performance blockchains.',
      location: 'San Francisco, CA',
      skills: ['Rust', 'Systems Programming', 'Distributed Systems'],
      github: 'https://github.com/rajg',
      twitter: 'https://twitter.com/rajg',
    },
  });

  console.log(`✅ Created 8 users\n`);

  // ============================================
  // 2. CREATE HACKATHON CATEGORIES
  // ============================================
  console.log('📁 Creating hackathon categories...');

  const categoryDeFi = await prisma.hackathonCategory.create({
    data: {
      name: 'DEFI',
      description: 'Decentralized Finance - DEXs, lending, derivatives, and financial primitives',
    },
  });

  const categoryNFT = await prisma.hackathonCategory.create({
    data: {
      name: 'NFT & GAMING',
      description: 'Non-Fungible Tokens, GameFi, metaverse, and digital collectibles',
    },
  });

  const categoryInfra = await prisma.hackathonCategory.create({
    data: {
      name: 'INFRASTRUCTURE',
      description: 'Developer tools, SDKs, oracles, bridges, and blockchain infrastructure',
    },
  });

  const categoryZK = await prisma.hackathonCategory.create({
    data: {
      name: 'ZK & PRIVACY',
      description: 'Zero-knowledge proofs, privacy-preserving applications, and cryptography',
    },
  });

  const categoryDAO = await prisma.hackathonCategory.create({
    data: {
      name: 'DAO & GOVERNANCE',
      description: 'Decentralized autonomous organizations, voting, and governance tools',
    },
  });

  const categoryAI = await prisma.hackathonCategory.create({
    data: {
      name: 'AI X WEB3',
      description: 'Intersection of AI and blockchain - on-chain AI, decentralized ML',
    },
  });

  const categoryOpen = await prisma.hackathonCategory.create({
    data: {
      name: 'OPEN TRACK',
      description: 'Open-ended hackathons for any Web3 innovation',
    },
  });

  console.log(`✅ Created 7 categories\n`);

  // ============================================
  // 3. CREATE ORGANIZATIONS
  // ============================================
  console.log('🏢 Creating organizations...');

  const ethFoundation = await prisma.organization.create({
    data: {
      name: 'Ethereum Foundation',
      slug: 'ethereum-foundation',
      displayName: 'ETH Foundation',
      logo: 'https://placehold.co/200x200/627EEA/FFFFFF?text=ETH',
      tagline: 'Building the decentralized future',
      description: 'The Ethereum Foundation is a non-profit organization dedicated to supporting Ethereum and related technologies.',
      type: 'BLOCKCHAIN_FOUNDATION',
      establishedYear: 2014,
      size: 'FIFTY_ONE_TO_TWO_HUNDRED',
      operatingRegions: ['GLOBAL'],
      email: 'hackathons@ethereum.org',
      phone: '+1-555-0001',
      country: 'Switzerland',
      city: 'Zug',
      website: 'https://ethereum.org',
      linkedin: 'https://linkedin.com/company/ethereum-foundation',
      github: 'https://github.com/ethereum',
      twitter: 'https://twitter.com/ethereum',
      discord: 'https://discord.gg/ethereum',
      ownerId: adminUser.id,
    },
  });

  const solanaLabs = await prisma.organization.create({
    data: {
      name: 'Solana Labs',
      slug: 'solana-labs',
      displayName: 'Solana',
      logo: 'https://placehold.co/200x200/14F195/000000?text=SOL',
      tagline: 'Build for scale. Build for speed.',
      description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps.',
      type: 'STARTUP',
      establishedYear: 2017,
      size: 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
      operatingRegions: ['NORTH_AMERICA', 'EUROPE', 'ASIA', 'GLOBAL'],
      email: 'hackathons@solana.com',
      phone: '+1-555-0002',
      country: 'United States',
      city: 'San Francisco',
      state: 'California',
      website: 'https://solana.com',
      linkedin: 'https://linkedin.com/company/solana-labs',
      github: 'https://github.com/solana-labs',
      twitter: 'https://twitter.com/solana',
      discord: 'https://discord.gg/solana',
      ownerId: orgOwner.id,
    },
  });

  const polygonDAO = await prisma.organization.create({
    data: {
      name: 'Polygon DAO',
      slug: 'polygon-dao',
      displayName: 'Polygon',
      logo: 'https://placehold.co/200x200/8247E5/FFFFFF?text=POLY',
      tagline: "Ethereum's Internet of Blockchains",
      description: 'Polygon is a decentralized Ethereum scaling platform enabling developers to build scalable dApps.',
      type: 'DAO',
      establishedYear: 2017,
      size: 'COMMUNITY_DRIVEN',
      operatingRegions: ['GLOBAL'],
      email: 'builders@polygon.technology',
      phone: '+1-555-0003',
      country: 'Global',
      city: 'Decentralized',
      website: 'https://polygon.technology',
      linkedin: 'https://linkedin.com/company/polygon-technology',
      github: 'https://github.com/maticnetwork',
      twitter: 'https://twitter.com/0xPolygon',
      ownerId: adminUser.id,
    },
  });

  console.log(`✅ Created 3 organizations\n`);

  // ============================================
  // 4. CREATE HACKATHONS (ACTIVE)
  // ============================================
  console.log('🏆 Creating hackathons...');

  // Hackathon 1: ETH Global Style (ACTIVE)
  const ethHackathon = await prisma.hackathon.create({
    data: {
      title: 'ETH Global Brussels 2025',
      slug: 'eth-global-brussels-2025',
      organizationId: ethFoundation.id,
      categoryId: categoryOpen.id,
      banner: 'https://placehold.co/1200x400/627EEA/FFFFFF?text=ETH+Global+Brussels+2025',
      tagline: 'The largest Ethereum hackathon in Europe',
      description: `# ETH Global Brussels 2025

Welcome to ETH Global Brussels! Join 1000+ hackers for an unforgettable weekend of building on Ethereum.

## 🎯 What to Expect
- **36-hour hacking** with top builders from around the world
- **$500,000+ in prizes** across multiple tracks and sponsor bounties
- **Workshops & talks** from Ethereum core developers
- **Networking** with VCs, founders, and protocol teams

## 🛠 Tracks
- DeFi Innovation
- Public Goods
- Account Abstraction
- L2 & Scaling
- Best Use of Sponsor Technologies

## 📍 Venue
Brussels Expo, Belgium
March 15-17, 2025

BUIDL the future with us! 🚀`,
      type: 'HYBRID',
      status: 'ACTIVE',
      tags: ['Ethereum', 'EVM', 'DeFi', 'Public Goods', 'L2', 'Account Abstraction'],
      prizePool: 500000,
      prizeToken: 'USD',
      eligibilityRequirements: 'Open to all developers 18+. In-person attendance requires registration.',
      submissionGuidelines: `## Submission Requirements
1. Working prototype deployed on testnet or mainnet
2. GitHub repository with open-source code
3. 3-minute video demo
4. Project writeup explaining the problem and solution`,
      ressources: `## Developer Resources
- [Ethereum Docs](https://ethereum.org/developers)
- [Hardhat](https://hardhat.org)
- [Foundry](https://book.getfoundry.sh)
- [wagmi](https://wagmi.sh)`,
      registrationStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
      judgingStart: new Date(now.getTime() + 47 * 24 * 60 * 60 * 1000),
      judgingEnd: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
      location: { country: 'Belgium', city: 'Brussels', address: 'Brussels Expo' },
      maxTeamSize: 5,
      minTeamSize: 1,
      requiresApproval: true, // Requires approval to test registration flow
      isPrivate: false,
      requiredSubmissionMaterials: ['VIDEO_DEMO', 'GITHUB_REPOSITORY', 'PITCH_DECK'],
      // Custom registration questions for testing
      registrationQuestions: [
        {
          id: 'q1',
          label: 'What is your experience level with Ethereum development?',
          type: 'select',
          required: true,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
        {
          id: 'q2',
          label: 'Which track are you most interested in?',
          type: 'select',
          required: true,
          options: ['DeFi Innovation', 'Public Goods', 'Account Abstraction', 'L2 & Scaling'],
        },
        {
          id: 'q3',
          label: 'Do you have a team already?',
          type: 'select',
          required: true,
          options: ['Yes, complete team', 'Yes, looking for more members', 'No, looking for a team', 'Solo participant'],
        },
        {
          id: 'q4',
          label: 'Tell us about a project you are proud of',
          type: 'textarea',
          required: false,
          placeholder: 'Describe a past project...',
        },
        {
          id: 'q5',
          label: 'How did you hear about this hackathon?',
          type: 'select',
          required: false,
          options: ['Twitter/X', 'Discord', 'Friend referral', 'Newsletter', 'Other'],
        },
      ],
    },
  });

  // Hackathon 2: Solana Hackathon (ACTIVE)
  const solanaHackathon = await prisma.hackathon.create({
    data: {
      title: 'Solana Speedrun 2025',
      slug: 'solana-speedrun-2025',
      organizationId: solanaLabs.id,
      categoryId: categoryInfra.id,
      banner: 'https://placehold.co/1200x400/14F195/000000?text=Solana+Speedrun+2025',
      tagline: 'Build fast. Ship faster.',
      description: `# Solana Speedrun 2025

The ultimate Solana hackathon is back! Build the next generation of high-performance dApps.

## 💰 Prize Pool: $300,000

## 🏆 Tracks
- **Infrastructure** - Tools, SDKs, developer experience
- **DeFi** - Trading, lending, derivatives
- **Consumer** - Social, gaming, payments
- **DePIN** - Decentralized physical infrastructure

## ⚡ Why Solana?
- 400ms block times
- $0.00025 average transaction fee
- 65,000 TPS capacity

Build something amazing in 3 weeks!`,
      type: 'ONLINE',
      status: 'ACTIVE',
      tags: ['Solana', 'Rust', 'Anchor', 'DeFi', 'DePIN', 'High Performance'],
      prizePool: 300000,
      prizeToken: 'USDC',
      eligibilityRequirements: 'Open to all developers worldwide.',
      submissionGuidelines: `## How to Submit
1. Deploy on Solana devnet or mainnet
2. Open source your code
3. Create a demo video (max 5 minutes)
4. Write documentation`,
      ressources: `## Resources
- [Solana Cookbook](https://solanacookbook.com)
- [Anchor Framework](https://anchor-lang.com)
- [Solana Playground](https://beta.solpg.io)`,
      registrationStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      judgingStart: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
      judgingEnd: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000),
      maxTeamSize: 4,
      minTeamSize: 1,
      requiresApproval: false,
      isPrivate: false,
      requiredSubmissionMaterials: ['VIDEO_DEMO', 'GITHUB_REPOSITORY'],
    },
  });

  // Hackathon 3: ZK Hackathon (ACTIVE)
  const zkHackathon = await prisma.hackathon.create({
    data: {
      title: 'ZK Proof Summer 2025',
      slug: 'zk-proof-summer-2025',
      organizationId: polygonDAO.id,
      categoryId: categoryZK.id,
      tagline: 'Prove it without revealing it',
      description: `# ZK Proof Summer 2025

Dive deep into zero-knowledge proofs and build privacy-preserving applications.

## 🔐 What We're Looking For
- ZK identity solutions
- Private voting systems
- ZK rollup innovations
- Cross-chain ZK bridges

## 🎓 Learning Track
New to ZK? Join our learning track with workshops on:
- ZK fundamentals
- Circom & snarkjs
- Noir programming
- PLONK & Groth16

$150,000 in prizes for builders pushing the boundaries of privacy!`,
      type: 'ONLINE',
      status: 'ACTIVE',
      tags: ['ZK', 'Zero Knowledge', 'Privacy', 'Circom', 'Noir', 'SNARK'],
      prizePool: 150000,
      prizeToken: 'USDC',
      eligibilityRequirements: 'Open to all. Beginners welcome!',
      submissionGuidelines: `## Submission
1. Working ZK circuit or application
2. Documentation explaining the ZK system
3. Video walkthrough
4. Security considerations document`,
      ressources: `## ZK Resources
- [ZK Book](https://www.rareskills.io/zk-book)
- [Circom](https://docs.circom.io)
- [Noir](https://noir-lang.org)
- [PSE Resources](https://pse.dev)`,
      registrationStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
      maxTeamSize: 3,
      minTeamSize: 1,
      requiresApproval: false,
      isPrivate: false,
      requiredSubmissionMaterials: ['VIDEO_DEMO', 'GITHUB_REPOSITORY', 'TESTING_INSTRUCTIONS'],
    },
  });

  console.log(`✅ Created 3 active hackathons\n`);

  // ============================================
  // 5. CREATE HACKATHON CREATION REQUESTS
  // ============================================
  console.log('📋 Creating hackathon requests...');

  // Pending request 1
  await prisma.hackathonCreationRequest.create({
    data: {
      hackTitle: 'DeFi Summer Hackathon',
      hackSlug: 'defi-summer-hackathon-2025',
      status: 'PENDING',
      organizationId: solanaLabs.id,
      hackType: 'ONLINE',
      hackCategoryId: categoryDeFi.id,
      focus: 'Building next-generation DeFi protocols - AMMs, lending, derivatives',
      audience: 'Experienced Solidity/Rust developers interested in DeFi',
      expectedAttendees: 500,
      geographicScope: 'GLOBAL',
      registrationStart: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 95 * 24 * 60 * 60 * 1000),
      prizePool: 200000,
      prizeToken: 'USDC',
      expectedTotalWinners: 20,
      distributionPlan: '1st: $50k, 2nd: $30k, 3rd: $20k, + bounties',
      fundingSources: ['SPONSORS', 'SELF_FUNDED'],
      confirmedSponsors: ['Chainlink', 'Aave', 'Uniswap'],
      needSponsorsHelp: false,
      venueSecured: 'NOT_APPLICABLE',
      needVenueHelp: 'NOT_APPLICABLE',
      technicalSupport: true,
      liveStreaming: 'YES',
      marketingHelp: true,
      marketingHelpDetails: ['SOCIAL_MEDIA_PROMOTION', 'COMMUNITY_OUTREACH'],
      existingCommunity: true,
      estimatedReach: 'BETWEEN_5K_AND_50K',
      targetRegistrationGoal: 500,
      needWorkshopsHelp: true,
      workshopsHelpDetails: 'Need workshops on advanced DeFi concepts',
      needTechnicalMentors: true,
      technicalMentorCount: 10,
      needEducationalContent: false,
      needSpeakers: true,
      needJudges: true,
      judgesCount: 5,
      judgesProfiles: ['DeFi protocol founders', 'VCs', 'Security auditors'],
      needJudgingCriteria: false,
      needEvaluationSystem: true,
      needEventLogistics: false,
      needVolunteerCoordinators: false,
      needCommunitySetup: false,
      needOnCallSupport: true,
    },
  });

  // Pending request 2
  await prisma.hackathonCreationRequest.create({
    data: {
      hackTitle: 'NFT Gaming Jam',
      hackSlug: 'nft-gaming-jam-2025',
      status: 'PENDING',
      organizationId: polygonDAO.id,
      hackType: 'HYBRID',
      hackCategoryId: categoryNFT.id,
      focus: 'Building on-chain games and NFT experiences',
      audience: 'Game developers, artists, and Web3 builders',
      expectedAttendees: 300,
      geographicScope: 'REGIONAL',
      hackCountry: 'United States',
      hackCity: 'Los Angeles',
      hackState: 'California',
      registrationStart: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 57 * 24 * 60 * 60 * 1000),
      prizePool: 100000,
      prizeToken: 'MATIC',
      expectedTotalWinners: 15,
      distributionPlan: 'Main prizes + category prizes for art, gameplay, innovation',
      fundingSources: ['SPONSORS'],
      confirmedSponsors: ['OpenSea', 'Immutable'],
      needSponsorsHelp: true,
      sponsorLevel: 'BETWEEN_25K_AND_100K',
      venueSecured: 'NO',
      needVenueHelp: 'YES',
      technicalSupport: true,
      liveStreaming: 'YES',
      marketingHelp: true,
      marketingHelpDetails: ['INFLUENCER_PARTNERSHIPS', 'CONTENT_CREATION'],
      existingCommunity: true,
      estimatedReach: 'BETWEEN_500_AND_5K',
      targetRegistrationGoal: 300,
      needWorkshopsHelp: true,
      workshopsHelpDetails: 'Unity/Unreal integration with Web3',
      needTechnicalMentors: true,
      technicalMentorCount: 8,
      needEducationalContent: true,
      needSpeakers: true,
      needJudges: true,
      judgesCount: 7,
      judgesProfiles: ['Game studio founders', 'NFT artists', 'Web3 gaming VCs'],
      needJudgingCriteria: true,
      needEvaluationSystem: true,
      needEventLogistics: true,
      eventLogisticsDetails: ['REGISTRATION_MANAGEMENT', 'FOOD_CATERING_COORDINATION', 'SWAG_MERCHANDISE'],
      needVolunteerCoordinators: true,
      needCommunitySetup: true,
      needOnCallSupport: true,
    },
  });

  // Rejected request
  await prisma.hackathonCreationRequest.create({
    data: {
      hackTitle: 'Memecoin Madness',
      hackSlug: 'memecoin-madness-2025',
      status: 'REJECTED',
      organizationId: solanaLabs.id,
      hackType: 'ONLINE',
      hackCategoryId: categoryOpen.id,
      focus: 'Building the next viral memecoin',
      audience: 'Degen traders and memecoin enthusiasts',
      expectedAttendees: 1000,
      geographicScope: 'GLOBAL',
      registrationStart: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
      prizePool: 50000,
      prizeToken: 'USD',
      expectedTotalWinners: 5,
      distributionPlan: 'Winner takes most',
      fundingSources: ['SELF_FUNDED'],
      needSponsorsHelp: true,
      sponsorLevel: 'UNDER_5K',
      venueSecured: 'NOT_APPLICABLE',
      needVenueHelp: 'NOT_APPLICABLE',
      technicalSupport: false,
      liveStreaming: 'NO',
      marketingHelp: true,
      marketingHelpDetails: ['SOCIAL_MEDIA_PROMOTION'],
      existingCommunity: false,
      estimatedReach: 'UNDER_500',
      targetRegistrationGoal: 1000,
      needWorkshopsHelp: false,
      needTechnicalMentors: false,
      needEducationalContent: false,
      needSpeakers: false,
      needJudges: false,
      needJudgingCriteria: false,
      needEvaluationSystem: false,
      needEventLogistics: false,
      needVolunteerCoordinators: false,
      needCommunitySetup: false,
      needOnCallSupport: false,
      rejectedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      rejectedById: adminUser.id,
      rejectedReason: 'Does not align with platform values. We focus on sustainable innovation, not speculative tokens.',
    },
  });

  console.log(`✅ Created 3 hackathon requests (2 pending, 1 rejected)\n`);

  // ============================================
  // 6. CREATE TRACKS
  // ============================================
  console.log('🎯 Creating tracks...');

  // ETH Hackathon tracks
  const ethTrack1 = await prisma.track.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'DeFi Innovation',
      description: 'Build novel DeFi primitives - new AMM designs, lending protocols, derivatives, or yield strategies.',
      judgingCriteria: `## Judging Criteria
- **Innovation (35%)**: Novel approach to DeFi
- **Technical Implementation (30%)**: Smart contract quality and security
- **User Experience (20%)**: Ease of use and design
- **Viability (15%)**: Market fit and sustainability`,
      order: 1,
      winnersCount: 3,
    },
  });

  const ethTrack2 = await prisma.track.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'Public Goods',
      description: 'Tools and infrastructure that benefit the entire Ethereum ecosystem.',
      judgingCriteria: `## Judging Criteria
- **Impact (40%)**: Benefit to the ecosystem
- **Technical Quality (30%)**: Implementation excellence
- **Sustainability (20%)**: Long-term viability
- **Accessibility (10%)**: Ease of adoption`,
      order: 2,
      winnersCount: 3,
    },
  });

  const ethTrack3 = await prisma.track.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'Account Abstraction',
      description: 'Leverage ERC-4337 to build better wallet experiences and user onboarding.',
      judgingCriteria: `## Judging Criteria
- **UX Improvement (40%)**: How much easier is Web3?
- **Technical Innovation (30%)**: Creative use of AA
- **Security (20%)**: Safe implementation
- **Completeness (10%)**: Working demo`,
      order: 3,
      winnersCount: 2,
    },
  });

  // Solana Hackathon tracks
  const solTrack1 = await prisma.track.create({
    data: {
      hackathonId: solanaHackathon.id,
      name: 'Infrastructure',
      description: 'Developer tools, SDKs, RPCs, indexers, and infrastructure improvements for Solana.',
      judgingCriteria: `## Judging Criteria
- **Developer Impact (35%)**: How useful for builders?
- **Technical Excellence (35%)**: Code quality and performance
- **Documentation (15%)**: Clear and comprehensive docs
- **Innovation (15%)**: Novel approach`,
      order: 1,
      winnersCount: 3,
    },
  });

  const solTrack2 = await prisma.track.create({
    data: {
      hackathonId: solanaHackathon.id,
      name: 'Consumer Apps',
      description: 'Social, gaming, payments, and consumer-facing applications on Solana.',
      judgingCriteria: `## Judging Criteria
- **User Experience (40%)**: Is it delightful to use?
- **Technical Implementation (25%)**: Proper use of Solana
- **Market Potential (20%)**: Could this go mainstream?
- **Creativity (15%)**: Unique approach`,
      order: 2,
      winnersCount: 3,
    },
  });

  // ZK Hackathon tracks
  const zkTrack1 = await prisma.track.create({
    data: {
      hackathonId: zkHackathon.id,
      name: 'ZK Identity',
      description: 'Privacy-preserving identity solutions using zero-knowledge proofs.',
      judgingCriteria: `## Judging Criteria
- **Privacy Guarantees (35%)**: What is proven/hidden?
- **Technical Soundness (35%)**: Correct ZK implementation
- **Practicality (20%)**: Real-world applicability
- **UX (10%)**: User experience`,
      order: 1,
      winnersCount: 2,
    },
  });

  const zkTrack2 = await prisma.track.create({
    data: {
      hackathonId: zkHackathon.id,
      name: 'ZK Applications',
      description: 'Any application leveraging ZK proofs - gaming, voting, compliance, etc.',
      judgingCriteria: `## Judging Criteria
- **Innovation (30%)**: Creative use of ZK
- **Technical Quality (30%)**: Circuit efficiency and correctness
- **Use Case (25%)**: Solves a real problem
- **Documentation (15%)**: Clear explanation`,
      order: 2,
      winnersCount: 3,
    },
  });

  console.log(`✅ Created 7 tracks\n`);

  // ============================================
  // 7. CREATE SPONSORS & BOUNTIES
  // ============================================
  console.log('💎 Creating sponsors and bounties...');

  // Sponsors for ETH hackathon
  const chainlinkSponsor = await prisma.sponsor.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'Chainlink',
      logo: 'https://placehold.co/150x150/375BD2/FFFFFF?text=LINK',
    },
  });

  const thegraphSponsor = await prisma.sponsor.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'The Graph',
      logo: 'https://placehold.co/150x150/6F4CFF/FFFFFF?text=GRT',
    },
  });

  const aaveSponsor = await prisma.sponsor.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'Aave',
      logo: 'https://placehold.co/150x150/B6509E/FFFFFF?text=AAVE',
      isCurrentOrganization: false,
    },
  });

  // Bounties
  const chainlinkBounty = await prisma.bounty.create({
    data: {
      hackathonId: ethHackathon.id,
      sponsorId: chainlinkSponsor.id,
      title: 'Best Use of Chainlink',
      description: `## Chainlink Bounty - $20,000

Build an application that leverages Chainlink services:
- **Price Feeds** - Access real-world market data
- **VRF** - Verifiable random number generation
- **Automation** - Smart contract automation
- **CCIP** - Cross-chain interoperability

### Requirements
- Must use at least one Chainlink service
- Deployed on testnet with working demo
- Open source code

### Prizes
- 1st Place: $10,000
- 2nd Place: $6,000
- 3rd Place: $4,000`,
      rewardAmount: 20000,
      rewardToken: 'USDC',
      maxWinners: 3,
    },
  });

  await prisma.bounty.create({
    data: {
      hackathonId: ethHackathon.id,
      sponsorId: thegraphSponsor.id,
      title: 'Best Use of The Graph',
      description: `## The Graph Bounty - $15,000

Build a dApp powered by The Graph's indexing protocol.

### Ideas
- Analytics dashboard for DeFi protocols
- NFT marketplace with advanced search
- DAO governance explorer
- Cross-chain data aggregation

### Prizes
- 1st Place: $8,000
- 2nd Place: $5,000
- 3rd Place: $2,000`,
      rewardAmount: 15000,
      rewardToken: 'USDC',
      maxWinners: 3,
    },
  });

  await prisma.bounty.create({
    data: {
      hackathonId: ethHackathon.id,
      sponsorId: aaveSponsor.id,
      title: 'Aave Integration Challenge',
      description: `## Aave Integration - $25,000

Build innovative applications on top of Aave V3.

### Track 1: New Use Cases ($15k)
Novel applications of Aave lending/borrowing

### Track 2: UX Improvements ($10k)
Better interfaces for Aave users`,
      rewardAmount: 25000,
      rewardToken: 'USDC',
      maxWinners: 4,
    },
  });

  // Solana sponsor
  const jupiterSponsor = await prisma.sponsor.create({
    data: {
      hackathonId: solanaHackathon.id,
      name: 'Jupiter',
      logo: 'https://placehold.co/150x150/8B5CF6/FFFFFF?text=JUP',
    },
  });

  await prisma.bounty.create({
    data: {
      hackathonId: solanaHackathon.id,
      sponsorId: jupiterSponsor.id,
      title: 'Jupiter DCA Integration',
      description: `## Jupiter Bounty - $30,000

Build applications using Jupiter's swap aggregator and DCA features.

Best integrations win big!`,
      rewardAmount: 30000,
      rewardToken: 'USDC',
      maxWinners: 5,
    },
  });

  console.log(`✅ Created 4 sponsors and 4 bounties\n`);

  // ============================================
  // 8. CREATE PRIZES
  // ============================================
  console.log('💰 Creating track prizes...');

  // ETH Hackathon prizes
  for (const track of [ethTrack1, ethTrack2, ethTrack3]) {
    await prisma.prize.createMany({
      data: [
        { hackathonId: ethHackathon.id, trackId: track.id, type: 'TRACK', position: 1, name: 'First Place', amount: 15000, token: 'USDC' },
        { hackathonId: ethHackathon.id, trackId: track.id, type: 'TRACK', position: 2, name: 'Second Place', amount: 8000, token: 'USDC' },
        { hackathonId: ethHackathon.id, trackId: track.id, type: 'TRACK', position: 3, name: 'Third Place', amount: 4000, token: 'USDC' },
      ],
    });
  }

  // Solana Hackathon prizes
  for (const track of [solTrack1, solTrack2]) {
    await prisma.prize.createMany({
      data: [
        { hackathonId: solanaHackathon.id, trackId: track.id, type: 'TRACK', position: 1, name: 'First Place', amount: 20000, token: 'USDC' },
        { hackathonId: solanaHackathon.id, trackId: track.id, type: 'TRACK', position: 2, name: 'Second Place', amount: 10000, token: 'USDC' },
        { hackathonId: solanaHackathon.id, trackId: track.id, type: 'TRACK', position: 3, name: 'Third Place', amount: 5000, token: 'USDC' },
      ],
    });
  }

  // ZK Hackathon prizes
  for (const track of [zkTrack1, zkTrack2]) {
    await prisma.prize.createMany({
      data: [
        { hackathonId: zkHackathon.id, trackId: track.id, type: 'TRACK', position: 1, name: 'First Place', amount: 12000, token: 'USDC' },
        { hackathonId: zkHackathon.id, trackId: track.id, type: 'TRACK', position: 2, name: 'Second Place', amount: 6000, token: 'USDC' },
      ],
    });
  }

  // Bounty prizes
  await prisma.prize.createMany({
    data: [
      { hackathonId: ethHackathon.id, bountyId: chainlinkBounty.id, type: 'BOUNTY', position: 1, name: 'First Place', amount: 10000, token: 'USDC' },
      { hackathonId: ethHackathon.id, bountyId: chainlinkBounty.id, type: 'BOUNTY', position: 2, name: 'Second Place', amount: 6000, token: 'USDC' },
      { hackathonId: ethHackathon.id, bountyId: chainlinkBounty.id, type: 'BOUNTY', position: 3, name: 'Third Place', amount: 4000, token: 'USDC' },
    ],
  });

  console.log(`✅ Created track and bounty prizes\n`);

  // ============================================
  // 9. CREATE HACKATHON REGISTRATIONS (with answers for ETH hackathon)
  // ============================================
  console.log('📝 Creating hackathon registrations...');

  // ETH Hackathon registrations with custom question answers
  const ethReg1 = await prisma.hackathonRegistration.create({
    data: {
      hackathonId: ethHackathon.id,
      userId: hacker1.id,
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedById: adminUser.id,
      answers: {
        create: {
          answers: {
            q1: 'Expert',
            q2: 'DeFi Innovation',
            q3: 'Yes, looking for more members',
            q4: 'Built a DEX aggregator that saved users 15% on gas fees.',
            q5: 'Twitter/X',
          },
        },
      },
    },
  });

  const ethReg2 = await prisma.hackathonRegistration.create({
    data: {
      hackathonId: ethHackathon.id,
      userId: hacker2.id,
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedById: adminUser.id,
      answers: {
        create: {
          answers: {
            q1: 'Advanced',
            q2: 'Public Goods',
            q3: 'No, looking for a team',
            q4: 'Contributed to multiple open-source Solana projects.',
            q5: 'Discord',
          },
        },
      },
    },
  });

  const ethReg3 = await prisma.hackathonRegistration.create({
    data: {
      hackathonId: ethHackathon.id,
      userId: hacker3.id,
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedById: adminUser.id,
      answers: {
        create: {
          answers: {
            q1: 'Expert',
            q2: 'Account Abstraction',
            q3: 'Solo participant',
            q4: 'Published research on ZK-SNARKs optimization.',
            q5: 'Newsletter',
          },
        },
      },
    },
  });

  // Pending registration (not yet reviewed)
  const ethReg4 = await prisma.hackathonRegistration.create({
    data: {
      hackathonId: ethHackathon.id,
      userId: hacker4.id,
      status: 'PENDING',
      answers: {
        create: {
          answers: {
            q1: 'Intermediate',
            q2: 'DeFi Innovation',
            q3: 'Yes, complete team',
            q4: 'Working on a yield aggregator for my portfolio.',
            q5: 'Friend referral',
          },
        },
      },
    },
  });

  // Solana & ZK hackathons (no custom questions, simple registrations)
  await prisma.hackathonRegistration.createMany({
    data: [
      { hackathonId: solanaHackathon.id, userId: hacker2.id, status: 'APPROVED' },
      { hackathonId: solanaHackathon.id, userId: hacker5.id, status: 'APPROVED' },
      { hackathonId: solanaHackathon.id, userId: hacker6.id, status: 'APPROVED' },
      { hackathonId: zkHackathon.id, userId: hacker3.id, status: 'APPROVED' },
      { hackathonId: zkHackathon.id, userId: hacker1.id, status: 'PENDING' },
    ],
  });

  console.log(`✅ Created 9 registrations (4 with custom answers)\n`);

  // ============================================
  // 10. CREATE TEAMS
  // ============================================
  console.log('👥 Creating teams...');

  // ETH Hackathon teams
  const ethTeam1 = await prisma.team.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'DeFi Wizards',
      tagline: 'Making DeFi accessible to everyone',
    },
  });

  const ethTeam2 = await prisma.team.create({
    data: {
      hackathonId: ethHackathon.id,
      name: 'ZK Maxi',
      tagline: 'Privacy is a feature, not a bug',
    },
  });

  // Solana teams
  const solTeam1 = await prisma.team.create({
    data: {
      hackathonId: solanaHackathon.id,
      name: 'Turbo Builders',
      tagline: 'Fast code, fast chains',
    },
  });

  const solTeam2 = await prisma.team.create({
    data: {
      hackathonId: solanaHackathon.id,
      name: 'SOL Sisters',
      tagline: 'Building the Solana ecosystem together',
    },
  });

  // ZK team
  const zkTeam1 = await prisma.team.create({
    data: {
      hackathonId: zkHackathon.id,
      name: 'Proof Party',
      tagline: 'We prove things. Privately.',
    },
  });

  console.log(`✅ Created 5 teams\n`);

  // ============================================
  // 11. CREATE TEAM MEMBERS
  // ============================================
  console.log('🤝 Adding team members...');

  await prisma.teamMember.createMany({
    data: [
      { teamId: ethTeam1.id, userId: hacker1.id, isLeader: true, description: 'Smart Contract Lead' },
      { teamId: ethTeam1.id, userId: hacker4.id, isLeader: false, description: 'DeFi Architect' },
      { teamId: ethTeam2.id, userId: hacker3.id, isLeader: true, description: 'ZK Researcher' },
      { teamId: solTeam1.id, userId: hacker2.id, isLeader: true, description: 'Rust Developer' },
      { teamId: solTeam1.id, userId: hacker6.id, isLeader: false, description: 'Infrastructure Lead' },
      { teamId: solTeam2.id, userId: hacker5.id, isLeader: true, description: 'Full Stack & Gaming' },
      { teamId: zkTeam1.id, userId: hacker3.id, isLeader: true, description: 'Cryptography Lead' },
    ],
  });

  console.log(`✅ Added 7 team members\n`);

  // ============================================
  // 12. CREATE SUBMISSIONS
  // ============================================
  console.log('📦 Creating submissions...');

  await prisma.submission.create({
    data: {
      hackathonId: solanaHackathon.id,
      teamId: solTeam1.id,
      creatorId: hacker2.id,
      trackId: solTrack1.id,
      title: 'SolanaScope',
      tagline: 'Real-time Solana network analytics',
      description: `# SolanaScope

A comprehensive analytics dashboard for the Solana network.

## Features
- Real-time TPS monitoring
- Validator performance tracking
- Program usage analytics
- Transaction cost trends

## Tech Stack
- Next.js frontend
- Rust backend
- Helius RPC
- The Graph subgraph`,
      status: 'DRAFT',
      demoUrl: 'https://solanascope.demo.com',
      repoUrl: 'https://github.com/turbo-builders/solanascope',
      technologies: ['Rust', 'Next.js', 'TypeScript', 'Helius'],
    },
  });

  await prisma.submission.create({
    data: {
      hackathonId: solanaHackathon.id,
      teamId: solTeam2.id,
      creatorId: hacker5.id,
      trackId: solTrack2.id,
      title: 'PlayChain',
      tagline: 'On-chain game state for mobile games',
      description: `# PlayChain

Bringing blockchain to casual mobile games.

## What it does
- Stores game progress on-chain
- NFT achievements
- Cross-game asset portability

Built with Anchor and Unity.`,
      status: 'DRAFT',
      repoUrl: 'https://github.com/sol-sisters/playchain',
      technologies: ['Anchor', 'Unity', 'TypeScript', 'Mobile'],
    },
  });

  console.log(`✅ Created 2 submissions\n`);

  // ============================================
  // 13. CREATE NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        toUserId: hacker4.id,
        fromUserId: hacker1.id,
        type: 'TEAM_INVITE',
        content: 'You have been invited to join team "DeFi Wizards" for ETH Global Brussels 2025',
        payload: { teamId: ethTeam1.id, hackathonId: ethHackathon.id },
        isRead: false,
      },
      {
        toUserId: hacker1.id,
        type: 'REGISTRATION_APPROVED',
        content: 'Your registration for ETH Global Brussels 2025 has been approved!',
        payload: { hackathonId: ethHackathon.id },
        isRead: true,
      },
      {
        toUserId: hacker2.id,
        type: 'HACKATHON_STARTING',
        content: 'Solana Speedrun 2025 starts in 3 days! Get ready to build.',
        payload: { hackathonId: solanaHackathon.id },
        isRead: false,
      },
      {
        toUserId: hacker3.id,
        fromUserId: adminUser.id,
        type: 'ANNOUNCEMENT',
        content: 'New ZK workshop added: "Introduction to Noir" - Register now!',
        payload: { hackathonId: zkHackathon.id },
        isRead: false,
      },
    ],
  });

  console.log(`✅ Created 4 notifications\n`);

  // ============================================
  // 14. CREATE TEAM INVITATIONS
  // ============================================
  console.log('✉️ Creating team invitations...');

  await prisma.teamInvitation.createMany({
    data: [
      {
        teamId: ethTeam1.id,
        invitedUserId: hacker2.id,
        inviterUserId: hacker1.id,
        status: 'PENDING',
      },
      {
        teamId: zkTeam1.id,
        invitedUserId: hacker1.id,
        inviterUserId: hacker3.id,
        status: 'PENDING',
      },
    ],
  });

  console.log(`✅ Created 2 team invitations\n`);

  // ============================================
  // 15. CREATE FAQ THREADS & REPLIES
  // ============================================
  console.log('❓ Creating FAQ threads and replies...');

  // FAQ Thread 1: Technical question about ETH hackathon
  const faqThread1 = await prisma.hackathonQuestionThread.create({
    data: {
      hackathonId: ethHackathon.id,
      userId: hacker4.id,
      title: 'Can we use Layer 2 solutions for our project?',
      content: `Hi team! I'm planning to build a DeFi application and wondering if we can deploy on L2s like Arbitrum, Optimism, or Base instead of mainnet?

Also, will there be any bonus points for multi-chain deployments?

Thanks!`,
    },
  });

  // Reply from organizer
  await prisma.hackathonQuestionReply.create({
    data: {
      threadId: faqThread1.id,
      userId: adminUser.id,
      content: `Great question! Yes, absolutely! We encourage deployments on any EVM-compatible chain including:
- Ethereum Mainnet
- Arbitrum One / Nova
- Optimism
- Base
- Polygon
- zkSync Era

Multi-chain deployments are definitely a plus and will be considered during judging! 🚀`,
    },
  });

  // Follow-up from another user
  const faqReply1 = await prisma.hackathonQuestionReply.create({
    data: {
      threadId: faqThread1.id,
      userId: hacker1.id,
      content: `Adding to this - for the Account Abstraction track, I'd recommend using Base or Optimism as they have great AA infrastructure with Pimlico and Alchemy.`,
    },
  });

  // Nested reply
  await prisma.hackathonQuestionReply.create({
    data: {
      threadId: faqThread1.id,
      userId: hacker4.id,
      parentId: faqReply1.id,
      content: `Thanks for the tip! I'll look into Base. Do you know if they provide any testnet faucets?`,
    },
  });

  // FAQ Thread 2: Team formation question
  const faqThread2 = await prisma.hackathonQuestionThread.create({
    data: {
      hackathonId: ethHackathon.id,
      userId: hacker2.id,
      title: 'Looking for team members - Full stack dev available',
      content: `Hey everyone! 👋

I'm a full-stack developer with experience in:
- React/Next.js frontend
- Node.js/Express backend
- Basic Solidity (learning more!)

Looking for:
- Smart contract developer
- UI/UX designer

DM me on Discord: satoshi_dev#1234`,
    },
  });

  await prisma.hackathonQuestionReply.create({
    data: {
      threadId: faqThread2.id,
      userId: hacker3.id,
      content: `Hey! I'm a ZK researcher but also do Solidity. Would love to team up if you're interested in building something privacy-focused! Let me know.`,
    },
  });

  // FAQ Thread 3: Solana hackathon question
  const faqThread3 = await prisma.hackathonQuestionThread.create({
    data: {
      hackathonId: solanaHackathon.id,
      userId: hacker5.id,
      title: 'Anchor vs Native Solana - which is preferred?',
      content: `For the Infrastructure track, is there a preference between using Anchor framework vs native Solana programs?

I'm more comfortable with Anchor but want to make sure it won't affect judging.`,
    },
  });

  await prisma.hackathonQuestionReply.create({
    data: {
      threadId: faqThread3.id,
      userId: orgOwner.id,
      content: `Both are perfectly fine! Use whatever you're most productive with. 

That said, if you're building developer tools, supporting both Anchor and native programs could be a nice feature to have. But it's not required at all.

Ship fast! ⚡`,
    },
  });

  // FAQ Thread 4: ZK hackathon question  
  const faqThread4 = await prisma.hackathonQuestionThread.create({
    data: {
      hackathonId: zkHackathon.id,
      userId: hacker1.id,
      title: 'Are there workshops for ZK beginners?',
      content: `I'm new to ZK development. Will there be any introductory workshops or resources for beginners?

I have strong experience with Solidity but never worked with circuits before.`,
    },
  });

  await prisma.hackathonQuestionReply.create({
    data: {
      threadId: faqThread4.id,
      userId: adminUser.id,
      content: `Yes! We'll have a full learning track for beginners:

📚 **Workshop Schedule:**
- Day 1: ZK Fundamentals & Math Basics
- Day 2: Circom & snarkjs Hands-on
- Day 3: Introduction to Noir
- Day 4: Building Your First ZK App

All workshops will be recorded and available on our YouTube channel.

Don't worry about being a beginner - this hackathon is designed to be accessible! 🎓`,
    },
  });

  console.log(`✅ Created 4 FAQ threads with replies\n`);

  // ============================================
  // 16. CREATE ANNOUNCEMENTS
  // ============================================
  console.log('📢 Creating announcements...');

  await prisma.announcement.createMany({
    data: [
      {
        hackathonId: ethHackathon.id,
        createdById: adminUser.id,
        title: 'Registration Now Open! 🎉',
        message: `We're thrilled to announce that registration for ETH Global Brussels 2025 is now open!

## Key Dates
- **Registration Deadline**: 30 days from now
- **Hackathon Start**: March 15, 2025
- **Submissions Due**: March 17, 2025

## What to Prepare
1. Update your profile with your skills
2. Start forming your team
3. Review the tracks and bounties

See you in Brussels! 🇧🇪`,
        visibility: 'PUBLIC',
        targetType: 'ALL',
        isPinned: true,
      },
      {
        hackathonId: ethHackathon.id,
        createdById: adminUser.id,
        title: 'New Sponsor Bounty: Chainlink',
        message: `Exciting news! Chainlink has joined as a sponsor with a $20,000 bounty pool!

Build with Chainlink services:
- Price Feeds
- VRF (Randomness)
- Automation
- CCIP (Cross-chain)

Check the bounties tab for full details.`,
        visibility: 'PUBLIC',
        targetType: 'REGISTERED',
      },
      {
        hackathonId: solanaHackathon.id,
        createdById: orgOwner.id,
        title: 'Hackathon Has Started! ⚡',
        message: `The Solana Speedrun 2025 is officially LIVE!

You have 3 weeks to build something amazing. Remember:
- Deploy on devnet or mainnet
- Open source your code
- Submit before the deadline

Questions? Ask in the FAQ section or join our Discord.

LFG! 🚀`,
        visibility: 'PUBLIC',
        targetType: 'ALL',
        isPinned: true,
      },
      {
        hackathonId: zkHackathon.id,
        createdById: adminUser.id,
        title: 'Workshop Schedule Released',
        message: `The full workshop schedule for ZK Proof Summer is now available!

Week 1: Fundamentals
Week 2: Circom Deep Dive
Week 3: Noir & Advanced Topics
Week 4: Building & Shipping

All sessions will be recorded. Links will be shared with registered participants.`,
        visibility: 'REGISTERED_ONLY',
        targetType: 'REGISTERED',
      },
    ],
  });

  console.log(`✅ Created 4 announcements\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═'.repeat(60));
  console.log('🎉 Database seeded successfully!');
  console.log('═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   • Users: 8 (1 admin, 7 hackers/org owners)`);
  console.log(`   • Categories: 7`);
  console.log(`   • Organizations: 3`);
  console.log(`   • Hackathons: 3 (all ACTIVE)`);
  console.log(`   • Hackathon Requests: 3 (2 pending, 1 rejected)`);
  console.log(`   • Tracks: 7`);
  console.log(`   • Sponsors: 4`);
  console.log(`   • Bounties: 4`);
  console.log(`   • Prizes: 28`);
  console.log(`   • Teams: 5`);
  console.log(`   • Team Members: 7`);
  console.log(`   • Registrations: 9 (4 with custom answers)`);
  console.log(`   • Registration Answers: 4`);
  console.log(`   • Submissions: 2 (drafts)`);
  console.log(`   • Notifications: 4`);
  console.log(`   • Team Invitations: 2`);
  console.log(`   • FAQ Threads: 4`);
  console.log(`   • FAQ Replies: 7 (including nested)`);
  console.log(`   • Announcements: 4`);
  console.log('\n🔐 Test Credentials (all use Password123!):');
  console.log(`   Admin:     admin@4hacks.io`);
  console.log(`   Hacker 1:  vitalik@example.com (Solidity dev)`);
  console.log(`   Hacker 2:  satoshi@example.com (Rust/Solana)`);
  console.log(`   Hacker 3:  ada@example.com (ZK researcher)`);
  console.log(`   Hacker 4:  charlie@example.com (DeFi dev)`);
  console.log(`   Hacker 5:  diana@example.com (NFT/Gaming)`);
  console.log(`   Hacker 6:  ethan@example.com (Infrastructure)`);
  console.log(`   Org Owner: founder@solanalabs.io`);
  console.log('\n📋 Test Data for Upcoming Tasks:');
  console.log(`   • ETH Hackathon has 5 custom registration questions`);
  console.log(`   • 4 registrations have answers to test form API`);
  console.log(`   • 4 FAQ threads with replies to test FAQ endpoints`);
  console.log(`   • Nested replies included for threaded discussion test\n`);
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

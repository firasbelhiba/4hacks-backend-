import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRegistrationService } from './hackathon-registration.service';

describe('HackathonRegistrationService', () => {
  let service: HackathonRegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HackathonRegistrationService],
    }).compile();

    service = module.get<HackathonRegistrationService>(
      HackathonRegistrationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

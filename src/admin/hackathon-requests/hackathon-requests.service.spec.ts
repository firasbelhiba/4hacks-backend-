import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRequestsService } from './hackathon-requests.service';

describe('HackathonRequestsService', () => {
  let service: HackathonRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HackathonRequestsService],
    }).compile();

    service = module.get<HackathonRequestsService>(HackathonRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

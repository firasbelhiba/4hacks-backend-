import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRequestService } from './hackathon-request.service';

describe('HackathonRequestService', () => {
  let service: HackathonRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HackathonRequestService],
    }).compile();

    service = module.get<HackathonRequestService>(HackathonRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

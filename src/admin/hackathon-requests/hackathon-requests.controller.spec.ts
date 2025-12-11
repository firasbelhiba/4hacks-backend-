import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRequestsController } from './hackathon-requests.controller';

describe('HackathonRequestsController', () => {
  let controller: HackathonRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonRequestsController],
    }).compile();

    controller = module.get<HackathonRequestsController>(
      HackathonRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

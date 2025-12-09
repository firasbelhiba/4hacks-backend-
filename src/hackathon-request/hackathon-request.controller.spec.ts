import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRequestController } from './hackathon-request.controller';

describe('HackathonRequestController', () => {
  let controller: HackathonRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonRequestController],
    }).compile();

    controller = module.get<HackathonRequestController>(HackathonRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

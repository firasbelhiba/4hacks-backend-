import { Test, TestingModule } from '@nestjs/testing';
import { JudgesController } from './judges.controller';

describe('JudgesController', () => {
  let controller: JudgesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JudgesController],
    }).compile();

    controller = module.get<JudgesController>(JudgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

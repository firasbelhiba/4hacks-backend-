import { Test, TestingModule } from '@nestjs/testing';
import { HackathonRegistrationController } from './hackathon-registration.controller';

describe('HackathonRegistrationController', () => {
  let controller: HackathonRegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonRegistrationController],
    }).compile();

    controller = module.get<HackathonRegistrationController>(
      HackathonRegistrationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

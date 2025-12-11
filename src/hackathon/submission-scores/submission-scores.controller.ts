import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmissionScoresService } from './submission-scores.service';

@ApiTags('Submission Scores')
@Controller('submission-scores')
export class SubmissionScoresController {
  constructor(
    private readonly submissionScoresService: SubmissionScoresService,
  ) {}
}

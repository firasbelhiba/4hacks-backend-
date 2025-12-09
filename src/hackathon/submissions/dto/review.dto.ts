import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum SubmissionReviewAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class ReviewSubmissionDto {
  @ApiProperty({
    enum: [SubmissionReviewAction.ACCEPT, SubmissionReviewAction.REJECT],
    description: 'Action to take on the submission',
    example: SubmissionReviewAction.ACCEPT,
  })
  @IsEnum(SubmissionReviewAction)
  action: SubmissionReviewAction;

  @ApiPropertyOptional({
    description: 'Reason for the action. should be less than 255 characters',
    example: 'Submission is not valid for this hackathon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubmissionScoresService {
  private readonly logger = new Logger(SubmissionScoresService.name);

  constructor(private readonly prismaService: PrismaService) {}
}

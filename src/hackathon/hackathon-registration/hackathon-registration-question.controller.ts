import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserMin } from 'src/common/types';
import { HackathonRegistrationQuestionService } from './hackathon-registration-question.service';
import {
  CreateRegistrationQuestionDto,
  UpdateRegistrationQuestionDto,
  ReorderQuestionsDto,
  BulkCreateQuestionsDto,
} from './dto/registration-question.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/opt-jwt.guard';

@ApiTags('Hackathon Registration Questions')
@Controller('hackathon/:hackathonId/registration/questions')
export class HackathonRegistrationQuestionController {
  constructor(
    private readonly questionService: HackathonRegistrationQuestionService,
  ) {}

  @ApiOperation({
    summary: 'Get all registration questions for a hackathon',
    description:
      'Returns all registration questions in order. Public for active hackathons.',
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'List of registration questions',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @UseGuards(OptionalJwtAuthGuard)
  @Get('')
  async getQuestions(
    @Param('hackathonId') hackathonId: string,
    @CurrentUser() user?: UserMin,
  ) {
    return this.questionService.getQuestions(hackathonId, user);
  }

  @ApiOperation({
    summary: 'Get a single registration question',
    description: 'Returns a specific registration question by ID.',
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiParam({
    name: 'questionId',
    description: 'The registration question ID',
    example: 'clx2abc789ghi012',
  })
  @ApiResponse({
    status: 200,
    description: 'Registration question details',
  })
  @ApiNotFoundResponse({
    description: 'Question or hackathon not found',
  })
  @Get(':questionId')
  async getQuestion(
    @Param('hackathonId') hackathonId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.questionService.getQuestion(hackathonId, questionId);
  }

  @ApiOperation({
    summary: 'Create a new registration question',
    description: `Create a new registration question for the hackathon.

**Access Control:** Only organization owner or admin can create questions.

**Important:** Questions are locked after the first registration is submitted. 
You cannot add new questions once someone has registered.`,
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiBody({ type: CreateRegistrationQuestionDto })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to manage questions',
  })
  @ApiBadRequestResponse({
    description:
      'Questions are locked after users have registered, or invalid question data (e.g., SELECT without options)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async createQuestion(
    @Param('hackathonId') hackathonId: string,
    @Body() dto: CreateRegistrationQuestionDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.questionService.createQuestion(hackathonId, user, dto);
  }

  @ApiOperation({
    summary: 'Create multiple registration questions at once',
    description: `Create multiple registration questions in a single request.

**Access Control:** Only organization owner or admin can create questions.

**Important:** Questions are locked after the first registration is submitted.`,
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiBody({ type: BulkCreateQuestionsDto })
  @ApiResponse({
    status: 201,
    description: 'Questions created successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to manage questions',
  })
  @ApiBadRequestResponse({
    description:
      'Questions are locked after users have registered, or invalid question data (e.g., SELECT without options)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async bulkCreateQuestions(
    @Param('hackathonId') hackathonId: string,
    @Body() dto: BulkCreateQuestionsDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.questionService.bulkCreateQuestions(hackathonId, user, dto);
  }

  @ApiOperation({
    summary: 'Update a registration question',
    description: `Update an existing registration question.

**Access Control:** Only organization owner or admin can update questions.

**After registrations exist:** Only label, description, placeholder, and order can be modified.
Changing type, required, or options is not allowed once someone has registered.`,
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiParam({
    name: 'questionId',
    description: 'The registration question ID',
    example: 'clx2abc789ghi012',
  })
  @ApiBody({ type: UpdateRegistrationQuestionDto })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Question or hackathon not found',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to manage questions',
  })
  @ApiBadRequestResponse({
    description:
      'Cannot modify structural fields after registrations exist, or invalid question data',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':questionId')
  async updateQuestion(
    @Param('hackathonId') hackathonId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateRegistrationQuestionDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.questionService.updateQuestion(
      hackathonId,
      questionId,
      user,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Delete a registration question',
    description: `Delete a registration question.

**Access Control:** Only organization owner or admin can delete questions.

**Important:** Questions cannot be deleted after the first registration is submitted.`,
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiParam({
    name: 'questionId',
    description: 'The registration question ID',
    example: 'clx2abc789ghi012',
  })
  @ApiResponse({
    status: 200,
    description: 'Question deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Question or hackathon not found',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to manage questions',
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete questions after registrations exist',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':questionId')
  async deleteQuestion(
    @Param('hackathonId') hackathonId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: UserMin,
  ) {
    return this.questionService.deleteQuestion(hackathonId, questionId, user);
  }

  @ApiOperation({
    summary: 'Reorder registration questions',
    description: `Reorder questions by providing an array of question IDs in the desired order.

**Access Control:** Only organization owner or admin can reorder questions.`,
  })
  @ApiParam({
    name: 'hackathonId',
    description: 'The hackathon ID',
    example: 'clx1abc123def456',
  })
  @ApiBody({ type: ReorderQuestionsDto })
  @ApiResponse({
    status: 200,
    description: 'Questions reordered successfully',
  })
  @ApiNotFoundResponse({
    description: 'Hackathon not found',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to manage questions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid question IDs provided',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('reorder')
  async reorderQuestions(
    @Param('hackathonId') hackathonId: string,
    @Body() dto: ReorderQuestionsDto,
    @CurrentUser() user: UserMin,
  ) {
    return this.questionService.reorderQuestions(hackathonId, user, dto);
  }
}

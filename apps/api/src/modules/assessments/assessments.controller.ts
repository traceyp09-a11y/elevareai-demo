import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Assessments module health check' })
  healthCheck() {
    return { status: 'ok', module: 'assessments' };
  }

  @Get('questions')
  @ApiOperation({ summary: 'Get all assessment questions' })
  @ApiQuery({ name: 'scope', required: false, enum: ['org', 'sales', 'supply_chain', 'finance', 'operations', 'admin'] })
  @ApiQuery({ name: 'dimension', required: false, enum: ['data', 'technical', 'organizational'] })
  async getQuestions(
    @Query('scope') scope?: string,
    @Query('dimension') dimension?: string,
  ) {
    return this.assessmentsService.getQuestions(scope, dimension);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID' })
  async findOne(@Param('id') id: string) {
    return this.assessmentsService.findOne(id);
  }

  @Get(':id/score')
  @ApiOperation({ summary: 'Calculate assessment score' })
  async calculateScore(@Param('id') id: string) {
    return this.assessmentsService.calculateScore(id);
  }
}

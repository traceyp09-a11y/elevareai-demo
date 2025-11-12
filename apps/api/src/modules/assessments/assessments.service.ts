import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async getQuestions(scope?: string, dimension?: string) {
    return this.prisma.question.findMany({
      where: {
        ...(scope && { scope }),
        ...(dimension && { dimension }),
      },
      orderBy: [{ scope: 'asc' }, { dimension: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.assessment.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            scope: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async calculateScore(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // TODO: Implement scoring algorithm based on:
    // - Question weights
    // - Dimension scores (data, technical, organizational)
    // - Scope-specific scores
    // - Overall readiness score (0-100)

    const totalQuestions = assessment.answers.length;
    const completedAnswers = assessment.answers.filter(a => a.answer_value !== null).length;
    const completionRate = totalQuestions > 0 ? (completedAnswers / totalQuestions) * 100 : 0;

    return {
      assessment_id: id,
      completion_rate: Math.round(completionRate),
      total_questions: totalQuestions,
      completed_answers: completedAnswers,
      scores: {
        data: 0, // TODO: Calculate
        technical: 0, // TODO: Calculate
        organizational: 0, // TODO: Calculate
        overall: 0, // TODO: Calculate
      },
    };
  }
}

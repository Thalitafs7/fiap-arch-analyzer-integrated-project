import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getReport(analysisId: string) {
    return this.prisma.report.findUnique({
      where: { analysisId }
    });
  }

  async processWebhook(data: any) {
    const { analysisId, status, components, risks, recommendations, summary, score } = data;

    return this.prisma.report.upsert({
      where: { analysisId },
      update: {
        status: status || 'ANALYZED',
        components,
        risks,
        recommendations,
        summary,
        score
      },
      create: {
        analysisId,
        status: status || 'ANALYZED',
        components,
        risks,
        recommendations,
        summary,
        score
      }
    });
  }
}

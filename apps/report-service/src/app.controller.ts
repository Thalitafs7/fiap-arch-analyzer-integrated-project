import { Controller, Get, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('reports')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':analysisId')
  async getReport(@Param('analysisId') analysisId: string) {
    const report = await this.appService.getReport(analysisId);
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  @Get(':analysisId/status')
  async getStatus(@Param('analysisId') analysisId: string) {
    const report = await this.appService.getReport(analysisId);
    if (!report) throw new NotFoundException('Report not found');
    return { status: report.status };
  }

  @Post('webhook')
  async receiveWebhook(@Body() body: any) {
    return this.appService.processWebhook(body);
  }
}

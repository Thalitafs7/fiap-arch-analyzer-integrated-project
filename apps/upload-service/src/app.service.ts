import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as amqplib from 'amqplib';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private prisma: PrismaService) {}

  async createJob(fileName: string, fileUrl: string) {
    return this.prisma.analysisJob.create({
      data: {
        fileName,
        fileUrl,
        status: 'RECEIVED'
      }
    });
  }

  async publishToQueue(job: any) {
    try {
      const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
      const channel = await conn.createChannel();
      const queue = 'diagram_processing_queue';

      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify({
        analysisId: job.id,
        fileUrl: job.fileUrl,
        fileName: job.fileName
      })));

      this.logger.log(`Message sent to queue for job ${job.id}`);

      await this.prisma.analysisJob.update({
        where: { id: job.id },
        data: { status: 'QUEUED' }
      });

      setTimeout(() => {
        conn.close();
      }, 500);
    } catch (error) {
      this.logger.error(`Failed to publish message: ${error.message}`);
      await this.prisma.analysisJob.update({
        where: { id: job.id },
        data: { status: 'ERROR' }
      });
      throw error;
    }
  }
}

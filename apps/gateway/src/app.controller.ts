import { Controller, All, Req, Res, Headers } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @All('auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response, @Headers() headers: any) {
    const url = `http://auth-service:3001${req.originalUrl}`;
    return this.proxyRequest(req, res, url, headers);
  }

  // Upload route is now handled via proxy middleware in app.module.ts

  @All('reports/*')
  async proxyReports(@Req() req: Request, @Res() res: Response, @Headers() headers: any) {
    const url = `http://report-service:3003${req.originalUrl}`;
    return this.proxyRequest(req, res, url, headers);
  }

  private async proxyRequest(req: Request, res: Response, url: string, headers: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url,
          data: req.body,
          headers: { ...headers, host: undefined },
          responseType: 'stream'
        })
      );

      res.status(response.status);
      response.data.pipe(res);
    } catch (error: any) {
      const status = error.response?.status || 500;
      res.status(status).json(error.response?.data || { message: 'Gateway Error' });
    }
  }
}

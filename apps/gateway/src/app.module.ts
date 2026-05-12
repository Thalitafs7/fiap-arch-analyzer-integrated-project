import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AuthMiddleware } from './auth.middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(.*)')
      .forRoutes('*');

    // Proxy configuration for upload handling binary data properly
    consumer
      .apply(createProxyMiddleware({
        target: 'http://upload-service:3002',
        changeOrigin: true,
      }))
      .forRoutes('upload');
  }
}

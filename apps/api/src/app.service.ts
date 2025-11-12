import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Elevare AI Platform API',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}

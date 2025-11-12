import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Auth module health check' })
  healthCheck() {
    return { status: 'ok', module: 'auth' };
  }
}

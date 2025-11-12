import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Tenants module health check' })
  healthCheck() {
    return { status: 'ok', module: 'tenants' };
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }
}

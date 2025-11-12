import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        region: true,
        plan: true,
        created_at: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
            scope: true,
          },
        },
      },
    });
  }
}

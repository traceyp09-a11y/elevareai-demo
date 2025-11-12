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
        createdAt: true,
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
            name: true,
            status: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }
}

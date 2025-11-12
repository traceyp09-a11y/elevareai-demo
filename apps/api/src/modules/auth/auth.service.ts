import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement Okta OIDC authentication
  // - JWT validation
  // - User session management
  // - Role-based access control
}

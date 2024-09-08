import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationsRepository {
  constructor(private prisma: PrismaService) {}
}

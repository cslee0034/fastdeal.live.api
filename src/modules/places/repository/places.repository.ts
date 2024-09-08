import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { Place } from '@prisma/client';
import { CreatePlaceDto } from '../dto/create-place.dto';

@Injectable()
export class PlacesRepository {
  constructor(private prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto): Promise<Place> {
    return await this.prisma.place.create({
      data: createPlaceDto,
    });
  }
}

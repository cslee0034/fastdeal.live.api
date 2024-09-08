import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event-dto';
import { Event } from '@prisma/client';

@Injectable()
export class EventsRepository {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    return await this.prisma.event.create({
      data: {
        name: createEventDto.name,
        description: createEventDto.description,
        date: createEventDto.date,
        place: {
          connect: {
            id: createEventDto.placeId,
          },
        },
      },
    });
  }

  async createEvents(tx: PrismaService, createEventDto: CreateEventDto) {
    return await tx.event.create({
      data: {
        name: createEventDto.name,
        description: createEventDto.description,
        date: createEventDto.date,
        place: {
          connect: {
            id: createEventDto.placeId,
          },
        },
      },
    });
  }
}

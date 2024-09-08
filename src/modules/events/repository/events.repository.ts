import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event-dto';
import { Event } from '@prisma/client';
import { FindEventsByPlaceDto } from '../dto/find-events-by-place.dto';
import { REPOSITORY_CONSTANT } from '../../../common/constant/repository.constant';

@Injectable()
export class EventsRepository {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    return await this.prisma.event.create({
      data: {
        name: createEventDto.name,
        description: createEventDto.description,
        date: createEventDto.date,
        eventType: createEventDto.eventType,
        place: {
          connect: {
            id: createEventDto.placeId,
          },
        },
      },
    });
  }

  async createEventTx(tx: PrismaService, createEventDto: CreateEventDto) {
    return await tx.event.create({
      data: {
        name: createEventDto.name,
        description: createEventDto.description,
        date: createEventDto.date,
        eventType: createEventDto.eventType,
        place: {
          connect: {
            id: createEventDto.placeId,
          },
        },
      },
    });
  }

  async findEventsByPlace(findEventsDto: FindEventsByPlaceDto) {
    return await this.prisma.event.findMany({
      where: {
        place: {
          city: findEventsDto.city,
          district:
            findEventsDto.district || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
          street:
            findEventsDto.street || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
          streetNumber:
            findEventsDto.streetNumber ||
            REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
        },
        name: findEventsDto.eventName || REPOSITORY_CONSTANT.DEFAULT_UNSELECTED,
      },
    });
  }
}

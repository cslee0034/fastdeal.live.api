import { Module } from '@nestjs/common';
import { CitiesService } from '../service/cities.service';
import { CitiesController } from '../controller/cities.controller';
import { CitiesRepository } from '../repository/cities.repository';
import { PrismaModule } from '../../../common/orm/prisma/module/prisma.module';
import { CitiesErrorHandler } from '../error/handler/cities.error.handler';
import { LoggerModule } from '../../../common/module/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CitiesController],
  providers: [CitiesService, CitiesRepository, CitiesErrorHandler],
})
export class CitiesModule {}

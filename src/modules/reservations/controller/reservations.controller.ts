import { Body, Controller, Post } from '@nestjs/common';
import { ReservationsService } from '../service/reservations.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { GetTokenUserId } from '../../../common/decorator/get-token-user-id.decorator';
import { CreateStandingDto } from '../dto/create-standing-dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('seating')
  @ApiOperation({
    summary: '좌석이 있는 장소 예약',
    description: 'ticket이 각각 구분되어 있는 경우',
  })
  async createSeating(
    @GetTokenUserId() userId: string,
    @Body() createSeatingDto: CreateSeatingDto,
  ) {
    return await this.reservationsService.createSeating(
      userId,
      createSeatingDto,
    );
  }

  @Post('standing')
  @ApiOperation({
    summary: '좌석이 없는 장소 예약',
    description: 'ticket이 구분되어 있지 않은 경우',
  })
  async createStanding(
    @GetTokenUserId() userId: string,
    @Body() createStandingDto: CreateStandingDto,
  ) {
    return await this.reservationsService.createStanding(
      userId,
      createStandingDto,
    );
  }
}

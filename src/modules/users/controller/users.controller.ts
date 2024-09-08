import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { SellerApplicationEntity } from '../entities/seller-application.entity';
import { Roles } from '../../../common/decorator/roles.decorator';
import { GetTokenUserId } from '../../../common/decorator/get-token-user-id.decorator';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('seller/application')
  async applyToSeller(
    @GetTokenUserId() id: string,
    @Body() description: string,
  ): Promise<SellerApplicationEntity> {
    return await this.usersService.applyToSeller(id, description);
  }

  @Get('seller/application')
  @Roles(['ADMIN'])
  async findManySellerApplication(
    @Query('skip') skip: number,
    @Query('take') take: number,
  ): Promise<SellerApplicationEntity[]> {
    return await this.usersService.findManySellerApplication(skip, take);
  }

  @Patch('seller/application/:id/approve')
  @Roles(['ADMIN'])
  async approveToSeller(
    @Param('id') id: string,
  ): Promise<SellerApplicationEntity> {
    return await this.usersService.approveToSeller(id);
  }

  @Patch('seller/application/:id/reject')
  @Roles(['ADMIN'])
  async rejectToSeller(
    @Param('id') id: string,
  ): Promise<SellerApplicationEntity> {
    return await this.usersService.rejectToSeller(id);
  }
}

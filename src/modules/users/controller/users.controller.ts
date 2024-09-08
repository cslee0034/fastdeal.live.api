import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { ApplyToSellerDto } from '../dto/apply-to-seller.dto';
import { SellerApplicationEntity } from '../entities/seller-application.entity';
import { Roles } from '../../../common/decorator/roles.decorator';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async applyToSeller(
    @Body()
    applyToSellerDto: ApplyToSellerDto,
  ): Promise<SellerApplicationEntity> {
    return await this.usersService.applyToSeller(applyToSellerDto);
  }

  @Patch(':id/approve')
  @Roles(['ADMIN'])
  async approveToSeller(
    @Param('id') id: string,
  ): Promise<SellerApplicationEntity> {
    return await this.usersService.approveToSeller(id);
  }

  @Patch(':id/reject')
  @Roles(['ADMIN'])
  async rejectToSeller(
    @Param('id') id: string,
  ): Promise<SellerApplicationEntity> {
    return await this.usersService.rejectToSeller(id);
  }
}

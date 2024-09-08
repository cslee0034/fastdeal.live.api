import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { ApplyToSellerDto } from '../dto/apply-to-seller.dto';
import { SellerApplicationEntity } from '../entities/seller-application.entity';
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
}

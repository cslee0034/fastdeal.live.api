import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../../common/dto/base-response.dto';
import { Tokens } from '../../types/tokens.type';

export class TokensResponseDto extends BaseResponseDto implements Tokens {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

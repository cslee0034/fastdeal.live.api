import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignUpDto } from '../dto/request/signup.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockConfigService = {
    get: jest.fn((key: string): number | string => {
      if (typeof key === 'string') {
        return key;
      }

      return key;
    }),
  };

  interface Payload {
    userId: number;
    email: string;
  }
  interface SignOption {
    secret: string;
    expiresIn: string;
  }
  const mockJwtService = {
    signAsync: jest.fn(
      (payload: Payload, signOption: SignOption): Promise<string> => {
        const token = `${payload.userId}_${payload.email}_${signOption.secret}_${signOption.expiresIn}`;
        return Promise.resolve(token);
      },
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    const mockSignUpDto: SignUpDto = {
      email: 'test@email.com',
      name: 'test_name',
      password: 'test_password',
    };

    it('should called with signAsync function', async () => {
      const id = 1;
      const email = mockSignUpDto.email;
      const accessSecret = 'jwt.access.secret';
      const accessExpiresIn = 'jwt.access.expiresIn';
      const refreshSecret = 'jwt.refresh.secret';
      const refreshExpiresIn = 'jwt.refresh.expiresIn';

      await service.generateToken(id, email);

      expect(mockJwtService.signAsync).toBeCalledWith(
        expect.objectContaining({
          id: id,
          email: email,
        }),
        expect.objectContaining({
          secret: accessSecret,
          expiresIn: accessExpiresIn,
        }),
      );

      expect(mockJwtService.signAsync).toBeCalledWith(
        expect.objectContaining({
          id: id,
          email: mockSignUpDto.email,
        }),
        expect.objectContaining({
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        }),
      );
    });

    it('should return token strings object', async () => {
      const id = 1;
      const email = mockSignUpDto.email;

      const tokens = await service.generateToken(id, email);

      expect(tokens).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
    });

    it('should throw error if it fails to generate token', async () => {
      const id = 1;
      const email = 'example@email.com';

      mockJwtService.signAsync.mockRejectedValueOnce(
        new Error('Failed to create token'),
      );

      await expect(service.generateToken(id, email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

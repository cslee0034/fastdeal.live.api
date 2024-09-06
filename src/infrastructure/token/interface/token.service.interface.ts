export interface ITokenService {
  generateTokens(id: string, email: string): Promise<any>;
  getRefreshTokenId(id: string): string;
  getRefreshTokenExpiresIn(): number;
}

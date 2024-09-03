export interface CacheService {
  getRefreshToken(id: string): Promise<string | undefined>;
  setRefreshToken({
    id,
    token,
    ttl,
  }: {
    id: string;
    token: string;
    ttl: number;
  }): Promise<void>;
  deleteRefreshToken(id: string): Promise<void>;
}

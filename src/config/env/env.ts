export const env = () => ({
  app: {
    env: process.env.NODE_ENV,
    server_name: process.env.SERVER_NAME,
    host: process.env.NAEYEOP_API_HOST,
    port: +process.env.NAEYEOP_API_PORT,
  },
  http: {
    timeout: process.env.HTTP_TIMEOUT,
    max_redirects: process.env.HTTP_MAX_REDIRECTS,
  },
  rdb: {
    host: process.env.RDB_HOST,
    port: +process.env.RDB_PORT,
    username: process.env.RDB_USERNAME,
    password: process.env.RDB_PASSWORD,
    database: process.env.RDB_DATABASE,
    synchronize: process.env.RDB_SYNCHRONIZE,
    logging: process.env.RDB_LOGGING,
    url: process.env.RDB_URL,
  },
  cache: {
    host: process.env.CACHE_HOST,
    port: process.env.CACHE_PORT,
    password: process.env.CACHE_PASSWORD,
    ttl: process.env.CACHE_TTL,
  },
  encrypt: {
    salt: process.env.ENCRYPT_SALT,
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      prefix: process.env.JWT_REFRESH_PREFIX,
    },
  },
});

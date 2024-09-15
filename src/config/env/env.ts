export const env = () => ({
  app: {
    env: process.env.NODE_ENV,
    serverName: process.env.SERVER_NAME,
    protocol: process.env.API_PROTOCOL,
    host: process.env.API_HOST,
    port: +process.env.API_PORT,
  },
  client: {
    url: process.env.CLIENT_URL,
  },
  http: {
    timeout: process.env.HTTP_TIMEOUT,
    maxRedirects: process.env.HTTP_MAX_REDIRECTS,
  },
  rdb: {
    url: process.env.RDB_URL,
  },
  cache: {
    url: process.env.CACHE_URL,
    password: process.env.CACHE_PASSWORD,
  },
  lock: {
    url: process.env.LOCK_URL,
    password: process.env.LOCK_PASSWORD,
    wait: process.env.LOCK_WAIT,
    maxAttempts: process.env.LOCK_MAX_ATTEMPTS,
    ignoreUnlockFail: process.env.LOCK_IGNORE_UNLOCK_FAIL,
  },
  queue: {
    host: process.env.QUEUE_HOST,
    port: process.env.QUEUE_PORT,
    password: process.env.QUEUE_PASSWORD,
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
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
  },
});

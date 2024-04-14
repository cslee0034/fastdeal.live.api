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
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sqs: {
      email: {
        name: process.env.AWS_SQS_EMAIL_NAME,
        queueUrl: process.env.AWS_SQS_EMAIL_QUEUE_URL,
        region: process.env.AWS_SQS_EMAIL_REGION,
      },
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

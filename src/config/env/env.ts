export const env = () => ({
  app: {
    env: process.env.NODE_ENV,
    serverName: process.env.SERVER_NAME,
    host: process.env.NAEYEOP_API_HOST,
    port: +process.env.NAEYEOP_API_PORT,
  },
});

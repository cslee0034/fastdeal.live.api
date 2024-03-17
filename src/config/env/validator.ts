import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().required(),
  SERVER_NAME: Joi.string().required(),
  NAEYEOP_API_HOST: Joi.string().required(),
  NAEYEOP_API_PORT: Joi.number().required(),
  HTTP_TIMEOUT: Joi.number().required(),
  HTTP_MAX_REDIRECTS: Joi.number().required(),
  CACHE_HOST: Joi.string().required(),
  CACHE_PORT: Joi.number().required(),
  CACHE_PASSWORD: Joi.string().required(),
  CACHE_TTL: Joi.number().required(),
});

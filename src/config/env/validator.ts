import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().required(),
  SERVER_NAME: Joi.string().required(),
  NAEYEOP_API_HOST: Joi.string().required(),
  NAEYEOP_API_PORT: Joi.number().required(),
});

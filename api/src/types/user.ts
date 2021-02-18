import joi from 'typesafe-joi';

export const newUserSchema = joi
  .object({
    name: joi.string().required().min(2).max(50),
    email: joi.string().required().email(),
    username: joi.string().required().min(3).max(50),
    password: joi.string().required().min(7).max(50),
  })
  .required();

export type NewUser = joi.Literal<typeof newUserSchema>;

export const userSchema = joi
  .object({
    id: joi.number().required().integer().positive(),
    name: joi.string().required().min(2).max(50),
    email: joi.string().required().email(),
    username: joi.string().required().min(3).max(50),
    archivedAt: joi.date(),
    bannedAt: joi.date(),
    createdAt: joi.date().required(),
    updatedAt: joi.date().required(),
  })
  .required();

export type User = joi.Literal<typeof userSchema>;

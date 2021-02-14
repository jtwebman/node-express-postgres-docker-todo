import config from 'config';

export interface Config extends config.IConfig {}

export function getConfig() : Config {
  return config;
}
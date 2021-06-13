import config from 'config';

export type Config = config.IConfig;

export function getConfig(): Config {
  return config;
}

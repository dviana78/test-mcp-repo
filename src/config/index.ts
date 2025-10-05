import 'dotenv/config';

export * from './azure';
export * from './logging';

export const AppConfig = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  port: parseInt(process.env.PORT ?? '3000', 10),
};

export default AppConfig;
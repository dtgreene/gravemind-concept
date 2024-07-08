import { registerAs } from '@nestjs/config';

const env = process.env.NODE_ENV || 'development';
const port = parseInt(process.env.PORT) || 8080;

const origins = {
  staging: [`http://localhost:${port}`],
  production: [],
};

export default registerAs('app', () => ({
  env,
  port,
  origin: origins[env] ?? true,
}));

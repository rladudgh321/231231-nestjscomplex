import { registerAs } from '@nestjs/config';

export default registerAs('sentry', () => ({
  sentry: process.env.SENTRY_DSN,
}));

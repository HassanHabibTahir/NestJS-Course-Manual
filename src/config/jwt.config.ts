import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  expiresIn: process.env.JWT_EXPIRATION || '1d',
}));

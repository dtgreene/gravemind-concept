import { registerAs } from '@nestjs/config';

export default registerAs('pokemon', () => ({
  pokemon: 'yes',
}));

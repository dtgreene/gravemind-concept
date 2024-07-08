import { Module } from '@nestjs/common';
import { PokemonAPI } from './pokemon.api';
import { PokemonResolver } from './pokemon.resolver';

@Module({
  providers: [PokemonAPI, PokemonResolver],
  exports: [PokemonAPI],
})
export class PokemonModule {}

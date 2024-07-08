import { Module } from '@nestjs/common';
import { AnimalsAPI } from './animals.api';
import { AnimalsResolver } from './animals.resolver';
import { PokemonModule } from 'src/pokemon/pokemon.module';

@Module({
  imports: [PokemonModule],
  providers: [AnimalsAPI, AnimalsResolver],
  exports: [AnimalsAPI],
})
export class AnimalsModule {}

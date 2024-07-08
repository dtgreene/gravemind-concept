import { Query, Resolver } from '@nestjs/graphql';
import { AnimalsAPI } from './animals.api';

@Resolver('Animals')
export class AnimalsResolver {
  constructor(private readonly animalsAPI: AnimalsAPI) {}

  @Query()
  animals() {
    return this.animalsAPI.getAnimals();
  }

  @Query()
  animalsAndPokemon() {
    return this.animalsAPI.getAnimalsAndPokemon();
  }
}

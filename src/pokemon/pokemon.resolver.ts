import { Query, Resolver } from '@nestjs/graphql';
import { PokemonAPI } from './pokemon.api';

@Resolver('Pokemon')
export class PokemonResolver {
  constructor(private readonly pokemonAPI: PokemonAPI) {}

  @Query()
  pokemon() {
    return this.pokemonAPI.getPokemon();
  }
}

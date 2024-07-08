import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { GqlContext } from 'src/graphql/gql-context.interface';
import { GqlDataSource } from 'src/graphql/gql-data-source.class';

@Injectable({ scope: Scope.REQUEST })
export class PokemonAPI extends GqlDataSource {
  constructor(@Inject(CONTEXT) context: GqlContext) {
    super(context);
  }

  baseURL = 'https://pokeapi.co';

  async getPokemon() {
    const { results } = await this.get('/api/v2/pokemon');

    return results;
  }
}

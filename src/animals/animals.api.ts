import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { GqlContext } from 'src/graphql/gql-context.interface';
import { GqlDataSource } from 'src/graphql/gql-data-source.class';
import { PokemonAPI } from 'src/pokemon/pokemon.api';

@Injectable({ scope: Scope.REQUEST })
export class AnimalsAPI extends GqlDataSource {
  constructor(
    @Inject(CONTEXT) context: GqlContext,
    private readonly pokemonAPI: PokemonAPI
  ) {
    super(context);
  }

  getAnimals() {
    return [
      {
        name: 'dog',
      },
      {
        name: 'cat',
      },
      {
        name: 'moose',
      },
    ];
  }

  async getAnimalsAndPokemon() {
    const pokemon = await this.pokemonAPI.getPokemon();

    return {
      animals: [
        {
          name: 'dog',
        },
        {
          name: 'cat',
        },
        {
          name: 'moose',
        },
      ],
      pokemon,
    };
  }
}

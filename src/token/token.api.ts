import { Inject, Injectable, Scope } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';
import { GqlContext } from 'src/graphql/gql-context.interface';
import { GqlDataSource } from 'src/graphql/gql-data-source.class';

@Injectable({ scope: Scope.REQUEST })
export class TokenAPI extends GqlDataSource {
  constructor(@Inject(CONTEXT) context: GqlContext) {
    super(context);
  }

  async getToken() {
    return this.context.token;
  }
  async getTokenLong() {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    return this.context.token;
  }
}

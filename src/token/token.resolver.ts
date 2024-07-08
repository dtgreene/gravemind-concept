import { Query, Resolver } from '@nestjs/graphql';
import { TokenAPI } from './token.api';

@Resolver('Token')
export class TokenResolver {
  constructor(private readonly tokenAPI: TokenAPI) {}

  @Query()
  token() {
    return this.tokenAPI.getToken();
  }

  @Query()
  tokenLong() {
    return this.tokenAPI.getTokenLong();
  }
}

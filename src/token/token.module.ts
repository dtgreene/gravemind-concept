import { Module } from '@nestjs/common';
import { TokenAPI } from './token.api';
import { TokenResolver } from './token.resolver';

@Module({
  providers: [TokenAPI, TokenResolver],
  exports: [TokenAPI],
})
export class TokenModule {}

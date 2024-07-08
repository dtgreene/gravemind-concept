import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from 'src/app.config';
import { AuthModule } from 'src/auth/auth.module';
import { GraphqlModule } from 'src/graphql/graphql.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    GraphqlModule,
  ],
})
export class AppModule {}

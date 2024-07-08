import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { AuthService } from 'src/auth/auth.service';
import resolvers from 'src/graphql/resolvers';
import graphqlConfig from 'src/graphql/graphql.config';
import { AnimalsModule } from 'src/animals/animals.module';
import { PokemonModule } from 'src/pokemon/pokemon.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    AnimalsModule,
    PokemonModule,
    TokenModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule.forFeature(graphqlConfig)],
      inject: [AuthService, ConfigService],
      driver: ApolloDriver,
      useFactory: (authService: AuthService, config: ConfigService) => {
        const isDev = process.env.NODE_ENV === 'development';
        const enableReporting =
          process.env.NODE_ENV === 'staging' ||
          process.env.NODE_ENV === 'production';

        const plugins = [];

        // Only include usage reporting plugin when in staging or production
        if (enableReporting) {
          plugins.push(
            ApolloServerPluginUsageReporting({
              // Option to configure which request header names and values are included in trace data that's sent to Apollo Studio.
              // https://www.apollographql.com/docs/apollo-server/v3/api/plugin/usage-reporting/#valid-sendheaders-object-signatures
              sendHeaders: {
                all: true,
              },
              // Option to configure which variable values are included in trace data that's sent to Apollo Studio.
              // https://www.apollographql.com/docs/apollo-server/v3/api/plugin/usage-reporting/#valid-sendvariablevalues-object-signatures
              sendVariableValues: {
                all: true,
              },
            })
          );
        }

        if (isDev) {
          plugins.push(ApolloServerPluginLandingPageLocalDefault());
        }

        return {
          introspection: isDev,
          resolvers,
          typePaths: ['./**/*.gql'],
          plugins,
          context: async ({ req }) => {
            // https://www.npmjs.com/package/apollo-datasource-rest#accessing-data-sources-from-resolvers
            // https://www.apollographql.com/docs/apollo-server/migration/#datasources
            // https://community.apollographql.com/t/why-do-we-need-a-per-request-based-data-source-instance/3642/3
            const { jwt, token } = authService.getAuthContext(req);

            return {
              jwt,
              token,
            };
          },
          playground: false,
          apollo: {
            key: config.get('graphql.engine'),
          },
        };
      },
    }),
  ],
})
export class GraphqlModule {}

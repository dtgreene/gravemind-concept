import { GraphQLJSONObject } from 'graphql-type-json';
import { DateScalar } from 'src/graphql/resolvers/date.scalar';

const resolvers = {
  Date: DateScalar,
  Query: {
    sample: () => ({
      id: 1,
      name: 'Hello World!',
      now: new Date(),
    }),
  },
  JSONObject: GraphQLJSONObject,
};

export default resolvers;

import { registerAs } from '@nestjs/config'

export default registerAs('graphql', () => ({
  tracing: process.env.GRAPHQL_TRACING === 'true',
  graphRef: process.env.APOLLO_GRAPH_REF,
  engine: process.env.GRAPHQL_ENGINE,
}))

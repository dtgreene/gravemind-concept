import { AugmentedRequest, RESTDataSource } from '@apollo/datasource-rest';
import { v4 as uuid } from 'uuid';
import { GqlContext } from './gql-context.interface';

const JWT_HEADER = 'X-User-OktaJWT';
const REQUEST_ID_HEADER = 'X-Request-Id';
const REQUEST_ID_HEADER_LOWER = REQUEST_ID_HEADER.toLowerCase();

export class GqlDataSource extends RESTDataSource {
  constructor(public readonly context: GqlContext) {
    super();
  }

  protected willSendRequest(_path: string, options: AugmentedRequest) {
    options.headers[REQUEST_ID_HEADER] = this.getRequestId(options.headers);

    if (this.context.token) {
      // Forward the incoming request's token to all outbound requests made via
      // the RESTDataSource.
      options.headers[JWT_HEADER] = this.context.token;
    }
  }

  private getRequestId(headers: Record<string, string>) {
    const vals =
      headers[REQUEST_ID_HEADER_LOWER] ?? headers[REQUEST_ID_HEADER] ?? uuid();
    return Array.isArray(vals) ? vals[0] : vals;
  }

  // override caching for now
  protected cacheOptionsFor() {
    return { ttl: 0 };
  }
}

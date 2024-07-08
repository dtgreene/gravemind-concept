# Gravemind Concept

A minimum reproduction of gravemind-apollo to demonstrate some of the required changes for upgrading to the latest versions of NestJS and Apollo Server.

The main goals of this repo are to demonstrate the following:

1. Data sources accessing other data sources.
2. Context access in the base data source class that avoids context "bleed" situations.

## Importing other data sources

In current versions of gravemind-apollo, all data sources are available through the current context.  This makes it easy for data sources to access each other for more complicated requests.  This doesn't seem to be possible with the new request-scoped data sources.  Instead you have to import them the way you would any other NestJS module.

For instance, to use the `PokemonAPI` from the `AnimalsAPI`, we need to first import the module which exports this service:

```node.js
@Module({
  imports: [PokemonModule],
  providers: [AnimalsAPI, AnimalsResolver],
  exports: [AnimalsAPI],
})
export class AnimalsModule {}
```

Then, the `AnimalsAPI` needs to declare the `PokemonAPI` so Nest knows to inject this service from the imported module:

```node.js
@Injectable({ scope: Scope.REQUEST })
export class AnimalsAPI extends GqlDataSource {
  constructor(
    @Inject(CONTEXT) context: GqlContext,
    private readonly pokemonAPI: PokemonAPI
  ) {
    super(context);
  }

  async getAnimalsAndPokemon() {
    const pokemon = await this.pokemonAPI.getPokemon();

    // rest of the method...
  }
}
```

## Per-request context

By scoping each API class to `REQUEST`, we can ensure that the relevant services get created with each request.  This also allows us to use the `@Inject(CONTEXT)` decorator in the class constructor which is then passed to the base class.  This is important because some headers are automatically included with every outbound request.

```node.js
@Injectable({ scope: Scope.REQUEST })
export class PokemonAPI extends GqlDataSource {
  constructor(@Inject(CONTEXT) context: GqlContext) {
    super(context);
  }

  // ...rest of the class
}
```

```node.js
export class GqlDataSource extends RESTDataSource {
  constructor(public readonly context: GqlContext) {
    super();
  }

  protected willSendRequest(_path: string, options: AugmentedRequest) {
    // Automatically include the context's token with each outbound request
    options.headers[JWT_HEADER] = this.context.token;
  }

  // ...rest of the base class
}
```

## Preventing context bleed 🩸

TokenAPI used for demonstration:

```node.js
@Injectable()
export class TokenAPI extends GqlDataSource {
  async getToken() {
    return this.context.token;
  }
  async getTokenLong() {
    // Simulated delay before resolving the context's token
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    return this.context.token;
  }
}
```

Node.js script:

```node.js
async function getToken(token) {
  const res = await query(token, 'query GetToken { token }');
  console.log(`Request token: ${token}; Result token: ${res.data.token}`);
}

async function getTokenLong(token) {
  const res = await query(token, 'query GetTokenLong { tokenLong }');
  console.log(`Request token: ${token}; Result token: ${res.data.tokenLong}`);
}

async function query(token, query) {
  const res = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

// Use Promise.all() so neither request blocks the other
await Promise.all([getTokenLong('abc456'), getToken('abc123')]);
```

In current versions of gravemind-apollo, these are the results:

```
Request token: abc123; Result token: abc123
Request token: abc456; Result token: abc123
```

Even though the request with token `abc456` started before the request with token `abc123`, we received that request's token in response.  This happens because the context in the current setup is essentially just a shared property that continuously gets overwritten by incoming requests.  This means if your request performs any operations before trying to access the current context, it's highly likely that the context has been overwritten, especially in busier environments such as production.

By scoping the API classes per-request, the results are as expected:

```
Request token: abc123; Result token: abc123
Request token: abc456; Result token: abc456
```




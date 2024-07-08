## Gravemind Concept

A minimum reproduction of gravemind-apollo to demonstrate some of the required changes for upgrading to the latest versions of NestJS and Apollo Server.

The main goals of this repo are to demonstrate the following:

1. Data sources accessing other data sources.
2. Context access in the base data source class that avoids context "bleed" situations.

## Context Bleed

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

As you can see, since the first request takes longer than the second one, the context gets overwritten before it has time to resolve.  The context in the current setup is essentially just a shared property that continuously gets overwritten by incoming requests.  
By scoping the API classes per-request, the results are correct:

```
Request token: abc123; Result token: abc123
Request token: abc456; Result token: abc456
```



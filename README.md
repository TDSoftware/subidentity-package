# subidentity-package
## Motivation
This package provides functionality to fetch identities and search identities by address or any identity field from any Substrate chain implementing the identities pallet. It was developed for use in SubIdentity, a Substrate identity directory, and contains all therefore required methods and interfaces.
## Development
```
npm install
npm run build
```

## Tests
### Unit
```
npm run test
```
### Lint
```
npm run lint
```
## Installation
```
npm install @npmjs_tdsoftware/subidentity
```
## Available features

### getIdentities
Returns a Page of all identities of the chain of the provided wsProvider.

```
import { Identity, Page, getIdentities } from "@npmjs_tdsoftware/subidentity"

let wsProvider: string = "your-ws-provider"
let pageNumber = 1;
let limit = 10;
let page: Page<Identity> = await getIdentities(wsProvider, pageNumber, limit);
```

### getIdentity
Returns an identity of the chain of the provided wsProvider for the given address.

```
import { getIdentity } from "@npmjs_tdsoftware/subidentity"

let wsProvider: string = "your-ws-provider"
let address = "account-address";
let identity: Identity = await getIdentity(wsProvider, address);
```

### searchIdentities
Returns a Page of identities of the chain of the provided wsProvider fitting the search term.

```
import { searchIdentities } from "@npmjs_tdsoftware/subidentity"

let wsProvider: string = "your-ws-provider"
let pageNumber = 1;
let limit = 10;
let query = "your-query-string";
let page: Page<Identity> = await searchIdentities(wsProvider, query, pageNumber, limit);
```

### implementsIdentityPallet
Returns true, if chain of provided wsProvider implements identity pallet.

```
import { implementsIdentityPallet } from "@npmjs_tdsoftware/subidentity"

let wsProvider = "your-ws-provider"
let isImplementingIdentityPallet = await implementsIdentityPallet(wsProvider);
```

## License
Apache License 2.0
# @weirdnest/multi-tenant

## About

This module provides services and helpers for multi-tenant applications.
It helps to separate users by organization and configure roles/permissions.
Can be involved in Nest.js application with TypeORM.

## How it works

It contains services/controllers for User, Tenant, Member, Role and Permissions.
User can create tenants and join tenants created by other users.
Each tenant can have many roles and permissions.
Each permission can be attached to one or more roles.
Each member can have assigned one or many roles. 

## How permissions work

Each role can have attached many permissions.
Every permissions contains filter to limit DB query.
In service methods it combines filters to query the repository.

## Quick start (without DB transactions)


1. Initialize Nest.js application and install dependencies

```bash
#!/bin/bash

nest g application APP_NAME
cd APP_NAME
pnpm install

pnpm add @nestjs/config @nestjs/typeorm typeorm pg joi typeorm-naming-strategies
pnpm add -D @types/pg

```


2. Add @weirdnest/multi-tenant to `package.json` and run `pnpm install`:

```json
"dependencies": [
  "@weirdnest/multi-tenant": "github:weirdnest/multi-tenant"
],
```


3. Optional. For shorter imports add `paths` to `tsconfig.json`:

```json
    "paths": {
      "@w7t/multi-tenant": [
        "node_modules/@weirdnest/multi-tenant/dist/libs/multi-tenant"
      ],
      "@w7t/multi-tenant/*": [
        "node_modules/@weirdnest/multi-tenant/dist/libs/multi-tenant/*"
      ]
    }
```


4. Create `.env` configuration file with corrected values:
```bash
# .env
NODE_ENV='develop'
API_PREFIX='api/v1'

POSTGRES_USER='<POSTGRES_USER>'
POSTGRES_PASSWORD='<POSTGRES_PASSWORD>'
POSTGRES_DB='<POSTGRES_DB>'
POSTGRES_HOST='<POSTGRES_HOST>'
POSTGRES_PORT='<POSTGRES_PORT>'

JWT_ACCESS_TOKEN_SECRET='<LONG_SECRET>'
JWT_ACCESS_TOKEN_EXPIRATION_TIME='3 days'
JWT_REFRESH_TOKEN_SECRET='<LONG_SECRET>'
JWT_REFRESH_TOKEN_EXPIRATION_TIME='7 days'
```

5. Add `multi-tenant.module.ts` to initialize components.

TODO: add link to sample


6. Configure database in `app.module.ts`

TODO: add link to sample


7. Run application

```bash
pnpm start:dev
```


## Complete setup (with DB transactions)
... TODO: describe controllers replacement

## API endpoints
... TODO: add swagger url

## Customization
[@weirdnest/multi-tenant-web](https://github.com/weirdnest/multi-tenant-web3) can be used as reference. It involves custom `UserEntity` and `auth` module to implement login by MetaMask.

TODO: describe more details.

## TODO
- involve end-to-end testing scenarios
- complete unit testing

## License

Weirdnest is [MIT licensed](LICENSE).

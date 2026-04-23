This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).




# Adding New Attributes to the UI (Development Guide)

When you need to add a new attribute to the UI, follow these steps:

1. Navigate to the following file:
   ```
   /Users/shadeer/Desktop/HOME/Frameworks/NextJS/gq-headless/graphql/defs/products.fragments.ts
   ```

2. Add the variant name to the GraphQL query. For example:
   ```graphql
   allPaWarranty {
     nodes {
       name
       slug
     }
   }
   ```

3. The attribute name (e.g., `alPaWarrenty`) can be found in the GraphQL IDE:
   [https://api.gqmobiles.lk/wp-admin/admin.php?page=graphiql-ide](https://api.gqmobiles.lk/wp-admin/admin.php?page=graphiql-ide)

4. Reason for adding: When you enco
unter an "OPTION" on the [slug] page, your task is to add the correct attribute name (e.g., `alPaWarrenty`) in the specified file.

Note: Ensure you use the correct attribute name as found in the GraphQL IDE.

# Removing PayHere from Payment Method for Mobile and Tablets

To disable PayHere as a payment method specifically for mobile devices and tablets, you can follow these steps:

## Step 1: Configure the `hidePayhereForMobileAndTablets` Variable

Define a boolean variable called `hidePayhereForMobileAndTablets`. Setting this value to `true` will hide the PayHere payment method on mobile devices and tablets. If the value is set to `false`, PayHere will remain visible across all device types.

```javascript
let hidePayhereForMobileAndTablets = true; // true means PayHere will be hidden for mobile and tablets
```

Explanation:
* **true**: Hides PayHere payment option on mobile devices and tablets.
* **false**: Keeps PayHere payment option visible on all device types, including mobile and tablets.


## Getting Started

First, run the development server:

THIS PROJECT NEEDS TYPESENSE

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### requirements
node: v21.1.0

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Backend GraphQL caching

The WordPress backend runs WPGraphQL with the **Smart Cache** plugin enabled. Responses for catalog / chrome / sitemap operations are cached in Redis; anything user- or session-scoped (cart, checkout, customer, orders) bypasses cache and hits PHP live.

The policy is an **explicit allowlist** defined in `wp-content/mu-plugins/graphql-cache-skip-session.php` on the server. When you add a new GraphQL operation to the frontend it is **not cached by default**. To opt a new catalog-style operation in:

1. Verify the response is session-independent (no `cart`, `customer`, `viewer` fields).
2. Add the operation name to the `$allow` array in the mu-plugin.
3. Watch `/tmp/smart-cache-audit.log` inside the WP container for 5–10 min to confirm it shows `WOULD_CACHE` only when expected.

User-specific queries stay client-only. `context/CartProvider.tsx` is `'use client'` with `fetchPolicy: 'no-cache'` on every cart query and mutation — Vercel SSR never renders cart state, which is what makes the allowlist safe.

Cache TTL is 10 min; event-based purges (stock updates, product edits, WooGraphQL mutations) invalidate affected entries within a second. See **[docs/PERFORMANCE-WORDPRESS.md](docs/PERFORMANCE-WORDPRESS.md)** for the full allowlist, invalidation hooks, and operational commands.

## Branching and Contribution Flow

Direct pushes to `main` are blocked (including for admins). All changes must go through a pull request.

1. Create a branch off `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feat/short-description
   ```
2. Commit your changes and push the branch.
3. Open a PR against `main`:
   ```bash
   gh pr create
   ```
4. Wait for the `lint` status check to pass and get **one approving review**.
5. Merge via the GitHub UI or `gh pr merge`. Force-pushing to `main` and deleting `main` are disabled.

### CI

GitHub Actions runs on every PR and every `main` push:

- **`lint`** (`.github/workflows/lint.yml`) — runs `npm ci && npm run lint` (ESLint 9, flat config at `eslint.config.mjs`). This check is **required** by branch protection.

To run the same lint locally:

```bash
npm run lint
```

Currently many `react-hooks/*` rules are set to `warn` (not `error`) because Next 16's react-hooks plugin v7 introduced strict rules the codebase hasn't been migrated to. The warnings are tracked work, not blockers.

## Deployment

Deployment is handled by **Vercel's Git integration** — no manual step required:

- **Production:** every merge to `main` triggers a production deploy to Vercel.
- **Preview:** every PR gets a preview deployment; the URL is posted as a check on the PR.

Because `main` is protected, production deploys are always reviewed + lint-checked code.

### Environment variables

Production and preview environment variables are managed in the Vercel project dashboard, not in the repo. Update them there when adding new configuration.



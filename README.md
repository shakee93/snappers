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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.



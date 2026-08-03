import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.NEXT_PUBLIC_WP_GRAPHQL,
  // auth-otp.ts is hand-typed: public introspection is off and those
  // Extended User Signup operations are not in the codegen schema. Including
  // it in the documents glob makes `npm run codegen` fail document validation.
  documents: ["graphql/**/*.ts", "!graphql/defs/auth-otp.ts"],
  generates: {
    "./graphql/types/": {
      preset: "client",
      plugins: []
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
};

export default config;

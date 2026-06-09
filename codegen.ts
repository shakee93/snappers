import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.NEXT_PUBLIC_WP_GRAPHQL,
  documents: "graphql/**/*.ts",
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

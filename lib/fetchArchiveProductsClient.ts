import { print } from "graphql";
import { GET_ARCHIVE_PRODUCTS } from "@/graphql/defs/products";
import type { ArchiveProductsQueryVariables } from "@/lib/archiveFilters";
import { readUsableAuthToken } from "@/lib/clientAuthToken";
import { AUTH_TOKEN_KEY, SESSION_TOKEN_KEY } from "@/utils/storage-keys";
import type { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

const ARCHIVE_PRODUCTS_QUERY = print(GET_ARCHIVE_PRODUCTS);

export type ArchiveProductNode = SimpleProduct & VariableProduct;

export type ArchiveProductsBatch = {
  products: ArchiveProductNode[];
  hasNextPage: boolean;
  endCursor: string | null;
};

function archiveGraphqlHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window === "undefined") return headers;

  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  const authToken = readUsableAuthToken(AUTH_TOKEN_KEY);
  if (sessionToken) {
    headers["woocommerce-session"] = sessionToken.startsWith("Session ")
      ? sessionToken
      : `Session ${sessionToken}`;
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  return headers;
}

/**
 * Browser fetch for archive grids. Avoids Apollo `useLazyQuery` + React state,
 * which can store cache references that render as empty product shells.
 */
export async function fetchArchiveProductsClient(
  variables: ArchiveProductsQueryVariables,
): Promise<ArchiveProductsBatch> {
  const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL;
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_WP_GRAPHQL is not configured");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: archiveGraphqlHeaders(),
    body: JSON.stringify({
      query: ARCHIVE_PRODUCTS_QUERY,
      variables,
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    data?: {
      products?: {
        nodes?: ArchiveProductNode[] | null;
        pageInfo?: {
          hasNextPage?: boolean | null;
          endCursor?: string | null;
        } | null;
      } | null;
    };
    errors?: { message?: string }[];
  };

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "Archive products query failed");
  }

  const nodes = json.data?.products?.nodes ?? [];
  const pageInfo = json.data?.products?.pageInfo;

  return {
    products: nodes.filter((node): node is ArchiveProductNode => node != null),
    hasNextPage: pageInfo?.hasNextPage ?? false,
    endCursor: pageInfo?.endCursor ?? null,
  };
}

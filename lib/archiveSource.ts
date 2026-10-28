/**
 * Archive product grids can load from Typesense (InstantSearch) or directly
 * from WPGraphQL. Use GraphQL when the search cluster still belongs to another
 * tenant (e.g. catlitter API + gqmobiles Typesense) or when explicitly opted in.
 */
export function isGraphqlArchive(): boolean {
  const source = process.env.NEXT_PUBLIC_ARCHIVE_SOURCE;
  if (source === "typesense") return false;
  if (source === "graphql") return true;

  const graphql = (process.env.NEXT_PUBLIC_WP_GRAPHQL ?? "").toLowerCase();
  const typesense = (process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? "").toLowerCase();

  if (!typesense) return true;

  const graphqlIsCatlitter = graphql.includes("catlitter");
  const typesenseIsGq = typesense.includes("gqmobiles");
  const graphqlIsSnappers = graphql.includes("snappers");
  const typesenseIsSnappers = typesense.includes("snappers");

  // Snappers WP has no dedicated Typesense index yet — never query another
  // tenant's search cluster (catlitter / gqmobiles) or category grids stay empty.
  if (graphqlIsSnappers) {
    if (typesenseIsSnappers) return false;
    return true;
  }

  return graphqlIsCatlitter && typesenseIsGq;
}

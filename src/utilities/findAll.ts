import type {
  CollectionSlug,
  PaginatedDocs,
  Payload,
  PayloadRequest,
  SelectType,
  Where,
} from 'payload';

type FindAllArgs = {
  collection: CollectionSlug;
  depth?: number;
  overrideAccess?: boolean;
  pageSize?: number;
  payload: Payload;
  req?: PayloadRequest;
  select?: SelectType;
  sort?: string;
  user?: PayloadRequest['user'];
  where: Where;
};

/**
 * Fetches every document matching `where`, paginating under the hood so callers
 * never silently truncate at an arbitrary `limit`.
 */
export const findAll = async <T = Record<string, unknown>>({
  collection,
  depth = 0,
  overrideAccess,
  pageSize = 200,
  payload,
  req,
  select,
  sort,
  user,
  where,
}: FindAllArgs): Promise<T[]> => {
  const docs: T[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = (await payload.find({
      collection,
      depth,
      limit: pageSize,
      overrideAccess,
      page,
      req,
      select,
      sort,
      user,
      where,
    })) as PaginatedDocs<T>;

    docs.push(...result.docs);
    hasNextPage = result.hasNextPage;
    page += 1;
  }

  return docs;
};

// features/transactions/api/query-keys.ts
type AdminListKey = {
  type: string | null;
  search: string;
  limit: number;
  offset: number;
};

export const transactionKeys = {
  all: ["transactions"] as const,
  mine: (userId: string | null | undefined) =>
    [...transactionKeys.all, "mine", userId] as const,
  detail: (userId: string | null | undefined, entryId: string) =>
    [...transactionKeys.all, "detail", userId, entryId] as const,
  adminList: (params: AdminListKey) =>
    [...transactionKeys.all, "admin", "list", params] as const,
  adminStats: () => [...transactionKeys.all, "admin", "stats"] as const,
};

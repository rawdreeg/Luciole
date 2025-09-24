import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Throws an error if the response is not ok.
 * @param {Response} res - The response to check.
 * @throws {Error} If the response is not ok.
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes a request to the API.
 * @param {string} method - The HTTP method to use.
 * @param {string} url - The URL to request.
 * @param {unknown} [data] - The data to send with the request.
 * @returns {Promise<Response>} A promise that resolves to the response.
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * @type {"returnNull" | "throw"}
 * @description Defines the behavior when an unauthorized response is received.
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Returns a query function for React Query.
 * This function handles fetching data and dealing with unauthorized responses.
 * @param {{ on401: UnauthorizedBehavior }} options - The options for the query function.
 * @returns {QueryFunction<T>} A query function.
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * The React Query client instance.
 * This instance is configured with default options for queries and mutations.
 * @type {QueryClient}
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

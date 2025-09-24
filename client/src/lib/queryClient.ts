import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Token storage helper functions
export const getTokens = () => {
  try {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  } catch {
    return null;
  }
};

export const setTokens = (tokens: { accessToken: string; refreshToken: string } | null) => {
  if (tokens) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  } else {
    localStorage.removeItem('auth_tokens');
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: any) => {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const tokens = getTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add JWT token if available
  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Keep for session-based auth fallback
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const tokens = getTokens();
    const headers: Record<string, string> = {};

    // Add JWT token if available
    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include", // Keep for session-based auth fallback
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

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

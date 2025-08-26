import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(path: string, method: string = "GET", body?: any) {
  try {
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.body = JSON.stringify(body);
    }

    console.log(`API Request: ${method} ${path}`, body ? { body } : {});
    const response = await fetch(path, config);

    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error("API Request Error:", { 
        path, 
        method, 
        body, 
        status: response.status,
        statusText: response.statusText,
        error: responseData 
      });
      throw new Error(responseData?.message || responseData || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`API Response: ${method} ${path}`, responseData);
    return responseData;
  } catch (error) {
    console.error("API Request Error:", { 
      path, 
      method, 
      body, 
      error: error instanceof Error ? error.message : error 
    });
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useStaffAuth() {
  const { data: staff, isLoading, error } = useQuery({
    queryKey: ["/api/staff/me"],
    retry: false,
  });

  return {
    staff,
    isLoading,
    isAuthenticated: !!staff,
    error,
  };
}

// Staff login mutation
export function useStaffLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("/api/staff/login", "POST", { email, password });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/me"] });
    },
  });
}

// Staff logout mutation
export function useStaffLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("/api/staff/logout", "POST");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/staff/me"], null);
      queryClient.clear();
    },
  });
}
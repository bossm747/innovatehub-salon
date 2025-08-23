import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useCustomerAuth() {
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ["/api/customer/me"],
    retry: false,
  });

  return {
    customer,
    isLoading,
    isAuthenticated: !!customer,
    error,
  };
}

// Customer login mutation
export function useCustomerLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ phone, pin }: { phone: string; pin: string }) => {
      const response = await apiRequest("/api/customer/login", "POST", { phone, pin });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
    },
  });
}

// Customer registration mutation
export function useCustomerRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, phone, email, portalPin }: { 
      name: string; 
      phone: string; 
      email: string; 
      portalPin: string; 
    }) => {
      const response = await apiRequest("/api/customer/register", "POST", { name, phone, email, portalPin });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/me"] });
    },
  });
}

// Customer logout mutation
export function useCustomerLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("/api/customer/logout", "POST");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/customer/me"], null);
      queryClient.clear();
    },
  });
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client.js';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrls: string[];
  categoryId: number;
  featured: boolean;
  inStock: boolean;
  categoryName?: string;
}

export interface Settings {
  whatsappNumber: string;
}

export interface AdminSession {
  authenticated: boolean;
}

// Query Keys
export const getGetFeaturedProductsQueryKey = () => ['products', 'featured'];
export const getListCategoriesQueryKey = () => ['categories'];
export const getListProductsQueryKey = (params?: { categoryId?: number }) => ['products', params || {}];
export const getGetProductQueryKey = (id: number) => ['products', id];
export const getGetSettingsQueryKey = () => ['settings'];
export const getGetProductStatsQueryKey = () => ['stats'];
export const getGetAdminMeQueryKey = () => ['admin', 'me'];

// Products
export function useGetFeaturedProducts(options?: any) {
  return useQuery<Product[]>({
    queryKey: getGetFeaturedProductsQueryKey(),
    queryFn: () => api.get<Product[]>('/products/featured'),
    ...options?.query,
  });
}

export function useGetProductStats(options?: any) {
  return useQuery({
    queryKey: getGetProductStatsQueryKey(),
    queryFn: () => api.get<any>('/products/stats'),
    ...options?.query,
  });
}

export function useListProducts(params?: { categoryId?: number }, options?: any) {
  return useQuery<Product[]>({
    queryKey: getListProductsQueryKey(params),
    queryFn: () => {
      const queryStr = params?.categoryId ? `?categoryId=${params.categoryId}` : '';
      return api.get<Product[]>(`/products${queryStr}`);
    },
    ...options?.query,
  });
}

export function useGetProduct(id: number, options?: any) {
  return useQuery<Product>({
    queryKey: getGetProductQueryKey(id),
    queryFn: () => api.get<Product>(`/products/${id}`),
    ...options?.query,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { data: any }) => api.post<any>('/products', variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: number; data: any }) => api.put<any>(`/products/${variables.id}`, variables.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(variables.id) });
      queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: number }) => api.delete<any>(`/products/${variables.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
    },
  });
}

// Categories
export function useListCategories(options?: any) {
  return useQuery<Category[]>({
    queryKey: getListCategoriesQueryKey(),
    queryFn: () => api.get<Category[]>('/categories'),
    ...options?.query,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { data: { name: string } }) => api.post<any>('/categories', variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: number }) => api.delete<any>(`/categories/${variables.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
    },
  });
}

// Settings
export function useGetSettings(options?: any) {
  return useQuery<Settings>({
    queryKey: getGetSettingsQueryKey(),
    queryFn: () => api.get<Settings>('/settings'),
    ...options?.query,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { data: any }) => api.put<any>('/settings', variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    },
  });
}

// Admin Auth
export function useGetAdminMe(options?: any) {
  return useQuery<AdminSession>({
    queryKey: getGetAdminMeQueryKey(),
    queryFn: () => api.get<AdminSession>('/admin/me'),
    ...options?.query,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { data: { password: string } }) => api.post<{ authenticated: boolean }>('/admin/login', variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ authenticated: boolean }>('/admin/logout'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
    },
  });
}

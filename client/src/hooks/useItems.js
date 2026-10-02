import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Server returns: { success: true, data: ... }
const extractData = (res) => res.data?.data ?? res.data;

export const useItems = (params) => {
  return useQuery({
    queryKey: ['items', params],
    queryFn: async () => {
      const res = await api.get('/items', { params });
      return extractData(res);
    },
  });
};

export const useItem = (id) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const res = await api.get(`/items/${id}`);
      return extractData(res);
    },
    enabled: !!id,
  });
};

export const useInfiniteItems = (params) => {
  return useInfiniteQuery({
    queryKey: ['items', 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('/items', {
        params: { ...params, page: pageParam, limit: 24 },
      });
      // Server returns: { success, count, data: [...] }
      const items = res.data?.data ?? [];
      return { items, hasMore: items.length === 24, page: pageParam };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.patch(`/items/${id}`, data);
      return extractData(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/items/favorites');
      return extractData(res);
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, isFavorited }) => {
      if (isFavorited) {
        await api.delete(`/items/favorites/${itemId}`);
      } else {
        await api.post(`/items/favorites/${itemId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

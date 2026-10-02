import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Server returns: { success: true, count: N, data: [...] } or { success: true, data: {...} }
const extractData = (res) => res.data?.data ?? res.data;

export const useBookings = (params) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const res = await api.get('/bookings', { params });
      return extractData(res);
    },
  });
};

export const useBooking = (id) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return extractData(res);
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/bookings', payload);
      return extractData(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, ...payload }) => {
      const res = await api.post(`/bookings/${id}/${action}`, payload);
      return extractData(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const res = await api.post(`/bookings/${id}/cancel`, { reason });
      return extractData(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

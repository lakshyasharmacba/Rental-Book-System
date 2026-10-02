import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDispute = (id) => {
  return useQuery({
    queryKey: ['dispute', id],
    queryFn: async () => {
      const { data } = await api.get(`/disputes/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateDispute = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/disputes', payload);
      return data;
    }
  });
};

export const useDisputeMessages = (disputeId) => {
  return useQuery({
    queryKey: ['dispute-messages', disputeId],
    queryFn: async () => {
      const { data } = await api.get(`/disputes/${disputeId}/messages`);
      return data;
    },
    enabled: !!disputeId,
  });
};

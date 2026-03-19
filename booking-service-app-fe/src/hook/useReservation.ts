import { useQuery, useMutation } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservation.api';
import { queryKeys } from './queryKeys';

import { toast } from 'sonner';

export const useGetReservationByTable = (tableId: string, date: string) => {
  return useQuery({
    queryKey: [...queryKeys.tables, tableId, 'schedules', date],
    queryFn: async () => {
      const res = await reservationsApi.getReservationByTable(tableId, date);
      return res.data;
    },
    enabled: !!tableId && !!date,
  });
};

export const useGetTodayReservations = (date: string) => {
  return useQuery({
    queryKey: [...queryKeys.tables, 'schedules', date],
    queryFn: async () => {
      const res = await reservationsApi.getTodayReservations(date);
      console.log('resp =>', res);
      return res.data;
    },
    enabled: !!date,
  });
};

export const useCreateReservation = () => {
  return useMutation({
    mutationFn: reservationsApi.createReservation,

    onSuccess: () => {
      toast.success('Đặt bàn thành công 🎉');
    },

    onError: (error: any) => {
      console.error('Create reservation error:', error);

      toast.error(error?.response?.data?.message || 'Đặt bàn thất bại');
    },
  });
};

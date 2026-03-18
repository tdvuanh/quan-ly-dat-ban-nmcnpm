import { useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/api/reservationApi';
import { queryKeys } from './queryKeys';

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

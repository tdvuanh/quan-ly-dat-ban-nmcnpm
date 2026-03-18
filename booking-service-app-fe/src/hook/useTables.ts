import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '../api/tables.api';
import { queryKeys } from './queryKeys';

export type Table = {
  table_id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
};

export const useTables = () => {
  return useQuery({
    queryKey: queryKeys.tables,
    queryFn: async () => {
      const res = await tablesApi.getTables();
      return res.data;
    },
  });
};

export const useGetAvailableTables = (date: string, time: string, duration: number) => {
  return useQuery({
    queryKey: queryKeys.availableTables,
    queryFn: async () => {
      const res = await tablesApi.getAvailableTable(date, time, duration);
      return res.data;
    },
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tablesApi.createTable,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables });
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tablesApi.deleteTable,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables });
    },
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: string }) =>
      tablesApi.updateStatus(tableId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables });
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { tablesApi } from '../../api/tables.api';
import { queryKeys } from '../queryKeys';

export const useTables = () => {
  return useQuery({
    queryKey: queryKeys.tables,
    queryFn: tablesApi.getTables,
  });
};

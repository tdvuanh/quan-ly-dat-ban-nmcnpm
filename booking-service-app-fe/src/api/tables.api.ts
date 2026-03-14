import { axiosClient } from './axiosClient';

export const tablesApi = {
  getTables: () => axiosClient.get('/tables'),
};

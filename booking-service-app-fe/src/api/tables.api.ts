import { axiosClient } from './axiosClient';

export const tablesApi = {
  getTables: () => axiosClient.get('/tables'),

  getAvailableTable: (date: string, time: string, duration: number) =>
    axiosClient.get(`/tables/available?date=${date}&time=${time}&duration=${duration}`),

  createTable: (data: any) => axiosClient.post('/tables', data),

  deleteTable: (tableId: string) => axiosClient.delete(`/tables/${tableId}`),

  updateStatus: (tableId: string, status: string) =>
    axiosClient.patch(`/tables/${tableId}`, { status }),
};

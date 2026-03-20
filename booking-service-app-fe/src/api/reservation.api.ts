import { axiosClient } from './axiosClient';

export const reservationsApi = {
  getTodayReservations: (date: string) => axiosClient.get(`/reservations?date=${date}`),

  getReservationByTable: (tableId: string, date: string) =>
    axiosClient.get(`/reservations/table/${tableId}?date=${date}`),

  getCustomerReservationByPhone: (customerPhone: string) =>
    axiosClient.get(`/reservations/by-phone/${customerPhone}`),

  createReservation: (data: any) => axiosClient.post('/reservations', data),

  updateReservation: (data: any) => axiosClient.patch('/reservations', data),

  finishTable: (tableId: string) => axiosClient.patch(`/bookings/table/${tableId}/finish`),
};

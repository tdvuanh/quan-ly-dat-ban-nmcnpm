import { axiosClient } from './axiosClient';

type BookedHoursResponse = {
  booked_hours: string[];
};
export const reservationsApi = {
  getTodayReservations: (date: string) => axiosClient.get(`/reservations?date=${date}`),

  getReservationByTable: (tableId: string, date: string) =>
    axiosClient.get(`/reservations/table/${tableId}?date=${date}`),

  getBookedHours: (tableId: string, date: string) =>
    axiosClient.get<BookedHoursResponse>(`/bookings/table/${tableId}/available-hours?date=${date}`),

  createReservation: (data: any) => axiosClient.post('/reservations', data),

  updateReservation: (data: any) => axiosClient.patch('/reservations', data),

  finishTable: (tableId: string) => axiosClient.patch(`/bookings/table/${tableId}/finish`),

  getNotifications: () => axiosClient.get('/bookings/notifications/all'),

  getUserBookings: (userId: string) => axiosClient.get(`/bookings/${userId}`),
};

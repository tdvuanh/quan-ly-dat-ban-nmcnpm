import { axiosClient } from './axiosClient';


type BookedHoursResponse = {
  booked_hours: string[]
}
export const bookingsApi = {
  getTodayBookings: (date: string) =>
    axiosClient.get(`/bookings?date=${date}`),

 getBookedHours: (tableId: string, date: string) =>
    axiosClient.get<BookedHoursResponse>(
      `/bookings/table/${tableId}/available-hours?date=${date}`
    ),

  createBooking: (data: any) =>
    axiosClient.post('/bookings', data),

  finishTable: (tableId: string) =>
    axiosClient.patch(`/bookings/table/${tableId}/finish`),

  getNotifications: () =>
    axiosClient.get('/bookings/notifications/all'),

  getAvailableTables: (date: string, time: string) =>
  axiosClient.get(`/bookings/tables/available?date=${date}&time=${time}`),

  getUserBookings: (userId: string) =>
  axiosClient.get(`/bookings/${userId}`)
};
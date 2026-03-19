export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type CustomerInfo = {
  customer_name: string;
  customer_phone: string;
  number_of_people: number;
};

export type ReservationTime = {
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:mm
  duration: number;

  checkin_time?: string; // ISO datetime
  checkout_time?: string; // ISO datetime

  note?: string;
};

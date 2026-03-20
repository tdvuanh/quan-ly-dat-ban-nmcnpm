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

export type ReservationTable = {
  table_id: string;
  table_name: string;
  capacity: number;
};

export type Reservation = {
  reservation_id: string;
  customer_id: string;

  checkin_time: string; // ISO string
  checkout_time: string; // ISO string

  number_of_people: number;
  note: string;

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  reservation_tables: ReservationTable[];

  created_at: string; // ISO string
  updated_at: string; // ISO string
};

type BuildReservationTimeInput = {
  reservation_date: string; // ISO: "2026-03-19T08:50:03.352Z"
  reservation_time: string; // "15:30"
  duration: number;
};

export const buildReservationTime = ({
  reservation_date,
  reservation_time,
  duration,
}: BuildReservationTimeInput) => {
  if (!reservation_date || !reservation_time) {
    throw new Error('Missing date or time');
  }

  const baseDate = new Date(reservation_date);

  if (isNaN(baseDate.getTime())) {
    throw new Error('Invalid reservation_date');
  }

  const [hour, minute] = reservation_time.split(':').map(Number);

  if (hour === undefined || minute === undefined) {
    throw new Error('Invalid reservation_time format');
  }

  // 👉 set giờ/phút vào ngày đã parse
  const checkin = new Date(baseDate);
  checkin.setHours(hour, minute, 0, 0);

  if (isNaN(checkin.getTime())) {
    throw new Error('Invalid checkin time');
  }

  const durationMs = duration * 60 * 60 * 1000;
  const checkout = new Date(checkin.getTime() + durationMs);

  return {
    checkin_time: checkin, // Date object
    checkout_time: checkout, // Date object
  };
};

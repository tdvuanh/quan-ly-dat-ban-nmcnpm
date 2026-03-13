export type TableStatus = 'available' | 'reserved' | 'occupied' | 'disabled';

export type Table = {
  table_id: string; // DB trả string (bạn đang serialize)
  name: string; // tên bàn: B11
  capacity: number;
  status: TableStatus;
  area?: string | null;
};

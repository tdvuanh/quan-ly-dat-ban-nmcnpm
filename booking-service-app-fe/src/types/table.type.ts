export type TableStatus = 'available' | 'reserved' | 'occupied' | 'disabled';

export type Table = {
  table_id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  area?: string | null;
};

export type CreateTableFormValues = {
  tableName: string;
  capacity: number;
};

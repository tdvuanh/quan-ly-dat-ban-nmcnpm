import { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form } from 'radix-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { Table } from '@/types/table';
import { Footer } from '@/components/Footer';
import { useNotification } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';

import { Users, Plus, Trash2, LogOut } from 'lucide-react';

import { reservationsApi } from '@/api/reservationApi';
import { useCreateTable, useDeleteTable, useTables, useUpdateTableStatus } from '@/hook/useTables';

type FormValues = {
  tableName: string;
  capacity: number;
};

const generateOperatingHours = () => {
  const hours = [];

  for (let i = 10; i <= 22; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);

    if (i < 22) {
      hours.push(`${i.toString().padStart(2, '0')}:30`);
    }
  }

  return hours;
};

export function AdminDashboard() {
  const navigate = useNavigate();

  const { showSuccess } = useNotification();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  const [bookedHours, setBookedHours] = useState<string[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const timeSlots = generateOperatingHours();

  const { data: { tables } = {} } = useTables();
  const { mutate: createTable } = useCreateTable();
  const { mutate: deleteTable } = useDeleteTable();
  const { mutate: updateTableStatus } = useUpdateTableStatus();

  const fetchTodayBookings = async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await reservationsApi.getTodayReservations(today);

    setTodayBookings(res.data.bookings || []);
  };

  const fetchNotifications = async () => {
    try {
      const res = await reservationsApi.getNotifications();

      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookedHours = async (tableId: string) => {
    const today = new Date().toISOString().split('T')[0];

    const res = await reservationsApi.getBookedHours(tableId, today);

    setBookedHours(res.data.booked_hours ?? []);
  };

  useEffect(() => {
    fetchTodayBookings();
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (!data.tableName.trim()) return;

    createTable({ ...data, status: 'available' });

    showSuccess('Thêm bàn thành công', `Bàn ${data.tableName} đã được thêm`);

    setIsAddDialogOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const data = {
      tableName: String(formData.get('tableName') || '').toUpperCase(),
      capacity: Number(formData.get('capacity')),
    };

    onSubmit(data);
  };

  const handleDeleteTable = (tableId: string) => {
    deleteTable(tableId);
  };

  const handleChangeStatus = async (tableId: string, status: string) => {
    updateTableStatus({ tableId, status });
  };

  const handleServeTable = async (table: Table) => {
    const now = new Date();

    const date = now.toISOString().split('T')[0];

    const time = `${now.getHours().toString().padStart(2, '0')}:00`;

    await reservationsApi.createReservation({
      table_id: Number(table.table_id),
      table_code: table.name,
      guests: table.capacity,
      date,
      time,
      duration: 1,
      deposit_amount: 0,
      payment_method: 'cash',
    });

    handleChangeStatus(table.table_id, 'occupied');

    fetchBookedHours(table.table_id);
  };

  const handleFinishTable = async (tableId: string) => {
    await reservationsApi.finishTable(tableId);

    handleChangeStatus(tableId, 'available');
  };

  const totalTables = tables?.length;

  const availableTables = tables?.filter((t: Table) => t.status === 'available').length;

  const servingTables = tables?.filter((t: Table) => t.status === 'occupied').length;

  const bookedTables = tables?.filter((t: Table) => t.status === 'reserved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';

      case 'occupied':
        return 'bg-orange-100 text-orange-700 border-orange-200';

      case 'disabled':
        return 'bg-gray-100 text-gray-700 border-gray-200';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Trống';

      case 'occupied':
        return 'Bận';

      case 'disabled':
        return 'Dọn';

      case 'reserved':
        return 'Đã đặt';

      default:
        return 'Trống';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-5">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>

          <button
            onClick={() => navigate('/login')}
            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 text-orange-600" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{totalTables}</p>
            <p className="text-xs text-gray-500">Tổng bàn</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableTables}</p>
            <p className="text-xs text-gray-500">Trống</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{servingTables}</p>
            <p className="text-xs text-gray-500">Phục vụ</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{bookedTables}</p>
            <p className="text-xs text-gray-500">Đã đặt</p>
          </Card>
        </div>
      </div>

      {/* CONTENT */}

      <div className="flex-1 p-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bàn
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm bàn mới</DialogTitle>

              <DialogDescription>Điền thông tin bàn</DialogDescription>
            </DialogHeader>

            <Form.Root className="space-y-4" onSubmit={handleSubmit}>
              {/* Tên bàn */}
              <Form.Field name="tableName" className="space-y-1">
                <Form.Label className="text-sm font-medium">Tên bàn</Form.Label>

                <Form.Control asChild>
                  <Input
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="VD: B01, B02..."
                    required
                  />
                </Form.Control>

                <Form.Message match="valueMissing" className="text-sm text-red-500">
                  Không được để trống
                </Form.Message>
              </Form.Field>

              {/* Sức chứa */}
              <Form.Field name="capacity" className="space-y-1">
                <Form.Label className="text-sm font-medium">Sức chứa</Form.Label>

                <Form.Control asChild>
                  <Input
                    type="number"
                    min={1}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="VD: 4"
                    required
                  />
                </Form.Control>

                <Form.Message match="valueMissing" className="text-sm text-red-500">
                  Không được để trống
                </Form.Message>

                <Form.Message match="rangeUnderflow" className="text-sm text-red-500">
                  Phải lớn hơn 0
                </Form.Message>
              </Form.Field>

              {/* Actions */}
              <div className="flex justify-center gap-2 pt-2">
                <Form.Submit asChild>
                  <Button>Thêm bàn</Button>
                </Form.Submit>
              </div>
            </Form.Root>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-3">
          {tables?.map((table: Table) => (
            <Card key={table.table_id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <p>{table.name}</p>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />

                    {table.capacity}
                  </div>
                </div>

                <Badge className={getStatusColor(table.status)}>
                  {getStatusText(table.status)}
                </Badge>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => handleServeTable(table)}>
                  Phục vụ
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFinishTable(table.table_id)}
                >
                  Hoàn thành
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTable(table.table_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

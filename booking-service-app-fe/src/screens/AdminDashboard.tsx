import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Users, Plus, Trash2, LogOut } from 'lucide-react';

import { Input } from '@/components/ui/input';

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

import { tablesApi } from '@/api/tables.api';
import { bookingsApi } from '@/api/bookingsApi';

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

  const [tables, setTables] = useState<Table[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const [bookedHours, setBookedHours] = useState<string[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newTable, setNewTable] = useState({
    code: '',
    capacity: 2,
    status: 'available' as Table['status'],
  });

  const timeSlots = generateOperatingHours();

  const fetchTables = async () => {
    try {
      const res = await tablesApi.getTables();

      const mapped: Table[] = res.data.tables.map((t: any) => ({
        table_id: String(t.table_id),
        name: t.name,
        capacity: t.capacity,
        status: t.status,
        area: 'floor1',
      }));

      setTables(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayBookings = async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await bookingsApi.getTodayBookings(today);

    setTodayBookings(res.data.bookings || []);
  };

  const fetchNotifications = async () => {
    try {
      const res = await bookingsApi.getNotifications();

      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookedHours = async (tableId: string) => {
    const today = new Date().toISOString().split('T')[0];

    const res = await bookingsApi.getBookedHours(tableId, today);

    setBookedHours(res.data.booked_hours ?? []);
  };

  useEffect(() => {
    fetchTables();

    fetchTodayBookings();

    fetchNotifications();
  }, []);

  const handleAddTable = async () => {
    if (!newTable.code.trim()) return;

    await tablesApi.createTable({
      tableName: newTable.code,
      capacity: newTable.capacity,
      status: 'available',
    });

    showSuccess('Thêm bàn thành công', `Bàn ${newTable.code} đã được thêm`);

    setIsAddDialogOpen(false);

    fetchTables();
  };

  const handleDeleteTable = async (tableId: string) => {
    await tablesApi.deleteTable(tableId);

    fetchTables();
  };

  const handleChangeStatus = async (tableId: string, status: string) => {
    await tablesApi.updateStatus(tableId, status);

    fetchTables();
  };

  const handleServeTable = async (table: Table) => {
    const now = new Date();

    const date = now.toISOString().split('T')[0];

    const time = `${now.getHours().toString().padStart(2, '0')}:00`;

    await bookingsApi.createBooking({
      table_id: Number(table.table_id),
      table_code: table.name,
      area: 'floor1',
      guests: table.capacity,
      date,
      time,
      duration: 1,
      deposit_amount: 0,
      payment_method: 'cash',
    });

    await tablesApi.updateStatus(table.table_id, 'occupied');

    fetchTables();

    fetchBookedHours(table.table_id);
  };

  const handleFinishTable = async (tableId: string) => {
    await bookingsApi.finishTable(tableId);

    await tablesApi.updateStatus(tableId, 'available');

    fetchTables();
  };

  const totalTables = tables.length;

  const availableTables = tables.filter((t) => t.status === 'available').length;

  const servingTables = tables.filter((t) => t.status === 'occupied').length;

  const bookedTables = tables.filter((t) => t.status === 'reserved').length;

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

            <Input
              placeholder="Mã bàn"
              value={newTable.code}
              onChange={(e) => setNewTable({ ...newTable, code: e.target.value })}
            />

            <Button onClick={handleAddTable}>Thêm</Button>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-3">
          {tables.map((table) => (
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

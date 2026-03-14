import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

import {
  Calendar,
  Users,
  Clock,
  Bell,
  User,
  Plus,
  Trash2,
  Phone,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import type { Table } from '@/types/table';
import { Footer } from '@/components/Footer';
import { useNotification } from '@/context/NotificationContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useNavigate } from 'react-router-dom';

// Generate time slots từ 10:00 đến 22:00
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
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { showSuccess, showInfo } = useNotification();

  // Booking Dialog State
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedBookingTable, setSelectedBookingTable] = useState<Table | null>(null);
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    phoneNumber: '',
    phoneValidationError: '',
    date: new Date(),
    time: '',
    duration: 1,
    guests: 2,
    notes: '',
  });
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  // Available Hours Dialog State
  const [isAvailableHoursDialogOpen, setIsAvailableHoursDialogOpen] = useState(false);
  const [selectedTableForHours, setSelectedTableForHours] = useState<Table | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newTable, setNewTable] = useState({
    code: '',
    capacity: 2,

    status: 'available' as Table['status'],
  });
  const isTableBookedToday = (tableId: number | string) => {
    return todayBookings.some((b) => b.table_id == tableId);
  };

  const fetchBookedHours = async (tableId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch(
        `http://localhost:3000/api/bookings/table/${tableId}/available-hours?date=${today}`
      );

      if (!res.ok) throw new Error('Failed to fetch hours');

      const data = await res.json();

      setBookedHours(data.booked_hours ?? []);
    } catch (err) {
      console.error(err);
      setBookedHours([]);
    }
  };

  const fetchTodayBookings = async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await fetch(`http://localhost:3000/api/bookings?date=${today}`);

    const data = await res.json();

    setTodayBookings(data.bookings || []);
  };
  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tables');
      const data = await res.json();

      const mapped: Table[] = data.tables.map((t: any) => ({
        table_id: String(t.table_id),
        name: t.name,
        capacity: t.capacity,
        status: t.status,
        area: 'floor1',
      }));

      setTables(mapped);
    } catch (err) {
      console.error('Fetch tables error:', err);
    }
  };
  useEffect(() => {
    fetchTables();
  }, []);
  useEffect(() => {
    fetchTodayBookings();
  }, []);
  const timeSlots = generateOperatingHours();

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
  const handleChangeStatus = async (tableId: string, newStatus: string) => {
    await updateTableStatus(tableId, newStatus);

    fetchTables();
  };

  const handleAddTable = async () => {
    if (!newTable.code.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: newTable.code,
          capacity: newTable.capacity,
          status: 'available',
        }),
      });

      if (!res.ok) throw new Error('Create table failed');

      showSuccess('Thêm bàn thành công', `Bàn ${newTable.code} đã được thêm`);

      setIsAddDialogOpen(false);

      // reload tables từ server
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      await fetch(`http://localhost:3000/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };
  const handleToggleCleaningAvailable = (tableId: string, currentStatus: Table['status']) => {
    let newStatus: Table['status'];

    if (currentStatus === 'disabled') {
      newStatus = 'available';
    } else if (currentStatus === 'available') {
      newStatus = 'disabled';
    } else {
      // If current status is serving or booked, set to cleaning
      newStatus = 'disabled';
    }

    handleChangeStatus(tableId, newStatus);
  };

  const handleOpenBooking = (table: Table) => {
    setSelectedBookingTable(table);
    setBookingData({
      customerName: '',
      phoneNumber: '',
      phoneValidationError: '',
      date: new Date(),
      time: '',
      duration: 1,
      guests: Math.min(2, table.capacity), // Mặc định 2 người hoặc ít hơn nếu bàn nhỏ
      notes: '',
    });
    setIsBookingDialogOpen(true);
  };
  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/bookings/notifications/all');

      const data = await res.json();

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetchTodayBookings();
  }, []);
  const handleConfirmBooking = async () => {
    if (!selectedBookingTable) return;

    try {
      const bookingDateTime = `${bookingData.date.toISOString().split('T')[0]}T${bookingData.time}:00`;

      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_id: Number(selectedBookingTable.table_id),
          table_code: selectedBookingTable.name,
          area: 'floor1',
          guests: bookingData.guests,
          date: bookingData.date.toISOString().split('T')[0],
          time: bookingData.time,
          duration: bookingData.duration,
          deposit_amount: 0,
          payment_method: 'cash',
          customer_name: bookingData.customerName,
          phone: bookingData.phoneNumber,
          notes: bookingData.notes,
        }),
      });

      if (!res.ok) throw new Error('Create booking failed');

      showSuccess('Đặt bàn thành công', `Bàn ${selectedBookingTable.name} đã được đặt`);

      fetchBookedHours(selectedBookingTable.table_id);
      fetchTodayBookings();

      setIsBookingDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  // const getAreaName = (areaId: string) => {
  //   return areas.find((a) => a.id === areaId)?.name || areaId;
  // };
  const handleServeTable = async (table: Table) => {
    try {
      const now = new Date();

      const date = now.toISOString().split('T')[0];

      const minutes = now.getMinutes();
      const roundedMinutes = minutes < 30 ? '00' : '30';

      const time = `${now.getHours().toString().padStart(2, '0')}:${roundedMinutes}`;

      // tạo booking tạm
      await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_id: Number(table.table_id),
          table_code: table.name,
          area: 'floor1',
          guests: table.capacity,
          date,
          time,
          duration: 1,
          deposit_amount: 0,
          payment_method: 'cash',
        }),
      });

      // đổi trạng thái bàn
      await updateTableStatus(table.table_id, 'occupied');

      fetchTables();
      fetchBookedHours(table.table_id);
    } catch (err) {
      console.error(err);
    }
  };
  const handleFinishTable = async (tableId: string) => {
    try {
      await fetch(`http://localhost:3000/api/bookings/table/${tableId}/finish`, {
        method: 'PATCH',
      });

      await updateTableStatus(tableId, 'available');

      fetchTables();
      fetchBookedHours(tableId);
    } catch (err) {
      console.error(err);
    }
  };
  const updateTableStatus = async (tableId: string, status: string) => {
    await fetch(`http://localhost:3000/api/tables/${tableId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-5 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              👨‍💼
            </div>

            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-white/80">Quản lý nhà hàng</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition"
            >
              <Bell className="w-5 h-5 text-white" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                  {notifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
            >
              <LogOut className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{totalTables}</p>
            <p className="text-xs text-gray-500">Tổng bàn</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableTables}</p>
            <p className="text-xs text-gray-500">Trống</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{servingTables}</p>
            <p className="text-xs text-gray-500">Phục vụ</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{bookedTables}</p>
            <p className="text-xs text-gray-500">Đã đặt</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {/* Add Table Button */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="max-w-xs w-full h-12 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-200">
                <Plus className="w-5 h-5 mr-2" />
                Thêm bàn
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl" aria-describedby="add-table-description">
              <DialogHeader>
                <DialogTitle>Thêm bàn mới</DialogTitle>
                <DialogDescription>Điền thông tin để thêm bàn mới vào hệ thống</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tableCode">Mã bàn</Label>
                  <Input
                    id="tableCode"
                    placeholder="Ví dụ: B07, V03"
                    value={newTable.code}
                    onChange={(e) => setNewTable({ ...newTable, code: e.target.value })}
                    className="h-12 rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Sức chứa</Label>
                  <Select
                    value={String(newTable.capacity)}
                    onValueChange={(value) => setNewTable({ ...newTable, capacity: Number(value) })}
                  >
                    <SelectTrigger className="h-12 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 người</SelectItem>
                      <SelectItem value="4">4 người</SelectItem>
                      <SelectItem value="6">6 người</SelectItem>
                      <SelectItem value="8">8 người</SelectItem>
                      <SelectItem value="10">10 người</SelectItem>
                      <SelectItem value="12">12 người</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 h-12 rounded-2xl"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddTable}
                  disabled={!newTable.code.trim()}
                  className="flex-1 h-12 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl"
                >
                  Thêm bàn
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tables List */}
        <div>
          <h3 className="text-gray-900 mb-4">Danh sách bàn ({tables.length})</h3>
          <div className="grid grid-cols-2 gap-2">
            {tables.map((table, index) => (
              <motion.div
                key={table.table_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="p-3 rounded-2xl min-h-[240px] flex flex-col justify-between bg-white">
                  {/* Header: Tên bàn + Khu vực + Sức chứa + Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-gray-900">{table.name}</p>
                      </div>
                      <div className="flex items-baseline gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{table.capacity} người</span>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs rounded-full px-2 py-1 border ${getStatusColor(table.status)}`}
                    >
                      {getStatusText(table.status)}
                    </Badge>
                  </div>

                  {/* Footer: Status Change Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Status Buttons Row: Phục vụ, Xem giờ trống, Đang dọn */}
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        size="sm"
                        variant={table.status === 'occupied' ? 'default' : 'outline'}
                        onClick={() => handleServeTable(table)}
                        disabled={table.status === 'occupied'}
                        className={`text-xs rounded-xl h-8 ${table.status === 'occupied' ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-default' : ''}`}
                      >
                        Phục vụ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBookedHours([]);
                          setSelectedTableForHours(table);
                          fetchBookedHours(table.table_id);
                          setIsAvailableHoursDialogOpen(true);
                        }}
                        className="text-xs rounded-xl h-8 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Giờ trống
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          table.status === 'disabled' || table.status === 'available'
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => handleToggleCleaningAvailable(table.table_id, table.status)}
                        className={`text-xs rounded-xl h-8 ${
                          table.status === 'disabled'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : table.status === 'available'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : ''
                        }`}
                      >
                        {table.status === 'disabled'
                          ? 'Đặt trống'
                          : table.status === 'available'
                            ? 'Đang dọn'
                            : 'Đang dọn'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFinishTable(table.table_id)}
                        className="text-xs rounded-xl h-8 border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Hoàn thành
                      </Button>
                    </div>

                    {/* Delete Button Row */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs rounded-xl text-red-600 border-red-200 hover:bg-red-50 h-8"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Xóa bàn
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa bàn</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa bàn {table.name}? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-2xl">Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTable(table.table_id)}
                            className="rounded-2xl bg-red-600 hover:bg-red-700"
                          >
                            Xóa bàn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 right-6 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <p className="text-sm font-semibold text-gray-900">Thông báo</p>

            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Đóng
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition border-b last:border-none"
              >
                {/* Dot */}
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-snug">{notif.content}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center py-3 bg-gray-50">
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              Xem tất cả
            </button>
          </div>
        </motion.div>
      )}

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đặt bàn cho {selectedBookingTable?.name}</DialogTitle>
            <DialogDescription>Điền thông tin khách hàng và thời gian đặt bàn</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Customer Information */}
            <div>
              <h4 className="text-gray-900 mb-4">Thông tin khách hàng</h4>
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Họ và tên
                  </Label>
                  <Input
                    placeholder="Nhập tên"
                    value={bookingData.customerName}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, customerName: e.target.value })
                    }
                    className="flex-1 h-12 rounded-2xl border-gray-200"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2 relative">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    Số điện thoại
                  </Label>
                  <Input
                    type="tel"
                    placeholder="0912345678"
                    value={bookingData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newBookingData = { ...bookingData, phoneNumber: value };

                      // Kiểm tra liên tục khi nhập
                      if (!value) {
                        newBookingData.phoneValidationError = '';
                      } else if (!/^\d*$/.test(value)) {
                        newBookingData.phoneValidationError = 'Chỉ được nhập số';
                      } else if (!value.startsWith('0')) {
                        newBookingData.phoneValidationError = 'Phải bắt đầu bằng số 0';
                      } else if (value.length < 10) {
                        newBookingData.phoneValidationError = 'Phải có ít nhất 10 số';
                      } else {
                        newBookingData.phoneValidationError = '';
                      }

                      setBookingData(newBookingData);
                    }}
                    className={`h-12 rounded-2xl border-gray-200 ${bookingData.phoneValidationError ? 'border-red-500' : ''}`}
                    maxLength={11}
                  />
                  {bookingData.phoneValidationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 border border-red-200 rounded-xl shadow-sm z-10"
                    >
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {bookingData.phoneValidationError}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Time */}
            <div>
              <h4 className="text-gray-900 mb-4">Thời gian đặt bàn</h4>
              <div className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Ngày đặt
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-2xl border-gray-200 justify-start"
                      >
                        {format(bookingData.date, 'dd/MM/yyyy', { locale: vi })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={bookingData.date}
                        onSelect={(date) => date && setBookingData({ ...bookingData, date })}
                        initialFocus
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Giờ đặt
                  </Label>
                  <Select
                    value={bookingData.time}
                    onValueChange={(value) => setBookingData({ ...bookingData, time: value })}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-gray-200">
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration and Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thời gian (giờ)</Label>
                    <Select
                      value={String(bookingData.duration)}
                      onValueChange={(value) =>
                        setBookingData({ ...bookingData, duration: Number(value) })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 giờ</SelectItem>
                        <SelectItem value="2">2 giờ</SelectItem>
                        <SelectItem value="3">3 giờ</SelectItem>
                        <SelectItem value="4">4 giờ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      Số người
                    </Label>
                    <Select
                      value={String(bookingData.guests)}
                      onValueChange={(value) =>
                        setBookingData({ ...bookingData, guests: Number(value) })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: selectedBookingTable?.capacity || 2 },
                          (_, i) => i + 1
                        ).map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} người
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                Ghi chú
              </Label>
              <Textarea
                placeholder="Ghi chú thêm (nếu có)"
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                className="min-h-[100px] rounded-2xl border-gray-200 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBookingDialogOpen(false)}
              className="flex-1 h-12 rounded-2xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="flex-1 h-12 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl"
            >
              Xác nhận đặt bàn
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Available Hours Dialog */}
      <Dialog open={isAvailableHoursDialogOpen} onOpenChange={setIsAvailableHoursDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Giờ trống - Bàn {selectedTableForHours?.name}</DialogTitle>
            <DialogDescription>Thời gian hoạt động: 10:00 - 22:00</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((hour) => {
                const isBooked = bookedHours.includes(hour);

                return (
                  <motion.button
                    key={hour}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={!isBooked ? { scale: 1.05 } : {}}
                    onClick={() => {
                      if (!isBooked && selectedTableForHours) {
                        // set bàn được chọn
                        setSelectedBookingTable(selectedTableForHours);

                        // set dữ liệu booking
                        setBookingData({
                          customerName: '',
                          phoneNumber: '',
                          phoneValidationError: '',
                          date: new Date(),
                          time: hour, // ⭐ giờ vừa click
                          duration: 1,
                          guests: Math.min(2, selectedTableForHours.capacity),
                          notes: '',
                        });

                        // đóng dialog giờ
                        setIsAvailableHoursDialogOpen(false);

                        // mở dialog đặt bàn
                        setIsBookingDialogOpen(true);
                      }
                    }}
                    disabled={isBooked}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all
                      ${
                        isBooked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-linear-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 hover:shadow-md cursor-pointer border-2 border-green-200'
                      }
                    `}
                  >
                    {hour}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-linear-to-r from-green-50 to-green-100 border-2 border-green-200"></div>
                <span className="text-xs text-gray-600">Giờ trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100"></div>
                <span className="text-xs text-gray-600">Đã đặt</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsAvailableHoursDialogOpen(false)}
            className="w-full h-12 rounded-2xl"
          >
            Đóng
          </Button>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
}

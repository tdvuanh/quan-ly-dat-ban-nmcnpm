import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Calendar, User, Users, Bell, MapPin, Clock } from 'lucide-react';
import type { Table, TableStatus } from '@/types/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Footer } from '@/components/Footer';
import { NotificationPopup } from '@/components/NotificationPopup';
import { useNavigate } from 'react-router-dom';

// Generate time slots từ 10:00 đến 22:00
const generateOperatingHours = () => {
  const hours: string[] = [];
  for (let i = 10; i <= 22; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);
    if (i < 22) {
      hours.push(`${i.toString().padStart(2, '0')}:30`);
    }
  }
  return hours;
};

export function HomeScreen() {
  const navigate = useNavigate();

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);

  // Available Hours Dialog State
  const [isAvailableHoursDialogOpen, setIsAvailableHoursDialogOpen] = useState(false);
  const [selectedTableForHours, setSelectedTableForHours] = useState<Table | null>(null);

  const [bookedHours, setBookedHours] = useState<string[]>([]);

  const timeSlots = generateOperatingHours();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/tables');
        if (!res.ok) throw new Error('Failed to fetch tables');

        const data = await res.json();

        const mapped = data.tables.map((t: any) => ({
          table_id: t.table_id,
          name: t.name,
          capacity: t.capacity,
          status: t.status,
        }));

        setTables(mapped);
      } catch (err) {
        console.error('Fetch tables error:', err);
        setTables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchTodayBookings = async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch(`http://localhost:3000/api/bookings?date=${today}`);

      const data = await res.json();

      setTodayBookings(data.bookings || []);
    };

    fetchTodayBookings();
  }, []);

  const fetchAvailableHours = async (tableId: string) => {
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
  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'reserved':
        return 'Đã đặt';
      case 'occupied':
        return 'Đang sử dụng';
      case 'disabled':
        return 'Ngưng dùng';
    }
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'reserved':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'occupied':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'disabled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  const isTableBookedToday = (tableId: number) => {
    return todayBookings.some((b) => b.table_id === tableId);
  };
  const availableTablesCount = tables.filter((t) => t.status === 'available').length;
  const bookedTablesCount = tables.filter((t) => t.status === 'reserved').length;

  if (loading) {
    return <div className="p-6">Đang tải danh sách bàn...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <div className="ml-3">
              <span className="text-orange-600">Quản Lý Đặt Bàn</span>
              <p className="text-xs text-gray-500">Xin chào! 👋</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              ref={notificationButtonRef}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
            >
              <User className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-linear-to-br from-green-50 to-white border-green-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bàn trống</p>
                  <p className="text-green-600">{availableTablesCount}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-linear-to-br from-orange-50 to-white border-orange-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đặt hôm nay</p>
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date().toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-orange-600">{bookedTablesCount} bàn</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate('/booking')}
            className="max-w-xs w-full h-12 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-200"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Đặt bàn ngay
          </Button>
        </motion.div>

        {/* Tables List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-900">
              Danh sách bàn
              <span className="text-sm text-gray-500 ml-2">({tables.length} bàn)</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tables.map((table, index) => (
              <motion.div
                key={table.table_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-3 rounded-2xl border-2 transition-all min-h-[130px] flex flex-col justify-between bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-900">{table.name}</p>
                      <div className="flex items-baseline gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{table.capacity} người</span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full px-2 py-1 ${
                        isTableBookedToday(Number(table.table_id))
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      {isTableBookedToday(Number(table.table_id)) ? 'Đã đặt' : 'Trống'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();

                        setBookedHours([]);

                        setSelectedTableForHours(table);

                        fetchAvailableHours(table.table_id);

                        setIsAvailableHoursDialogOpen(true);
                      }}
                      className="flex-1 text-xs rounded-xl h-8 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Xem giờ trống
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        anchorRef={notificationButtonRef}
      />

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
                    disabled={isBooked}
                    onClick={() => {
                      if (!isBooked) {
                        navigate('/booking', {
                          state: { tableId: selectedTableForHours?.table_id, time: hour },
                        });
                        setIsAvailableHoursDialogOpen(false);
                      }
                    }}
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

            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-linear-to-r from-green-50 to-green-100 border-2 border-green-200" />
                <span className="text-xs text-gray-600">Giờ trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100" />
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

      <Footer />
    </div>
  );
}

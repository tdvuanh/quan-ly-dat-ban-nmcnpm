import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Calendar, User, Users, MapPin, Clock } from 'lucide-react';
import type { Table } from '@/types/table.type';

import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

import { useTables } from '@/hook/useTables';
import TableHourSlotDialog from '@/components/home/TableHourSlotDialog';
import { useGetTodayReservations } from '@/hook/useReservation';

export function HomeScreen() {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  const [isAvailableHoursDialogOpen, setIsAvailableHoursDialogOpen] = useState(false);
  const [selectedTableForHours, setSelectedTableForHours] = useState<Table | null>(null);

  const { data: tablesResponse, isLoading } = useTables();
  const { data: reservationsResponse } = useGetTodayReservations(today);

  const tables = tablesResponse?.tables ?? [];
  const reservations = reservationsResponse?.data ?? [];

  const bookedTableIdsToday = useMemo(() => {
    return new Set(
      reservations
        ?.map((reservation: any) => Number(reservation.reservation_id))
        .filter((tableId: number) => !Number.isNaN(tableId))
    );
  }, [reservations]);

  const bookedTablesCount = bookedTableIdsToday.size;

  const availableTablesCount = useMemo(() => {
    return tables.filter((table: Table) => !bookedTableIdsToday.has(Number(table.table_id))).length;
  }, [tables, bookedTableIdsToday]);

  const isTableBookedToday = (tableId: number) => bookedTableIdsToday.has(Number(tableId));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Đang tải danh sách bàn...</p>
      </div>
    );
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

          <Button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
          >
            <User className="w-5 h-5 text-orange-600" />
          </Button>
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
            {tables.map((table: Table, index: number) => {
              const isBooked = isTableBookedToday(Number(table.table_id));

              return (
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
                          isBooked
                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}
                      >
                        {isBooked ? 'Đã đặt' : 'Trống'}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTableForHours(table);
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
              );
            })}
          </div>
        </div>
      </div>

      {/* Available Hours Dialog */}
      <TableHourSlotDialog
        isAvailableHoursDialogOpen={isAvailableHoursDialogOpen}
        setIsAvailableHoursDialogOpen={setIsAvailableHoursDialogOpen}
        selectedTable={selectedTableForHours}
      />

      <Footer />
    </div>
  );
}

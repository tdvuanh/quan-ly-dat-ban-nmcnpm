import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useGetReservationByTable } from '@/hook/useReservation';
import { motion } from 'motion/react';

interface TableHourSlotDialogProps {
  selectedTable: any;
  isAvailableHoursDialogOpen: boolean;
  setIsAvailableHoursDialogOpen: (isOpen: boolean) => void;
}

const generateTimeSlots = (date: string, reservations: any[]) => {
  const slots = [];

  const startHour = 10;
  const endHour = 22;

  for (let hour = startHour; hour <= endHour; hour++) {
    for (const min of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;

      const slotTime = new Date(`${date}T${timeStr}:00`);

      const isBooked = reservations?.some((r) => {
        const start = new Date(r.checkin_time);
        const end = new Date(r.checkout_time);

        return slotTime >= start && slotTime < end;
      });

      slots.push({
        time: timeStr,
        isBooked,
      });
    }
  }

  return slots;
};

function TableHourSlotDialog({
  selectedTable,
  isAvailableHoursDialogOpen,
  setIsAvailableHoursDialogOpen,
}: TableHourSlotDialogProps) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const { data: reservations } = useGetReservationByTable(selectedTable?.table_id, today);

  const timeSlot = generateTimeSlots(today, reservations || []);

  return (
    <Dialog open={isAvailableHoursDialogOpen} onOpenChange={setIsAvailableHoursDialogOpen}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle>Giờ trống - Bàn {selectedTable?.name}</DialogTitle>
          <DialogDescription>Thời gian hoạt động: 10:00 - 22:00</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-4 gap-2">
            {timeSlot?.map((slot) => {
              const isBooked = slot?.isBooked ? true : false;
              const onGoBookingScreen = () => {
                if (!isBooked) {
                  navigate('/booking', {
                    state: { tableId: selectedTable?.table_id, time: slot.time },
                  });
                  setIsAvailableHoursDialogOpen(false);
                }
              };

              return (
                <motion.button
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={!isBooked ? { scale: 1.05 } : {}}
                  disabled={isBooked}
                  onClick={onGoBookingScreen}
                  className={`
                      px-3 py-2 rounded-lg text-sm transition-all
                      ${
                        isBooked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-linear-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 hover:shadow-md cursor-pointer border-2 border-green-200'
                      }
                    `}
                >
                  {slot.time}
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
  );
}

export default TableHourSlotDialog;

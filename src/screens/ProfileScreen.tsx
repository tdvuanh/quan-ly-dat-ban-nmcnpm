import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { ArrowLeft, User, Calendar, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { mockUser } from '@/data/mockData';
import { bookingsApi } from "@/api/bookingsApi"
import { walletApi } from "@/api/walletApi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/context/NotificationContext';

import { useNavigate } from 'react-router-dom';

type WalletInfo = {
  wallet_id: string | number;
  user_id: string;
  balance: string | number;
  created_at?: string;
  updated_at?: string;
};

type Booking = {
  id: string;
  user_id: string;
  table_id?: string | null;
  table_code: string;
  tableCode?: string; // FE dùng
  area?: string | null;
  guests: number;
  date: string;
  time: string;
  duration?: number | null;
  deposit_amount: string | number; // Decimal có thể về string
  payment_method?: string | null;
  status: 'confirmed' | 'served' | 'cancelled';
  created_at?: string;
  note?: string;
};

export function ProfileScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [topupAmount, setTopupAmount] = useState<number>(10000);
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const { showSuccess, showInfo } = useNotification();

  const fetchBookings = async () => {
  try {

    const userId = mockUser.user_id

    const res = await bookingsApi.getUserBookings(userId)

    const mapped: Booking[] = (res.data.bookings ?? []).map((b: any) => ({
      ...b,
      tableCode: b.table_code,
      guests: Number(b.guests ?? 0),
      duration: b.duration != null ? Number(b.duration) : null
    }))

    setBookings(mapped)

  } catch (err) {

    showInfo("Lỗi", "Không lấy được lịch sử đặt bàn")

  }
}

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const servedBookings = bookings.filter((b) => b.status === 'served');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Đã xác nhận</Badge>;
      case 'served':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Đã được phục vụ</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Đã hủy</Badge>;
      default:
        return null;
    }
  };

  const fetchWallet = async () => {
  try {

    setIsWalletLoading(true)
    setWalletError(null)

    const res = await walletApi.getWallet(mockUser.user_id)

    setWallet(res.data.wallet)

  } catch (err) {

    setWallet(null)
    setWalletError("Không lấy được ví")

  } finally {

    setIsWalletLoading(false)

  }
}
  const handleTopup = async () => {
  try {

    setIsTopupLoading(true)

    await walletApi.topup({
      user_id: mockUser.user_id,
      amount: topupAmount
    })

    showSuccess("Nạp tiền thành công", `+${topupAmount}`)

    await fetchWallet()

  } catch (err: any) {

    showInfo(
      "Nạp tiền thất bại",
      err?.response?.data?.message ?? "Không nạp được"
    )

  } finally {

    setIsTopupLoading(false)

  }
}
  const BookingCard = ({ booking }: { booking: Booking }) => {
    // Format date and time: hh:mm dd/mm/yyyy
    const formatDateTime = (dateStr: string, timeStr: string) => {
      return `${timeStr} ${dateStr}`;
    };

    return (
      <Card className="p-4 rounded-2xl mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-gray-900">Mã bàn: {booking.tableCode ?? booking.table_code}</p>
              {getStatusBadge(booking.status)}
            </div>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center">{booking.area}</div>
              <div className="flex items-center">
                {formatDateTime(booking.date, booking.time)} ({booking.duration}h)
              </div>
            </div>
          </div>
        </div>
        {booking.note && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Ghi chú: {booking.note}</p>
          </div>
        )}
      </Card>
    );
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    if (!cancelReason.trim()) {
      showInfo('Vui lòng nhập lý do hủy', 'Lý do hủy là bắt buộc');
      return;
    }

    try {
      const bookingId = selectedBooking.id; // ✅ uuid string

      const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason }),
      });

      const data = await res.json();

      if (!res.ok) {
        showInfo('Hủy thất bại', data?.message ?? 'Không hủy được');
        return;
      }

      showSuccess('Đã hủy đặt bàn', 'Booking đã được cập nhật');
      setIsCancelDialogOpen(false);
      setCancelReason('');
      await fetchBookings(); // ✅ reload list để tabs cập nhật
    } catch (e) {
      showInfo('Lỗi', 'Không kết nối được server');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-gray-900">Tài khoản</h2>

          <button
            onClick={() => {
              setIsWalletDialogOpen(true);
              fetchWallet();
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Ví"
            title="Ví"
          >
            <Wallet className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {/* User Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white mb-1">{mockUser.name}</p>
                <div className="text-sm text-white/80 mb-1">{mockUser.email}</div>
                <div className="text-sm text-white/80">{mockUser.phone}</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        {/* Stats (clickable tabs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {/* Đã đặt */}
          <button type="button" onClick={() => setActiveTab('bookings')}>
            <Card
              className={`p-4 rounded-2xl text-center border transition
      ${
        activeTab === 'bookings'
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
            >
              <p className="text-orange-600 mb-1">{confirmedBookings.length}</p>
              <p className="text-xs text-gray-600">Đã đặt</p>
            </Card>
          </button>

          {/* Hoàn tất */}
          <button type="button" onClick={() => setActiveTab('completed')}>
            <Card
              className={`p-4 rounded-2xl text-center border transition
      ${
        activeTab === 'completed'
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
            >
              <p className="text-blue-600 mb-1">{servedBookings.length}</p>
              <p className="text-xs text-gray-600">Hoàn tất</p>
            </Card>
          </button>

          {/* Đã hủy */}
          <button type="button" onClick={() => setActiveTab('cancelled')}>
            <Card
              className={`p-4 rounded-2xl text-center border transition
      ${
        activeTab === 'cancelled'
          ? 'border-red-500 bg-red-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
            >
              <p className="text-red-600 mb-1">{cancelledBookings.length}</p>
              <p className="text-xs text-gray-600">Đã hủy</p>
            </Card>
          </button>
        </motion.div>

        {/* Bookings History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="bookings" className="mt-4">
              {confirmedBookings.length > 0 ? (
                confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="p-8 text-center rounded-2xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">Chưa có đặt bàn nào</p>
                  <Button
                    onClick={() => navigate('/home')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl"
                  >
                    Đặt bàn ngay
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {servedBookings.length > 0 ? (
                servedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              ) : (
                <Card className="p-8 text-center rounded-2xl">
                  <p className="text-gray-600">Chưa có lịch sử hoàn tất</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              {cancelledBookings.length > 0 ? (
                cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="p-8 text-center rounded-2xl">
                  <p className="text-gray-600">Chưa có đặt bàn bị hủy</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hủy đặt bàn {selectedBooking?.tableCode}</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do hủy đặt bàn. Nếu hủy trong vòng 1 giờ trước giờ đặt, tiền cọc sẽ
              không được hoàn lại.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason" className="flex items-center gap-2">
                <span className="text-red-500">*</span>
                Lý do hủy (bắt buộc)
              </Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng nhập lý do hủy đặt bàn..."
                className="min-h-[100px] rounded-2xl border-gray-200 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{cancelReason.length}/500 ký tự</p>
            </div>

            {selectedBooking && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <p className="text-sm text-orange-800">
                  <strong>Lưu ý:</strong> Thời gian đặt bàn: {selectedBooking.time}{' '}
                  {selectedBooking.date}
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  • Hủy trước 1h: Hoàn cọc 100%
                  <br />• Hủy trong vòng 1h: Không hoàn cọc
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason('');
              }}
              className="flex-1 h-12 rounded-2xl"
            >
              Quay lại
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={!cancelReason.trim()}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Dialog */}
      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ví của bạn</DialogTitle>
            <DialogDescription>Thông tin ví</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border p-4">
              <p className="text-xs text-gray-500">User ID</p>
              <p className="mt-1 text-sm font-medium break-all">{mockUser.user_id}</p>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-xs text-gray-500">Tên</p>
              <p className="mt-1 text-sm font-medium">{mockUser.name}</p>
            </div>

            {isWalletLoading ? (
              <div className="rounded-2xl border p-4 text-sm text-gray-600">Đang tải ví...</div>
            ) : walletError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {walletError}
              </div>
            ) : (
              <>
                <div className="rounded-2xl border p-4">
                  <p className="text-xs text-gray-500">Wallet ID</p>
                  <p className="mt-1 text-sm font-medium">
                    {wallet?.wallet_id ?? 'Chưa có ví (hãy topup để tạo)'}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-xs text-gray-500">Số dư</p>
                  <p className="mt-1 text-sm font-medium">{wallet?.balance ?? 0}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <div className="rounded-2xl border p-4">
              <p className="text-xs text-gray-500 mb-2">Số tiền nạp</p>
              <input
                type="number"
                min={1000}
                step={1000}
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none"
                placeholder="Nhập số tiền"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={handleTopup}
                disabled={isTopupLoading || topupAmount <= 0}
                className="flex-1 h-12 rounded-2xl"
              >
                {isTopupLoading ? 'Đang nạp...' : 'Nạp tiền'}
              </Button>

              <Button
                onClick={() => setIsWalletDialogOpen(false)}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

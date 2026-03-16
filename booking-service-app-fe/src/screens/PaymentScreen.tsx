import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { walletApi } from '@/api/walletApi';
import { bookingsApi } from '@/api/bookingsApi';

import { motion } from 'motion/react';
import {
  ArrowLeft,
  QrCode,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Clock,
  Wallet,
} from 'lucide-react';

import { Footer } from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockUser } from '@/data/mockData';

interface PaymentScreenProps {
  bookingData?: any;
}
type WalletInfo = {
  wallet_id: number | string;
  user_id: string;
  balance: number;
};

export function PaymentScreen(props: PaymentScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentMethod, setPaymentMethod] = useState<'banking' | 'wallet'>('banking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const bookingData = (location.state as any) ?? props.bookingData;
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const depositAmount = 50000; // 50k VND deposit

  const hasEnoughBalance = paymentMethod !== 'wallet' || (wallet?.balance ?? 0) >= depositAmount;
  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError(null);

      const userId = bookingData?.user_id ?? mockUser.user_id;

      const res = await walletApi.getWallet(userId);

      const w = res.data.wallet;

      setWallet({
        wallet_id: w.wallet_id,
        user_id: w.user_id,
        balance: typeof w.balance === 'string' ? Number(w.balance) : w.balance,
      });
    } catch (err) {
      setWallet(null);
      setWalletError('Không lấy được ví');
    } finally {
      setWalletLoading(false);
    }
  };
  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayment = async () => {
    if (isProcessing) return;

    setPaymentError(null);

    if (paymentMethod === 'banking') {
      setPaymentError('Chức năng đang bảo trì');
      return;
    }

    if (!wallet) {
      setPaymentError('Không lấy được ví');
      return;
    }

    if (wallet.balance < depositAmount) {
      setPaymentError('Số dư không đủ');
      return;
    }

    const userId = bookingData?.user_id ?? mockUser.user_id;

    try {
      setIsProcessing(true);

      const bookingRes = await bookingsApi.createBooking({
        user_id: userId,
        table_code: bookingData?.tableCode,
        table_id: bookingData?.tableId,
        guests: bookingData?.guests,
        date: bookingData?.date,
        time: bookingData?.time,
        duration: bookingData?.duration,
        deposit_amount: depositAmount,
        payment_method: paymentMethod,
      });

      const bookingId = bookingRes.data.booking.id;

      await walletApi.payDeposit({
        user_id: userId,
        booking_id: bookingId,
        amount: depositAmount,
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/payment-success', {
          state: {
            ...bookingRes.data.booking,
            amount: depositAmount,
            paymentMethod,
          },
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Thanh toán thất bại');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-6">
              {/* vòng ripple */}
              <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping"></div>

              {/* vòng chính */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl shadow-green-300">
                <CheckCircle2 className="w-12 h-12 text-white stroke-[3]" />
              </div>
            </div>

            <h2 className="text-green-600 font-semibold text-lg">Thanh toán thành công!</h2>

            <p className="text-gray-500 text-sm mt-1">Đang chuyển hướng...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/confirmation', { state: { ...bookingData } })}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-gray-900">Thanh toán</h2>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-6"
        >
          {/* Booking Summary */}
          <Card className="p-6 rounded-3xl shadow-lg bg-linear-to-br from-orange-50 to-white border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Thông tin đặt bàn</h3>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">Đặt cọc</Badge>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-600">Mã bàn</p>
                </div>
                <p className="text-gray-900">{bookingData?.tableCode}</p>
              </div>

              {/* <div className="p-3 bg-white rounded-2xl">
                
                <p className="text-gray-900">{bookingData?.area}</p>
              </div> */}

              <div className="p-3 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-600">Ngày đặt</p>
                </div>
                <p className="text-gray-900">{bookingData?.date}</p>
              </div>

              <div className="p-3 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-600">Giờ đặt</p>
                </div>
                <p className="text-gray-900">{bookingData?.time}</p>
              </div>

              <div className="p-3 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-600">Số khách</p>
                </div>
                <p className="text-gray-900">{bookingData?.guests} người</p>
              </div>

              <div className="p-3 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-600">Thời gian</p>
                </div>
                <p className="text-gray-900">{bookingData?.duration} giờ</p>
              </div>
            </div>

            <div className="pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Tiền đặt cọc</span>
                <span className="text-orange-600">{depositAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <div>
            <h3 className="text-gray-900 mb-4">Phương thức thanh toán</h3>

            <div className="space-y-3">
              {paymentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}
              {/* Banking */}
              <Card
                onClick={() => {
                  setPaymentMethod('banking');
                  setPaymentError(null);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition
        ${paymentMethod === 'banking' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}
      `}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-3">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-gray-500">QR Banking, Internet Banking</p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2
            ${paymentMethod === 'banking' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}
          `}
                  />
                </div>
              </Card>

              {/* Wallet */}
              <Card
                onClick={() => {
                  setPaymentMethod('wallet');
                  setPaymentError(null);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition
        ${paymentMethod === 'wallet' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}
      `}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mr-3">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-900">Thanh toán bằng ví</p>

                    {walletLoading ? (
                      <p className="text-xs text-gray-500">Đang tải số dư...</p>
                    ) : walletError ? (
                      <p className="text-xs text-red-600">{walletError}</p>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Số dư:{' '}
                        <span className="font-medium">
                          {(wallet?.balance ?? 0).toLocaleString('vi-VN')}đ
                        </span>
                        {paymentMethod === 'wallet' &&
                          ((wallet?.balance ?? 0) < depositAmount ? (
                            <div className="text-xs text-red-600">
                              Thiếu{' '}
                              {(depositAmount - (wallet?.balance ?? 0)).toLocaleString('vi-VN')}đ để
                              đặt cọc
                            </div>
                          ) : (
                            <div className="text-xs text-green-600">Đủ số dư để đặt cọc</div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2
            ${paymentMethod === 'wallet' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}
          `}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={
              isProcessing || walletLoading || (paymentMethod === 'wallet' && !hasEnoughBalance)
            }
            className="w-full h-14 ..."
          >
            {paymentMethod === 'wallet' && !hasEnoughBalance ? (
              'Số dư không đủ'
            ) : isProcessing ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              <>Thanh toán {depositAmount.toLocaleString('vi-VN')}đ</>
            )}
          </Button>

          {/* Security Note */}
          <Card className="p-4 rounded-2xl bg-green-50 border-green-100">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-900 mb-1">Thanh toán an toàn</p>
                <p className="text-xs text-green-700">
                  Thông tin của bạn được mã hóa và bảo mật theo tiêu chuẩn PCI DSS
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-white px-6 py-4">
        <Footer />
      </div>
    </div>
  );
}

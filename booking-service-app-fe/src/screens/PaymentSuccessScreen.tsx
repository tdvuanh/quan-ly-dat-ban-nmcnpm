import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { CheckCircle, Home, Receipt, Check } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';

export function PaymentSuccessScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const paymentData = state as any;

  const bookingCode = `BK${Date.now().toString().slice(-6)}`;

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'wallet':
        return 'Thanh toán bằng ví';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      default:
        return method ?? 'Không rõ';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      <div className="flex-1 overflow-auto px-6 py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200"
            >
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </motion.div>
            <h2 className="text-green-600 mb-2">Đặt bàn thành công!</h2>
            <p className="text-gray-600">Cảm ơn bạn đã đặt bàn.</p>
          </div>

          {/* Booking Code */}
          <Card className="p-6 rounded-3xl shadow-lg mb-4 bg-gradient-to-br from-orange-500 to-orange-600">
            <div className="text-center">
              <p className="text-sm text-white mb-2">Mã đặt bàn</p>

              <p className="text-2xl font-bold tracking-widest text-white drop-shadow-lg mb-4">
                {bookingCode}
              </p>

              <Badge className="bg-white/20 text-white border-white/30">Đã xác nhận</Badge>
            </div>
          </Card>

          {/* Booking Details */}
          <Card className="p-6 rounded-3xl shadow-lg mb-4">
            <div className="flex items-center mb-4">
              <Receipt className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="text-gray-900">Chi tiết đặt bàn</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Bàn số</span>
                <span className="text-gray-900">{paymentData?.table_code ?? '-'}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Số khách</span>
                <span className="text-gray-900">{paymentData?.guests ?? '-'} người</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Ngày đặt</span>
                <span className="text-gray-900">{paymentData?.date ?? '-'}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Giờ đặt</span>
                <span className="text-gray-900">{paymentData?.time ?? '-'}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Phương thức</span>
                <span className="text-gray-900">
                  {getPaymentMethodText(paymentData?.paymentMethod)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-900">Đã thanh toán</span>
                <span className="text-orange-600">
                  {Number(paymentData?.amount ?? 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/home')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>

            <button
              onClick={() => navigate('/profile')}
              className="w-full text-center text-sm text-gray-600 py-2"
            >
              Xem lịch sử đặt bàn
            </button>
          </div>

          <Card className="mt-6 p-4 rounded-2xl bg-blue-50 border-blue-100">
            <p className="text-sm text-blue-900 mb-1">📱 Thông tin quan trọng</p>
            <p className="text-xs text-blue-700 mb-2">
              Vui lòng lưu lại mã đặt bàn <span className="font-medium">{bookingCode}</span>.
            </p>
            <p className="text-xs text-blue-700">
              Liên hệ: <span className="font-medium">1900 1234</span> nếu cần hỗ trợ.
            </p>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

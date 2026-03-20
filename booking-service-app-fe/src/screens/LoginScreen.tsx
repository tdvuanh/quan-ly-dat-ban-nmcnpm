import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Users, UserCog } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '@/store';
import { Form } from 'radix-ui';
import { Input } from '@/components/ui/input';
import { useCustomerLogin } from '@/hook/useCustomet';

interface LoginScreenProps {
  onLogin: (role: 'guest' | 'staff') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigate = useNavigate();
  const { setCustomer } = useStore();

  const { mutate, isPending } = useCustomerLogin();

  const [mode, setMode] = useState<'select' | 'customer'>('select');

  const handleGuestSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const guestData = {
      customer_name: String(formData.get('customer_name') || ''),
      customer_phone: String(formData.get('customer_phone') || ''),
    };

    mutate(
      { full_name: guestData.customer_name, phone: guestData.customer_phone },
      {
        onSuccess: () => {
          setCustomer(guestData);
          navigate('/home', { replace: true });
        },
      }
    );
  };

  const onStaffLogin = () => {
    onLogin('staff');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col px-6 py-8">
      {/* Logo */}
      <div className="flex items-center mb-12">
        <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-2xl">🍽️</span>
        </div>
        <span className="ml-3 text-orange-600">Quản Lý Đặt Bàn</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          {/* SELECT ROLE */}
          {mode === 'select' && (
            <>
              <div className="text-center mb-12">
                <h1 className="text-gray-900 mb-2">Quản Lý Đặt Bàn</h1>
                <p className="text-gray-600">Chọn vai trò để tiếp tục</p>
              </div>

              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Button
                    onClick={() => setMode('customer')}
                    className="w-full h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-start px-8"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mr-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white mb-1">Khách hàng</p>
                      <p className="text-sm text-white/80">Đặt bàn & xem menu</p>
                    </div>
                  </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Button
                    onClick={onStaffLogin}
                    variant="outline"
                    className="w-full h-20 rounded-2xl border-2 border-orange-200 hover:bg-orange-50 flex items-center justify-start px-8"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mr-4">
                      <UserCog className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900 mb-1">Nhân viên</p>
                      <p className="text-sm text-gray-600">Quản lý đặt bàn</p>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </>
          )}

          {/* CUSTOMER FORM */}
          {mode === 'customer' && (
            <Form.Root onSubmit={handleGuestSubmit}>
              <div className="text-center mb-8">
                <h1 className="text-gray-900 mb-2">Thông tin khách hàng</h1>
                <p className="text-gray-600">Nhập để tiếp tục</p>
              </div>

              <div className="space-y-4">
                <Form.Field name="customer_name">
                  <Form.Control asChild>
                    <Input
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Tên khách hàng"
                      required
                    />
                  </Form.Control>
                </Form.Field>
                <Form.Field name="customer_phone">
                  <Form.Control asChild>
                    <Input
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Số điện thoại"
                      required
                    />
                  </Form.Control>
                </Form.Field>
                <Form.Submit asChild>
                  <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                    {isPending ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      <>Đăng nhập</>
                    )}
                  </Button>
                </Form.Submit>

                <Button variant="ghost" onClick={() => setMode('select')} className="w-full">
                  ← Quay lại
                </Button>
              </div>
            </Form.Root>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

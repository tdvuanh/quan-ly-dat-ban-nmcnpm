import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form } from 'radix-ui';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Calendar, Clock, MessageSquare, User, Phone } from 'lucide-react';
import { areas, generateTimeSlots } from '@/data/mockData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Footer } from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetAvailableTables } from '@/hook/useTables';
import type { Table } from '@/types';
import { FormControl } from '@radix-ui/react-form';
import { useStore } from '@/store';

interface BookingScreenProps {
  initialData?: { tableId?: number };
}

const getCurrentTime = () => {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes() < 30 ? '00' : '30';
  return `${h}:${m}`;
};

export function BookingScreen({ initialData }: BookingScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { customer } = useStore();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState(location?.state?.time || getCurrentTime());
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [guests, setGuests] = useState(2);

  const [phoneValidationError, setPhoneValidationError] = useState('');

  const timeSlots = generateTimeSlots();

  const { data: availableTablesData = [] } = useGetAvailableTables(
    format(date, 'yyyy-MM-dd'),
    selectedTime,
    duration
  );

  // Update guests when table is selected
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    if (table) setGuests(Math.min(2, table.capacity));
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const isValid =
      formData.get('customer_name') &&
      formData.get('customer_phone') &&
      formData.get('reservation_date') &&
      formData.get('duration') &&
      formData.get('table_id');

    if (!isValid) {
      alert('Thiếu thông tin');
      return;
    }

    const reservationData = {
      customer_name: String(formData.get('customer_name')),
      customer_phone: String(formData.get('customer_phone')),
      number_of_people: Number(formData.get('number_of_people')),
      reservation_date: formData.get('reservation_date'),
      reservation_time: String(formData.get('reservation_time')),
      duration: Number(formData.get('duration')),
      note: String(formData.get('note')),
      table_id: selectedTable?.table_id,
      selected_table: selectedTable,
    };

    navigate('/confirmation', { state: reservationData });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-gray-900">Đặt bàn</h2>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <Form.Root onSubmit={handleOnSubmit}>
        <div className="flex-1 overflow-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl mx-auto"
          >
            {/* Customer Information and Time Selection - 2 Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card className="p-6 rounded-3xl shadow-sm">
                <h3 className="text-gray-900 mb-4">Thông tin khách hàng</h3>

                <div className="space-y-4">
                  {/* Name */}
                  <Form.Field name="customer_name">
                    <div className="space-y-2">
                      <Form.Label className="flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-500" />
                        Họ và tên <p className="text-red-500">*</p>
                      </Form.Label>
                      <Form.Control asChild>
                        <Input
                          required
                          type="text"
                          value={customer?.customer_name}
                          readOnly
                          placeholder="Nhập tên"
                          className="h-12 rounded-2xl border-gray-200 flex-1"
                        />
                      </Form.Control>
                    </div>
                  </Form.Field>

                  {/* Phone Number */}
                  <Form.Field name="customer_phone">
                    <div className="space-y-2 relative">
                      <Form.Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-500" />
                        Số điện thoại <p className="text-red-500">*</p>
                      </Form.Label>
                      <Form.Control asChild>
                        <Input
                          required
                          type="tel"
                          value={customer?.customer_phone}
                          readOnly
                          onChange={(e) => {
                            const value = e.target.value;
                            // Kiểm tra liên tục khi nhập
                            if (!value) {
                              setPhoneValidationError('');
                            } else if (!/^\d*$/.test(value)) {
                              setPhoneValidationError('Chỉ được nhập số');
                            } else if (!value.startsWith('0')) {
                              setPhoneValidationError('Phải bắt đầu bằng số 0');
                            } else if (value.length < 10) {
                              setPhoneValidationError('Phải có ít nhất 10 số');
                            } else {
                              setPhoneValidationError('');
                            }
                          }}
                          placeholder="Nhâp số điện thoại"
                          className={`h-12 rounded-2xl border-gray-200 ${phoneValidationError ? 'border-red-500' : ''}`}
                          maxLength={11}
                        />
                      </Form.Control>
                      {phoneValidationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 border border-red-200 rounded-xl shadow-sm z-10"
                        >
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <span>⚠️</span> {phoneValidationError}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </Form.Field>

                  {/* Guests */}
                  <Form.Field name="number_of_people">
                    <div className="space-y-2">
                      <Form.Label className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        Số lượng khách
                      </Form.Label>
                      <Form.Control asChild>
                        <Select
                          required
                          value={String(guests)}
                          onValueChange={(value) => setGuests(Number(value))}
                          disabled={!selectedTable}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-gray-200">
                            <SelectValue
                              placeholder={selectedTable ? 'Chọn số người' : 'Chọn bàn trước'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTable ? (
                              Array.from({ length: selectedTable.capacity }, (_, i) => i + 1).map(
                                (num) => (
                                  <SelectItem key={num} value={String(num)}>
                                    {num} người
                                  </SelectItem>
                                )
                              )
                            ) : (
                              <SelectItem value="0" disabled>
                                Vui lòng chọn bàn trước
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </Form.Control>
                      {selectedTable && (
                        <p className="text-xs text-gray-500">
                          Tối đa {selectedTable.capacity} người
                        </p>
                      )}
                    </div>
                  </Form.Field>
                </div>
              </Card>

              {/* Date and Time Selection */}
              <Card className="p-6 rounded-3xl shadow-sm">
                <h3 className="text-gray-900 mb-4">Thời gian đặt bàn</h3>

                <div className="space-y-4">
                  {/* Date */}
                  <Form.Field name="reservation_date">
                    <div className="space-y-2">
                      <Form.Label htmlFor="date" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        Ngày đặt <p className="text-red-500">*</p>
                      </Form.Label>
                      <Form.Control asChild>
                        <Input
                          required
                          type="hidden"
                          name="reservation_date"
                          value={date ? date.toISOString() : ''}
                        />
                      </Form.Control>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 text-gray-900 justify-start font-normal"
                          >
                            <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                            {format(date, 'EEEE, dd MMMM yyyy', { locale: vi })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={(date) => date && setDate(date)}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const maxDate = new Date();
                              maxDate.setDate(maxDate.getDate() + 30);
                              return date < today || date > maxDate;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </Form.Field>

                  {/* Time */}
                  <Form.Field name="reservation_time">
                    <div className="space-y-2">
                      <Form.Label htmlFor="time" className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Giờ đặt (10:00 - 22:00) <p className="text-red-500">*</p>
                      </Form.Label>
                      <Form.Control asChild>
                        <Select
                          required
                          value={selectedTime}
                          onValueChange={(value) => {
                            setSelectedTime(value);
                          }}
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
                      </Form.Control>
                    </div>
                  </Form.Field>

                  {/* Duration */}
                  <Form.Field name="duration">
                    <div className="space-y-2">
                      <Form.Label className="flex items-center gap-2">
                        Thời gian (giờ) <p className="text-red-500">*</p>
                      </Form.Label>
                      <Form.Control asChild>
                        <Select
                          required
                          value={duration.toString()}
                          onValueChange={(v) => setDuration(Number(v))}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 giờ</SelectItem>
                            <SelectItem value="1.5">1.5 giờ</SelectItem>
                            <SelectItem value="2">2 giờ</SelectItem>
                            <SelectItem value="2.5">2.5 giờ</SelectItem>
                            <SelectItem value="3">3 giờ</SelectItem>
                          </SelectContent>
                        </Select>
                      </Form.Control>
                    </div>
                  </Form.Field>
                </div>
              </Card>
            </div>

            {/* Notes */}
            <Form.Field name="note">
              <Card className="p-6 rounded-3xl shadow-sm">
                <div className="space-y-2">
                  <Form.Label htmlFor="notes" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    Ghi chú
                  </Form.Label>
                  <Form.Control asChild>
                    <Textarea
                      id="notes"
                      placeholder="Yêu cầu đặc biệt (nếu có)"
                      className="h-24 rounded-2xl border-gray-200"
                    />
                  </Form.Control>
                </div>
              </Card>
            </Form.Field>

            {/* Table Selection */}
            <Form.Field name="table_id">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Chọn bàn</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {availableTablesData?.length} bàn trống
                  </Badge>
                </div>

                {availableTablesData?.length === 0 ? (
                  <Card className="p-8 text-center rounded-2xl">
                    <p className="text-gray-500 mb-2">Không có bàn trống</p>
                    <p className="text-sm text-gray-400">Vui lòng chọn thời gian khác</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <FormControl asChild>
                      <input type="hidden" value={selectedTable?.table_id || ''} />
                    </FormControl>
                    {availableTablesData?.map((table: Table, index: number) => {
                      const areaName =
                        areas.find((a) => a.id === table.area)?.name || table.area || '';
                      return (
                        <motion.div
                          key={table.table_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            onClick={() => handleTableSelect(table)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                              selectedTable?.table_id === table.table_id
                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-gray-900">{table.name}</p>
                                <p className="text-xs text-gray-500">{areaName}</p>
                              </div>
                              {selectedTable?.table_id === table.table_id && (
                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-1" />
                              {table.capacity} người
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Form.Field>
            <Form.Submit asChild>
              <Button
                // disabled={!selectedTableId || !date || !selectedTime || !customerName || !phoneNumber}
                className="w-full h-12 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận đặt bàn
              </Button>
            </Form.Submit>
          </motion.div>
        </div>
      </Form.Root>

      {/* Footer */}
      <div className="bg-white shadow-sm px-6 py-4">
        <Footer />
      </div>
    </div>
  );
}

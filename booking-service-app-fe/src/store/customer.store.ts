import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Customer = {
  customer_name: string;
  customer_phone: string;
};

type CustomerStore = {
  customer: Customer | null;

  setCustomer: (data: Customer) => void;
  clearCustomer: () => void;
  updateCustomer: (data: Partial<Customer>) => void;
};

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,

      setCustomer: (data) => set({ customer: data }),
      clearCustomer: () => set({ customer: null }),
      updateCustomer: (data) =>
        set((state) => ({
          customer: state.customer ? { ...state.customer, ...data } : null,
        })),
    }),
    {
      name: 'customer-storage',
    }
  )
);

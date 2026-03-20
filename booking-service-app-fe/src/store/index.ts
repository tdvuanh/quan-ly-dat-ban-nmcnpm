import { useCustomerStore } from './customer.store';

export const useStore = () => ({
  customer: useCustomerStore((s) => s.customer),
  setCustomer: useCustomerStore((s) => s.setCustomer),
  clearCustomer: useCustomerStore((s) => s.clearCustomer),
  updateCustomer: useCustomerStore((s) => s.updateCustomer),
});

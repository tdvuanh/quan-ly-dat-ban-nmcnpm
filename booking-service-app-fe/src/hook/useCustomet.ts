import { useMutation } from '@tanstack/react-query';
import { customerApi } from '../api/customer.api';

export const useCustomerLogin = () => {
  return useMutation({
    mutationFn: customerApi.guestLogin,
  });
};

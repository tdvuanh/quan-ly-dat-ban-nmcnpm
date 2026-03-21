import { useMutation } from '@tanstack/react-query';
import { userApi, type StaffLoginPayload } from '@/api/user.api';
import type { AxiosResponse } from 'axios';

type LoginResponse = {
  message: string;
  data: {
    user_id: string;
    user_name: string;
    role: string;
  };
};

export const useAdminLogin = () => {
  return useMutation<AxiosResponse<LoginResponse>, Error, StaffLoginPayload>({
    mutationFn: userApi.loginAdmin,
  });
};

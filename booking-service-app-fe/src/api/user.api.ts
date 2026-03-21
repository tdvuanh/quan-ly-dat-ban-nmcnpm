import { axiosClient } from './axiosClient';

export type StaffLoginPayload = {
  user_name: string;
  password: string;
};

export const userApi = {
  loginAdmin: (data: StaffLoginPayload) => axiosClient.post('/users/login', data),
};

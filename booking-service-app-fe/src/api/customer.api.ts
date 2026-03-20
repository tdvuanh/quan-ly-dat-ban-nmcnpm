import { axiosClient } from './axiosClient';

type GuestLoginPayload = {
  full_name: string;
  phone: string;
};

export const customerApi = {
  guestLogin: (data: GuestLoginPayload) => axiosClient.post('/customers/guest-login', data),
};

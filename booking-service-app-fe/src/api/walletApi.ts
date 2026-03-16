import { axiosClient } from './axiosClient';

export const walletApi = {
  getWallet: (userId: string) => axiosClient.get(`/wallet/${userId}`),

  topup: (data: { user_id: string; amount: number }) => axiosClient.post('/wallet/topup', data),

  payDeposit: (data: any) => axiosClient.post('/wallet/pay-deposit', data),
};

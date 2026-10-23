export type AdminSettings = {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  depositBtc: string;
  depositEth: string;
  depositUsdt: string;
  allowWithdrawals: boolean;
  allowInvestments: boolean;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
};

export type SettingsMeta = {
  updatedAt: string | null;
  updatedBy: string | null;
};
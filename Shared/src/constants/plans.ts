export const PLANS_CONFIG = {
  free: {
    tier: "free",
    gameBankLimit: 1000,
    linkedAccountLimit: 2,
    aiEnabled: false,
    analyticsEnabled: false,
    sharingEnabled: false,
  },
  // pro: {
  //   tier: "pro",
  //   gameBankLimit: 10000,
  //   linkedAccountLimit: 10,
  //   aiEnabled: true,
  //   analyticsEnabled: true,
  //   sharingEnabled: true,
  // },
} as const;

export const planTypes = ["free", "pro"] as const;
export type PlanType = (typeof planTypes)[number];

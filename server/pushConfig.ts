const VAPID_PUBLIC_KEY = "BNvXf9_8-T-R_0G5Z-Jv1jW-C_uO_t-E_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q";
const VAPID_PRIVATE_KEY = "PRIVATE_KEY_HERE"; // User should generate their own

export const getVapidKeys = () => ({
  publicKey: process.env.VITE_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY
});

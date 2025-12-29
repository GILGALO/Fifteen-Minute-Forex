export const getVapidKeys = () => ({
  publicKey: process.env.VITE_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
});

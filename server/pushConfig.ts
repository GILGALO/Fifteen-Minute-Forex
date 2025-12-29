const VAPID_PUBLIC_KEY = "BGiM1pgb9sb7pOCtbY2OuEfNWIjyOT6xH7xCxCERnuSuwx4lDevoDAab-V6N8yLy1XAJYOWVVxe8y4H98PgJYl0";
const VAPID_PRIVATE_KEY = "PRIVATE_KEY_HERE"; // User should set this as an environment variable

export const getVapidKeys = () => ({
  publicKey: process.env.VITE_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY || "Nva93hmk6AZqkgwYTr2bckKsHS1Bl3dQkDwHM5kzWpc"
});

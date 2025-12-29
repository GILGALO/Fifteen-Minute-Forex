import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BNvXf9_8-T-R_0G5Z-Jv1jW-C_uO_t-E_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q_t-Q";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribe() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });

      await apiRequest('POST', '/api/push/subscribe', {
        subscription: JSON.stringify(sub)
      });

      setSubscription(sub);
      toast({
        title: "Notifications Enabled",
        description: "You will now receive signal alerts on your device."
      });
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please check your browser settings.",
        variant: "destructive"
      });
    }
  }

  async function unsubscribe() {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      // Optional: Inform backend
    }
  }

  return { isSupported, isSubscribed: !!subscription, subscribe, unsubscribe };
}

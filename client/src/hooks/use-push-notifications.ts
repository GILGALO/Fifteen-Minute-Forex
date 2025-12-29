import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BGiM1pgb9sb7pOCtbY2OuEfNWIjyOT6xH7xCxCERnuSuwx4lDevoDAab-V6N8yLy1XAJYOWVVxe8y4H98PgJYl0";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  }

  async function subscribe() {
    try {
      // Register service worker if not already registered
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });

      await apiRequest('POST', '/api/push/subscribe', {
        subscription: JSON.stringify(sub)
      });

      setIsSubscribed(true);
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
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setIsSubscribed(false);
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive signal alerts."
        });
      }
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
    }
  }

  return { isSupported, isSubscribed, subscribe, unsubscribe };
}

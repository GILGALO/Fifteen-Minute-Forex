import webpush from 'web-push';
import { storage } from './storage';
import { getVapidKeys } from './pushConfig';
import { log } from './index';

const keys = getVapidKeys();

if (keys.publicKey && keys.privateKey) {
  webpush.setVapidDetails(
    'mailto:support@gilgalo-trading.com',
    keys.publicKey,
    keys.privateKey
  );
}

export async function sendPushNotification(title: string, body: string, data?: any) {
  const subscriptions = await storage.getAllPushSubscriptions();
  
  const notifications = subscriptions.map(async (sub) => {
    try {
      const pushSubscription = JSON.parse(sub.subscription);
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title,
          body,
          data
        })
      );
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription expired or no longer valid
        const endpoint = JSON.parse(sub.subscription).endpoint;
        await storage.removePushSubscription(endpoint);
      } else {
        log(`Push notification error: ${error.message}`, 'push');
      }
    }
  });

  await Promise.allSettled(notifications);
}

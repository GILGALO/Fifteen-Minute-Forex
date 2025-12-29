import { SignalAnalysis } from "@shared/schema";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isSubscribed ? unsubscribe : subscribe}
      title={isSubscribed ? "Disable Notifications" : "Enable Notifications"}
      data-testid="button-push-toggle"
    >
      {isSubscribed ? (
        <Bell className="h-5 w-5 text-primary" />
      ) : (
        <BellOff className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
}

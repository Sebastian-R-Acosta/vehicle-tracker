import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:notifications@bitacora.app",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function sendPushNotification(
  subscriptionJson: string,
  payload: { title: string; body: string; url?: string }
) {
  try {
    const subscription = JSON.parse(subscriptionJson);
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: "/icon-192.png",
        badge: "/favicon-32.png",
        url: payload.url || "/dashboard",
      })
    );
    return { success: true };
  } catch (error: any) {
    if (error?.statusCode === 410) {
      return { success: false, expired: true };
    }
    console.error("Push send error:", error);
    return { success: false, expired: false };
  }
}

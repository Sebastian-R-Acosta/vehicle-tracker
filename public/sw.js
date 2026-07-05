self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
self.addEventListener("fetch", (e) => e.respondWith(fetch(e.request).catch(() => new Response("Offline", { status: 503 }))));

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Vehicle Tracker";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/favicon-32.png",
    data: { url: data.url || "/dashboard" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

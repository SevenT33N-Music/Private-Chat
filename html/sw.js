preLoad = function() {
  return "done";
}
self.addEventListener("install", function(event) {
  event.waitUntil(preLoad());
});
self.addEventListener('activate', function() {
  console.log("service worker activated");
});
self.addEventListener('message', function(event) {
  try {
    let sender = event.data.sender;
    let msg = event.data.message;
    self.registration.showNotification(`Message From "${sender}"`, {
      body: msg,
      icon: 'appLogo.png'
    });
  }
  catch (err) {
    console.log(`Error: ${err}`);
  }
  event.ports[0].postMessage({ response: 'Notification Sent' });
});

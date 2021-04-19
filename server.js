addEventListener("fetch", (event) => {
  event.respondWith(
    new Response("Hello Ward", {
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
    }),
  );
});

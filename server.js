addEventListener("fetch", (event) => {
  event.respondWith(
    new Response("Hello Ward and Jeff", {
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
    }),
  );
});

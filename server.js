addEventListener("fetch", async (event) => {
  let result = await nrql('show event types')
  let counts = tally(result.results[0].eventTypes)
  console.log(sort(counts))
  
  event.respondWith(
    new Response(format(counts), {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    }),
  );
});

function format(counts) {
  return counts.map(count => `<ul>${count[0]}</ul>`).join(`\n`)
}

// fetch and analyze event types
// usage: ACCT_1_INSIGHTS_QUERY_KEY='...' deno run --allow-env --allow.net fetch.js
function nrql(query) {
  let site = `https://staging-insights-api.newrelic.com`
  let route = `v1/accounts/1/query`
  let url = `${site}/${route}?nrql=${query}`
  let headers = {
    "Accept": "application/json",
    "X-Query-Key": Deno.env.get("ACCT_1_INSIGHTS_QUERY_KEY")
  }
  return fetch(url, {headers}).then(res => res.ok ? res.json() : console.log(res.statusText))
}
function tally(types) {
  let counts = {}
  for (let type of types) {
    for (let word of type.split(' ')) {
      for (let snake of word.split('_')) {
        for (let camel of snake.split(/(?<=[a-z])(?=[A-Z])/)) {
          counts[camel] = counts[camel] || 0
          counts[camel] += 1
        }
      }      
    }
  }
  return counts
}
function sort(counts) {
  let array = Object.entries(counts)
  return array.sort((a,b) => b[1]-a[1])
}

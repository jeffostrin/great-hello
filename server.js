addEventListener("fetch", async (event) => {
  let eventTypes = (await nrql('show event types')).results[0].eventTypes
  let { pathname, search, origin } = new URL(event.request.url)
  
  if (pathname == `/` && search == ``) {
    let counts = tally(eventTypes)
    let sortedWords = sort(counts)
    console.log(sortedWords)
    event.respondWith(
      new Response(pathname + " " + search + " " +  format(sortedWords, []), {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }),
    );
  } else if (pathname == `/` && search.startsWith(`?search=`)) {
    let counts = tally(eventTypes)
    let sortedWords = sort(counts)
    console.log(sortedWords)
    let arg = search.split('=')[1];
    let searchresult = searchx(eventTypes, arg)
    event.respondWith(
      new Response(format(sortedWords, searchresult), {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }),
    );
  } else {
    event.respondWith(
      new Response(`do not know how to handle ${event.request.url}`, {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }),
    );
  }  
});

function format(words, eventtypes) {
  return `<table>
          <tr>
            <td valign="top" id=words>
              <ul> ${ words.map(word => `<li><a href="https://great-hello.deno.dev/?search=${word[0]}">${word[0]}</a></li>`).join(`\n`) } </ul>
            </td>
            <td valign="top" id=eventtypes>
              <ul> ${ eventtypes.map(eventtype => `<li>${eventtype}</li>`).join(`\n`) } </ul>
            </td>
          </tr>
          </table>`;
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
function searchx(eventTypes, arg) {
  let found = eventTypes.filter((eventType) => eventType.includes(arg))
  return found
}

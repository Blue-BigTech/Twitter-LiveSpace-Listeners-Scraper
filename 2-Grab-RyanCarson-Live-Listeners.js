const headerMessage = `
----------------------------------------------------
|       Twitter Live Space Listeners Scraper bot   |
----------------------------------------------------

`;

console.log(headerMessage);
const puppeteer = require("puppeteer");
const chromePaths = require("chrome-paths");
const Chrome_Browser_PATH = chromePaths.chrome;
var fs = require("fs");
const _ = require("lodash");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
var Link = fs.readFileSync("live-link.txt");
var spaceLink = Link.toString();
const getValidListeners = require('./utils')

var StoreListenersData = [];
console.log("Scraper run with headless mode");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: Chrome_Browser_PATH,
    headless: true,
    args: [
      "--disable-infobars",
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--start-maximized",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.on("request", async (request) => {
    if (
      request
        .url()
        .includes(
          "https://api.twitter.com/graphql/r8DsX1VGH5RQOQnJBdiPLA/AudioSpaceById?variables"
        )
    ) {
      try {
        var ListeningSpaceUrl = request.url();
        var RequestHeaders = request.headers();
        var AuthorizationToken = RequestHeaders.authorization;
        var Csrftoken = RequestHeaders["x-csrf-token"];

        if (AuthorizationToken.length > 0) {
          var pageCookies = await page.evaluate(() => {
            var cookieString = document.cookie;
            return cookieString;
          });

          var parsed = await fetch(ListeningSpaceUrl, {
            headers: {
              accept: "*/*",
              "access-control-request-headers":
                "authorization,content-type,x-csrf-token",
              "access-control-request-method": "GET",
              origin: " https://twitter.com",
              "accept-language": "en-US,en;q=0.9",
              authorization: AuthorizationToken,
              "content-type": "application/json",
              "sec-ch-ua":
                '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "x-csrf-token": Csrftoken,
              cookie: pageCookies,
              Referer: "https://twitter.com/",
            },
            body: null,
            method: "GET",
          })
            .then((response) => response.json()).then((data) => { return data; });

          var ListenersList = parsed.data.audioSpace.participants.listeners;
          var TotalInSpace = parsed.data.audioSpace.participants.total;
          if (ListenersList.length > 1) {
            var HostName = parsed.data.audioSpace.metadata.creator_results.result.legacy.name;
            var TotalListeners = ListenersList.length;

            for (let items = 0; items < TotalListeners; items++) {
              const ListenerName = parsed.data.audioSpace.participants.listeners[items].display_name;
              const TwitterHandle = parsed.data.audioSpace.participants.listeners[items].twitter_screen_name;
              StoreListenersData.push({
                creatorName: HostName,
                profile_url: `https://twitter.com/${TwitterHandle}`,
                profile_name: ListenerName,
                username: "@" + TwitterHandle,
              });
            }

            var dataset = _.uniqBy(StoreListenersData, "profile_url");
            var SpaceListeners = [];

            if (dataset.length != TotalInSpace) {
              var pos = 0;
              pos = getValidListeners.calcPos(TotalInSpace, dataset.length);
              SpaceListeners = getValidListeners.checkValid(dataset, pos);
            }
            else {
              SpaceListeners = dataset;
            }

            console.log(`> [${HostName}] Space - (${TotalListeners}) Listeners listening now`);
            console.log(
              `> [${HostName}] Space - (${SpaceListeners.length}) Listeners listed to file`
            );

            var FolderName = "Data";
            if (!fs.existsSync(FolderName)) {
              fs.mkdirSync(FolderName);
            }

            fs.writeFileSync(
              "Data/grabbed-live-listeners-List.json",
              JSON.stringify(SpaceListeners)
            );
          }
        }
      } catch (error) {
        // console.log("no data found");
      }
    } //end if
  });

  try {
    await page.goto(spaceLink, { waitUntil: "load", timeout: 0 });

    await page.waitForSelector('[data-testid="placementTracking"]');
    var SpaceStatus = await page.evaluate(async () => {
      var state_msg = "";
      await new Promise((resolve, reject) => {
        var timer = setInterval(() => {
          var msg = "";
          var bodyText = document.querySelector("body");
          bodyText = bodyText ? bodyText.innerText : "";
          if (bodyText.includes("Play recording")) {
            msg = "liveEnded";
            console.log(msg);
          } else {
            msg = "liveOn";
          }

          if (msg == "liveEnded") {
            state_msg = "live ended";
            clearInterval(timer);
            resolve();
          }
        }, 2000);
      });

      return state_msg;
    }); //check space status

    console.log(SpaceStatus);
  } catch (error) {
    console.log(error);
    await browser.close();
  }

  var dataset = _.uniqBy(StoreListenersData, "profile_url");
  console.log(dataset.length + " Listeners listed");
  await browser.close();
})();

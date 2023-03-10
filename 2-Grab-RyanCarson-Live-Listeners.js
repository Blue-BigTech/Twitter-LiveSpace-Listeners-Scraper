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
var finalset = [];
console.log("Scraper run with headless mode");
console.log(" ");
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
        var target_profile_url = request.url();
        var crftoken = request.headers();

        var auth = crftoken.authorization;
        token = crftoken["x-csrf-token"];

        if (auth.length > 0) {
          var crf = await page.evaluate(() => {
            var data = document.cookie;
            return data;
          });

          var parsed = await fetch(target_profile_url, {
            headers: {
              accept: "*/*",
              "access-control-request-headers":
                "authorization,content-type,x-csrf-token",
              "access-control-request-method": "GET",
              origin: " https://twitter.com",
              "accept-language": "en-US,en;q=0.9",
              authorization: auth,
              "content-type": "application/json",
              "sec-ch-ua":
                '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "x-csrf-token": token,
              cookie: crf,
              Referer: "https://twitter.com/",
            },
            body: null,
            method: "GET",
          })
            .then((response) => response.json())
            .then((data) => {
              return data;
            });

          var listOfusers = parsed.data.audioSpace.participants.listeners;
          if (listOfusers.length > 1) {
            var creatorName =
              parsed.data.audioSpace.metadata.creator_results.result.legacy
                .name;

            var len = listOfusers.length;
            console.log(
              `> [${creatorName}] Space - (${len}) Listeners listening now`
            );
            for (let items = 0; items < len; items++) {
              const profile_name =
                parsed.data.audioSpace.participants.listeners[items]
                  .display_name;
              const username =
                parsed.data.audioSpace.participants.listeners[items]
                  .twitter_screen_name;
              finalset.push({
                creatorName: creatorName,
                profile_url: `https://twitter.com/${username}`,
                profile_name: profile_name,
                username: "@" + username,
              });
            }

            var dataset = _.uniqBy(finalset, "profile_url");

            console.log(
              `> [${creatorName}] Space - (${dataset.length}) Listeners listed to file`
            );

            fs.writeFileSync("Data/grabbed-live-listeners-List.json", JSON.stringify(dataset));
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

  var dataset = _.uniqBy(finalset, "profile_url");
  console.log(dataset.length + " Listeners listed");
  await browser.close();
})();

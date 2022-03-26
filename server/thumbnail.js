const ethers = require("ethers");

const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { builtinModules } = require("module");

const thumbnail_folder = "/Users/minkowsky/Documents/develop/thumbnails/";

const thumbnail_loadint_time = 7000;

const server = http.createServer((req, res) => {
  var fileName = path.join(".", req.url);
  // Browser will autorequest 'localhost:8000/favicon.ico'

  if (fileName === "favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    fs.readFile(__dirname + "/faviconXS.gif", (err, data) => {
      res.writeHead(200);
      res.end(data);
    });
  }

  fs.readFile(thumbnail_folder + fileName, function (err, data) {
    if (err) {
      Thumbnail(fileName.split(".")[0]).then((image) => {
        res.writeHead(200);
        res.end(image);
      });

      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(8080);

async function Thumbnail(name) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      defaultViewport: {
        width: 800,
        height: 800,
      },
    });
    page = await browser.newPage(); // Open a new page

    await page.goto(url(name), {
      timeout: 0,
      // waitUntil: "networkidle2",
    }); // Go to the website
    await page.waitForTimeout(thumbnail_loadint_time); // Wait for 50 seconds
    await page
      .screenshot({
        fullPage: true, // take a fullpage screenshot
      })
      .then(async (image) => {
        await browser.close();
        resolve(image);
      });
  });
}

function url(name) {
  return "https://phanta.space/#/NFT/space/" + name.toString();
}

module.exports = { server };

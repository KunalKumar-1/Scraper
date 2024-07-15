"use strict";
import fs from "fs";
import url from "url";
import path from "path";
import request from "request";
import cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import cliSpinners from "cli-spinners";
import logUpdate from "log-update";

spinner(0);

function spinner(n) {
  let frames = cliSpinners.bouncingBall.frames;
  let i = 0;
  if (n === 1) {
    process.exit(1);
  }
  setInterval(() => {
    const frame = frames[i++ % frames.length];
    logUpdate(frame);
  }, 80);
}

function getImages(uri) {
  request(uri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const imgs = $("img").toArray();
      const hostName = url.parse(uri).hostname;
      const scriptDir = path.dirname(new URL(import.meta.url).pathname); // __dirname; // current script dir
      const saveDir = path.join(scriptDir, "images");
      let donwloadCount = 0;

      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
      }
      console.log("\n");
      //console.log(`Download all the images from ${uri}\n\n`);
      //setTimeout(() => {},10000);

      imgs.forEach(function (img) {
        const img_url = img.attribs.src;

        if (/^https?:\/\//.test(img_url)) {
          // checks if it is https or not
          const img_name = `${uuidv4()}.jpg`; // like images1.jpeg images2.jpeg ...
          const img_path = path.join(saveDir, img_name);

          request(img_url)
            .pipe(fs.createWriteStream(img_path))
            .on("close", function () {
              donwloadCount++;
              logUpdate(
                `\rDownloaded ${donwloadCount}/${imgs.length} => ${img_path}`
              );

              if (
                donwloadCount === imgs.length ||
                donwloadCount === imgs.length - 1
              ) {
                // clearInterval(intervalId);
                console.log("\nDownload completed");
                spinner(1);
              }
            });
          //console.log(`Saved: ${img_path}`);
        }
      });
      //console.log("Download completed.")
    }
  });
}
//Read command-line argument
const args = process.argv.slice(2); // 'process.argv' extracts the argument including node and scripts
if (args.length !== 1) {
  //checks if only one argument is provided by the user else it displays error -m
  console.error("Usage: node getImages.js <enter the url>");
  process.exit(1);
}
//calling getImages() function with the url provided by the user
const userUrl = args[0];
getImages(userUrl);

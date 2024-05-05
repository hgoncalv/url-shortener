require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dns = require("dns");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const urls = new Map(); // Map to store URLs and their corresponding short URLs
let shortUrlCounter = 0; // Counter for generating short URLs

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
  console.log("Express server running");
});

// Your first API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  const oriUrl = req.body.url;
  if (/https?/.test(oriUrl)) {
    let hostname = oriUrl.replace(/https?:\/\//, "");
    hostname = hostname.replace(/\/.*/, "");
    console.log(oriUrl);
    console.log(hostname);

    // Lookup the hostname passed as argument
    dns.lookup(hostname, (error, address, family) => {
      // If an error occurs, e.g., the hostname is incorrect!
      if (error) {
        console.error(error.message);
        res.json({ error: "invalid url" });
      } else {
        // If no error exists
        console.log(
          `The ip address is ${address} and the ip version is ${family}`
        );

        // Check if URL already exists in memory
        if (urls.has(oriUrl)) {
          const shortUrl = urls.get(oriUrl);
          res.json({ original_url: oriUrl, short_url: shortUrl });
        } else {
          // Generate short URL
          shortUrlCounter++;
          const shortUrl = shortUrlCounter.toString();

          // Store URL and short URL in memory
          urls.set(oriUrl, shortUrl);

          res.json({ original_url: oriUrl, short_url: shortUrl });
        }
      }
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const oriUrl = Array.from(urls.keys()).find(
    (key) => urls.get(key) === shortUrl
  );
  if (oriUrl) {
    res.redirect(oriUrl);
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

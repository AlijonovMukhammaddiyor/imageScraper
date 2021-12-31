const express = require("express");
const cors = require("cors");
const GoogleImageScraper = require("./Scraper");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/download", async (req, res) => {
  try {
    let keywords = req.query.keywords;
    let quantity = req.query.quantity;
    if (!quantity || !keywords) {
      res
        .status(500)
        .json(
          "Invalid search terms. Please make sure that you entered everything correctly."
        );
    }

    if (keywords) keywords = keywords.split(",").map((x) => x.trim());
    quantity = parseInt(quantity);
    let scraper = new GoogleImageScraper({
      // maximum number of scrolls to the bottom of the page.
      // limit : 1 results in 100 images, so 10 is approximately 800 because of google search limits
      limit: 3,
      scrollDelay: 500,
      verbose: true,
      exportResults: true,
    });

    for (const word of keywords) {
      scraper.scrape(word);
    }

    res.status(200).json("done");
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(process.env.PORT || 4000, function (err) {
  if (err) console.error(err);
  else console.log("The server is running on port 4000");
});

const express = require("express");
const cors = require("cors");
const Scraper = require("images-scraper");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/download", async (req, res) => {
  let keywords = req.query.keywords;
  const quantity = req.query.quantity;

  if (!quantity || !keywords) {
    res
      .status(500)
      .json(
        "Invalid search terms. Please make sure that you entered everything correctly."
      );
  }

  if (keywords) keywords = keywords.split(",").map((x) => x.trim());

  const google = new Scraper({
    puppeteer: {
      headless: false,
    },
  });

  console.log(keywords, quantity);

  let results = [];
  for (const word of keywords) {
    const result = await google.scrape(word, quantity);
    results.push(result);
  }

  console.log(results[0].length, results[1].length);
  res.status(200).json(results);
});

app.listen(process.env.PORT || 4000, function (err) {
  if (err) console.error(err);
  else console.log("The server is running on port 4000");
});

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const GoogleImageScraper = require("./Scraper");
const getCategoryUrls = require("./bing");
const { PythonShell } = require("python-shell");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/download", async (req, res) => {
	try {
		let keywords = req.query.keywords;
		let quantity = req.query.quantity;
		if (!quantity || !keywords) {
			res.status(500).json("Invalid search terms. Please make sure that you entered everything correctly.");
		}

		if (keywords) keywords = keywords.split(",").map((x) => x.trim());
		quantity = parseInt(quantity);
		console.log({ keywords, quantity });
		let scraper = new GoogleImageScraper({
			// maximum number of scrolls to the bottom of the page.
			// limit : 1 results in 100 images, so 10 is approximately 800 because of google search limits
			limit: 50,
			scrollDelay: 500,
			verbose: true,
			exportResults: true,
		});

		const results = {};
		for (const word of keywords) {
			let urls = await getCategoryUrls(word);
			let arr = [];
			if (urls.length === 0) {
				urls = [`https://www.google.com/search?q=${word}&tbm=isch`];
			}
			let count = 0;
			for (let i = 0; i < urls.length; i++) {
				if (count >= quantity) break;
				const result = await scraper.scrape(urls[i], quantity, count, arr);
				arr = arr.concat(result);
				count += result.length;
			}
			results[word] = arr;
		}

		const stats = {};
		for (const key in results) {
			stats[key] = results[key].length;
		}
		const response = { info: stats, links: results };
		let filename = "download";
		fs.writeFileSync(`${filename}.json`, JSON.stringify(response));

		var options = {
			mode: "text",
			pythonPath: "./env/bin/python",
			pythonOptions: [],
			scriptPath: "",
			args: [],
		};
		async function runDownload() {
			const {
				success,
				err = "",
				response_,
			} = await new Promise((resolve, reject) => {
				PythonShell.run("download.py", options, function (err, response_) {
					if (err) {
						reject({ success: false, err });
					}

					resolve({ success: true, response_ });
				});
			});

			if (!success) {
				console.log("Python Error: " + err);
				return false;
			}
			console.log("\n\nend downloading...");
			return true;
		}

		console.log("start downloading...\n\n");
		const res_down = await runDownload();

		if (res_down) {
			const file = `${__dirname}/downloads.zip`;
			res.status(200).download(file);
		} else res.status(200).json({ error: true });
	} catch (err) {
		res.status(500).json(err);
	}
});

app.listen(process.env.PORT || 4000, function (err) {
	if (err) console.error(err);
	else console.log("The server is running on port 4000");
});

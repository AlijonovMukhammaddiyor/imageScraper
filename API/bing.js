const puppeteer = require("puppeteer");

async function getCategoryUrls(word) {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	const page = await browser.newPage();
	console.log(`${word} is in page.goto()`);
	await page.goto(`https://www.google.com/search?q=${word}&tbm=isch`, {
		waitUntil: "networkidle0",
	});

	const result = await page.evaluate(function () {
		const urls = [];
		let elements = document.querySelectorAll("a.F9PbJd.xKddTc");
		for (let i = 0; i < elements.length; i++) {
			urls.push(elements[i].href);
		}
		return urls;
	});

	await browser.close();
	return result;
}

module.exports = getCategoryUrls;

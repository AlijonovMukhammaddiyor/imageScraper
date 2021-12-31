const url = require("url");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

class GoogleImageScraper {
  constructor({
    limit = 10,
    scrollDelay = 500,
    exportResults = false,
    verbose = false,
  }) {
    this.limit = limit;
    this.scrollDelay = scrollDelay;
    this.exportResults = exportResults;
    this.verbose = verbose;
  }

  async scrape(url, quantity, currentCount, arr) {
    if (!url) {
      throw new Error("Missing keyword.");
    }
    let googleQuery = url;

    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    page.setViewport({ width: 1920, height: 1080 });

    await page.goto(googleQuery);

    await this.infiniteScroll(page);

    await this.clickAllImages(page);
    this.log("Right-clicked all images");

    let html = await page.content();

    let results = this.parseLinksFromHTML(html);

    results = results.filter((link) => {
      return !arr.includes(link);
    });

    if (results.length + currentCount > quantity) {
      results = results.slice(0, quantity - currentCount);
    }

    await browser.close();
    return results;
  }

  async clickAllImages(page) {
    this.log("Started right-clicking images");
    return page.evaluate(() => {
      let elements = document.querySelectorAll("#islrg img");

      function rightClick(element) {
        return new Promise((resolve) => {
          let event = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: false,
            view: window,
            button: 2,
            buttons: 2,
            clientX: element.getBoundingClientRect().x,
            clientY: element.getBoundingClientRect().y,
          });
          element.dispatchEvent(event);
          resolve();
        });
      }

      async function rightClickAll(elements) {
        for (const element of elements) {
          await rightClick(element);
        }
      }
      rightClickAll(elements);
    });
  }

  async getAllCats(page) {
    return page.evaluate(() => {
      const urls = [];
      let elements = document.querySelectorAll("a.F9PbJd.xKddTc");
      for (let i = 0; i < elements.length; i++) {
        urls.push(elements[i].href);
      }
      return urls;
    });
  }

  isButtonVisible(page) {
    return page.evaluate(() => {
      function isVisible(e) {
        return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
      }
      return isVisible(document.querySelector("#islmp input[type='button']"));
    });
  }

  getInfiniteScrollStatus(page) {
    return page.evaluate(() => {
      let status = document.querySelector(
        "#islmp div[data-endedmessage] > div:last-child"
      ).innerText;
      return status;
    });
  }

  parseLinksFromHTML(html) {
    let links = [];

    let $ = cheerio.load(html);

    $("#islrg a[href^='/imgres']").each(function (i, elem) {
      //   let description = $(this).next().find("div > div:first-child").text();
      let link = $(this).attr("href");

      let parsedLink = url.parse(link, { parseQueryString: true });
      let imageurl = parsedLink.query.imgurl;
      //   let source = parsedLink.query.imgrefurl;

      links.push(imageurl);
    });

    return links;
  }

  async infiniteScroll(page) {
    let self = this;
    let scrollIndex = 1;

    try {
      let previousHeight;

      while (scrollIndex < self.limit) {
        let buttonIsVisible = await this.isButtonVisible(page);

        let infiniteScrollStatus = await this.getInfiniteScrollStatus(page);

        if (infiniteScrollStatus === "Looks like you've reached the end") {
          this.log("Looks like I've reached the end of results");
          break;
        }

        scrollIndex += 1;
        previousHeight = await page.evaluate("document.body.scrollHeight");

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");

        this.log("Scrolled to bottom, total number of scrolls: " + scrollIndex);

        if (buttonIsVisible) {
          await page.click("#islmp input[type='button']");
          this.log("Clicked on show more results");
        }

        await page.waitForFunction(
          `document.body.scrollHeight > ${previousHeight}`
        );
        await page.waitFor(self.scrollDelay);
      }

      // don't forget to delete me :)
      return true;
      //
    } catch (error) {
      this.log(error);
    }
  }
  log(message) {
    if (this.verbose) {
      //   console.log(message);
    }
  }
}

module.exports = GoogleImageScraper;

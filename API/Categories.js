const puppeteer = require("puppeteer");
const cheerio = require("cheerio");




async function getAllCats(page) {
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
      let description = $(this).next().find("div > div:first-child").text();

      let link = $(this).attr("href");

      let parsedLink = url.parse(link, { parseQueryString: true });
      let imageurl = parsedLink.query.imgurl;
      let source = parsedLink.query.imgrefurl;

      links.push({ imageurl, source, description });
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
      console.log(message);
    }
  }
}

module.exports = GoogleImageScraper;

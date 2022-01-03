import React, { useState, useEffect } from "react";
import "../../styles/app/app.css";
import axios from "axios";
const JSZip = require("jszip");
const saveAs = require("file-saver");

const App = () => {
  const [words, setWords] = useState([]);
  const [quan, setQuan] = useState(0);
  const [value, setValue] = useState("");
  const [links, setLinks] = useState([]);
  const [fetch, setFetch] = useState(false);
  const [download, setDownload] = useState(false);

  console.log(links);

  useEffect(() => {
    async function getLinks() {
      setFetch(false);
      let res_string = words.join(",");
      const results = await axios.get(
        `http://localhost:4000/download?keywords=${res_string}&quantity=${quan}`,
        { crossdomain: true }
      );
      if (results.data) {
        setLinks(results.data);
        setDownload(true);
      }
    }
    if (fetch) getLinks();
  }, [fetch, quan, words]);

  function handleWord(e) {
    if (e.key === "Enter") {
      setDownload(false);
      let temp = words ? words : [];
      temp.push(value);
      setWords(temp);
      setValue("");
    }
  }

  async function handleSubmit(e) {
    setLinks({});
    setDownload(false);
    if (value) {
      let temp = words ? words : [];
      temp.push(value);
      setWords(temp);
      setValue("");
    }
    if (quan > 0 && words.length > 0) setFetch(true);
  }

  function removeWord(e) {
    const word = e.target.innerText;
    if (links.links && links.links[word]) {
      delete links.links[word];
      if (links.links.length === 0) {
        setLinks({});
        setDownload(false);
      }
    }
    const temp = words.filter((keyword) => {
      return keyword != word;
    });
    setWords(temp);
  }

  return (
    <div className="app__container">
      <div className="intro">
        <h1>Google Image Scrape</h1>
        <p className="subtitle">Scrape and download images on google</p>
        <p className="note">
          <span>Note:</span>
          {"  "}
          Input one keyword and press Enter to make a list of keywords
        </p>
      </div>
      <div className="input__field">
        <input
          type="text"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleWord}
          value={value}
          placeholder="Enter one keyword..."
        />
        <input
          type="number"
          onChange={(e) => {
            setDownload(false);
            setQuan(e.target.value);
          }}
          value={quan}
          onWheel={(e) => e.target.blur()}
        />
        {!download && (
          <button className="submit__btn" onClick={handleSubmit}>
            Search
          </button>
        )}
        {download && <button className="download__btn">Download</button>}
      </div>
      <div className="words">
        {words.map((word, index) => {
          return (
            <div onDoubleClick={removeWord} className="word_block" key={index}>
              <p className="word" key={index}>
                {word}
              </p>
            </div>
          );
        })}
      </div>

      <div className="images">
        {links && links.links && (
          <div className="found__images">
            {words.map((word, ind) => {
              return (
                <div key={ind} className="images__word">
                  {links.links[word].map((link, ind) => {
                    return (
                      <img src={link} key={ind} className="image" alt="" />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        {!links.links && (
          <div className="images__placeholder">
            Your sample images appear here...
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

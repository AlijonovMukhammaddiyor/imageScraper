import React, { useState, useEffect } from "react";
import "../../styles/app/app.css";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

const App = () => {
    const [words, setWords] = useState([]);
    const [quan, setQuan] = useState(0);
    const [value, setValue] = useState("");
    const [links, setLinks] = useState([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (links.length > 0) setShow(true);
    }, [links]);

    function handleInput(e) {
        setValue(e.target.value);
    }

    function handleWord(e) {
        if (e.key === "Enter") {
            let temp = words ? words : [];
            temp.push(value);
            setWords(temp);
            setValue("");
        }
    }

    async function handleSubmit(e) {
        let res_string = words.join(",");
        async function getLinks() {
            const results = await axios.get(`http://localhost:4000/download?keywords=${res_string}&quantity=${quan}`);
            if (results.data) setLinks(results.data);
            console.log(results.data.length, results.data);
        }
        await getLinks();
    }

    function removeWord() { }

    function handleQuantity(e) {
        setQuan(e.target.value);
    }

    return (
        <div className="app__container">
            <div className="input__form">
                <input type="text" onChange={handleInput} onKeyDown={handleWord} value={value} />
                <input type="number" onChange={handleQuantity} value={quan} />
                <div className="words">
                    {words.map((word, index) => {
                        return (
                            <div className="word_btn" key={index}>
                                <p key={index} onClick={removeWord}>
                                    {word}
                                </p>
                                <IoMdClose></IoMdClose>
                            </div>
                        );
                    })}
                </div>
                <button className="submit__btn" onClick={handleSubmit}>
                    Search
                </button>
                {
                    <div className="found_images">
                        {links.map((array, index) => {
                            return (
                                <div className="image_categ" key={index}>
                                    {array.map((obj, ind) => {
                                        return (
                                            <div className="image" key={ind}>
                                                <img src={obj.url} alt="" />
                                                <p>{obj.title}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                }
            </div>
        </div>
    );
};

export default App;

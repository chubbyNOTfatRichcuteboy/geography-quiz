import { useState, useEffect } from "react";

export default function Game() {
  const [allCountries, setAllCountries] = useState([]);
  const [gameState, setGameState] = useState("welcome"); // needs states to see which phase, loading screen, playing, leaderboard, etc
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentCorrect, setCurrentCorrect] = useState({});
  const [currentOptions, setCurrentOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/countries");
        const data = await response.json();
        setAllCountries(data);
        console.log(data);
      } catch (error) {
        console.error("Oh no, fetch failed: ", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allCountries.length > 0 && currentOptions.length === 0) {
      handleNextOptions();
    }
  }, [allCountries]);

  if (allCountries.length === 0 || !currentOptions.length) {
    return <div>Loading flags...</div>;
  }

  function shuffleArray(inputArray: Array<object>) {
    inputArray.sort(() => Math.random() - 0.5);
  }

  function getRandomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function handleAnswerClick(selectedName) {
    if (selectedName === currentCorrect.name) {
      alert("Correct");
    } else {
      alert("Wrong");
    }
  }

  function handleNextOptions() {
    const correctCountry =
      allCountries[getRandomRange(0, allCountries.length - 1)];
    const otherCountries = allCountries.filter(
      (country) => country.name !== correctCountry.name,
    );

    shuffleArray(otherCountries);
    const options = otherCountries.slice(0, 3);

    options.push(correctCountry);
    shuffleArray(options);

    setCurrentCorrect(correctCountry);
    setCurrentOptions(options);
  }

  return (
    <div id="background">
      <img id="flag" src={currentCorrect.imagelink} />
      <div id="options">
        {currentOptions.map((country) => (
          <button
            key={country.name}
            onClick={() => handleAnswerClick(country.name)}
          >
            {country.name}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import Leaderboard from "./Leaderboard.tsx";

export default function Game() {
  const [allCountries, setAllCountries] = useState([]);
  const [gameState, setGameState] = useState("welcome"); // needs states to see which phase, loading screen, playing, leaderboard, etc
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentCorrect, setCurrentCorrect] = useState({});
  const [currentOptions, setCurrentOptions] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [pickedAnswer, setPickedAnswer] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderData, setLeaderData] = useState([]);

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

  function getRandomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function handleAnswerClick(selectedName: string) {
    if (selectedName === currentCorrect.name) {
      setGameScore((prev) => prev + 1);
    }
    setHasAnswered(true);
    setPickedAnswer(selectedName);
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

  function handleNextButton() {
    if (currentQuestion < 10) {
      handleNextOptions();
      setCurrentQuestion((prev) => prev + 1);
      setHasAnswered(false);
    } else {
      setGameState("results");
    }
    setPickedAnswer("");
  }

  function resetGame() {
    setHasAnswered(false);
    setCurrentQuestion(1);
    setCurrentOptions([]);
    setCurrentCorrect({});
    setGameScore(0);
    setPickedAnswer("");
    setIsSaved(false);
    setShowLeaderboard(false);
  }

  function handlePlay() {
    resetGame();
    setGameState("playing");
    handleNextOptions();
  }

  async function handleSave(e) {
    e.preventDefault();
    const response = await fetch("http://localhost:5001/add-score", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ username: inputUsername, points: gameScore }),
    });
    if (!response.ok) console.log("Posted score to db");
    await fetchLeaderboard();
    setIsSaved(true);
    setInputUsername("");
  }

  async function fetchLeaderboard() {
    const response = await fetch("http://localhost:5001/leaderboard");
    const leaders = await response.json();
    setLeaderData(leaders);
  }

  if (gameState === "playing") {
    return (
      <div id="background">
        <div id="top-bar">{currentQuestion}/10</div>
        <img id="flag" src={currentCorrect.imagelink} />
        <div id="options">
          {currentOptions.map((country) => (
            <button
              key={country.name}
              onClick={() => handleAnswerClick(country.name)}
              disabled={hasAnswered}
              className={
                country.name === currentCorrect.name && hasAnswered
                  ? "correct-answer"
                  : country.name === pickedAnswer
                    ? "incorrect-answer"
                    : "default"
              }
            >
              {country.name}
            </button>
          ))}
        </div>
        {hasAnswered && (
          <button id="next-button" onClick={handleNextButton}>
            Next
          </button>
        )}
      </div>
    );
  } else if (gameState === "results") {
    return (
      <div id="results-container">
        <h1 id="correctness">You got {gameScore}/10 correct!</h1>
        {isSaved ? (
          <h2>Score Saved!</h2>
        ) : (
          <form onSubmit={handleSave}>
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Input a username"
              id="username-input"
              required
            ></input>
            <button id="save-score">Save Score</button>
          </form>
        )}
        <div id="play-leaderboard-button-container">
          <button id="play-button" onClick={handlePlay}>
            Play Again
          </button>
          <button
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
            }}
          >
            Toggle Leaderboard
          </button>
        </div>
        {showLeaderboard && (
          <Leaderboard id="leaderboard" leaders={leaderData} />
        )}
      </div>
    );
  } else if (gameState === "welcome") {
    return (
      <div id="background">
        <h1 id="welcome">Welcome to GeoQuizzer. Press play to get started.</h1>
        <button id="play-button" onClick={handlePlay}>
          Play
        </button>
      </div>
    );
  }
}

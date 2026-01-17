import { useState, useEffect } from "react";

export default function Game() {
  const [flagData, setFlagData] = useState([]);
  const [gameState, setGameState] = useState("welcome"); // needs states to see which phase, loading screen, playing, leaderboard, etc
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/countries");
        const data = await response.json();
        setFlagData(data);
        console.log(data);
      } catch (error) {
        console.error("Oh no, fetch failed: ", error);
      }
    };
    fetchData();
  }, []);

  return <div></div>;
}

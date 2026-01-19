import { useState, useEffect } from "react";

export default function Profile({ refreshTrigger }) {
  const [scoresData, setScoresData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5001/leaderboard/my-scores",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Something went wrong");
        }
        setScoresData(data.scores);
      } catch (error) {
        console.log("Error fetching", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, [refreshTrigger]);
  if (isLoading) {
    return (
      <div>
        <h2>Loading your scores...</h2>
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div id="my-scores-container">
      {scoresData.length === 0 ? (
        <h2>You have no scores yet. Save a game score to get one.</h2>
      ) : (
        <table id="my-scores-table">
          <tbody>
            {scoresData.map((scoreData) => (
              <tr key={scoreData._id}>
                <td>{scoreData.points} points</td>
                <td>{new Date(scoreData.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

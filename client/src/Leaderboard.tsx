interface Leader {
  username: string;
  points: number;
  date: string;
}

interface LeaderboardProps {
  leaders: Leader[];
  playerName: string;
}

export default function Leaderboard({ leaders, playerName }: LeaderboardProps) {
  return leaders.length > 0 ? (
    <div>
      <table id="leaderboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader) => {
            const date = new Date(leader.date).toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            });
            return (
              <tr
                key={`${leader.username}-${leader.points}-${date}`}
                className={
                  leader.username === playerName ? "highlight" : "nohighlight"
                }
              >
                <td>{leader.username}</td>
                <td>{leader.points}</td>
                <td>{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <div></div>
  );
}

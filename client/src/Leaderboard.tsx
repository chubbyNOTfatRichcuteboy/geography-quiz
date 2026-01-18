export default function Leaderboard({ leaders, playerName }) {
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
                <th>{leader.username}</th>
                <th>{leader.points}</th>
                <th>{date}</th>
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

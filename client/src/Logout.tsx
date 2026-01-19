interface LogoutProps {
  handleLogout: () => void;
}

export default function Logout({ handleLogout }: LogoutProps) {
  return <button onClick={handleLogout}>Log out</button>;
}

import { useState } from "react";

interface User {
  username: string;
}

interface AuthProps {
  onAuthSuccess: (token: string, user: User) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = isLogin
      ? "https://geography-quiz-six.vercel.app/api/auth/login"
      : "https://geography-quiz-six.vercel.app/api/auth/signup";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: inputUsername,
          password: inputPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      onAuthSuccess(data.token, data.user);
    } catch (error) {
      console.log("Error fetching: ", error);
    }
  }

  return (
    <div id="auth-container">
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Sign up" : "Log in"}
      </button>
      <form id="auth" onSubmit={handleSubmit}>
        <label htmlFor="username-input">Username</label>
        <input
          value={inputUsername}
          id="username-input"
          type="text"
          onChange={(e) => setInputUsername(e.target.value)}
          required
        ></input>
        <label htmlFor="password-input">Password</label>
        <input
          value={inputPassword}
          id="password-input"
          type="password"
          onChange={(e) => setInputPassword(e.target.value)}
          autoComplete="off"
          required
        ></input>
        <button type="submit">{isLogin ? "Log In" : "Sign Up"}</button>
      </form>
    </div>
  );
}

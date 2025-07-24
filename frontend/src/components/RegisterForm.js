import { useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMsg(
        "✅ Registered successfully! You can now log in with these credentials."
      );
    } else {
      setMsg(
        "❌ Sorry, that username is already taken. Please choose another one."
      );
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-3 p-4 border rounded-xl w-full"
    >
      <h2 className="text-xl font-bold">Register</h2>
      <input
        className="w-full p-2 border rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="relative">
        <input
          className="w-full p-2 border rounded pr-16"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Register
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}

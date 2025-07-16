import { useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setMsg("✅ Registered successfully!");
    } else {
      setMsg(`❌ ${data.message}`);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3 p-4 border rounded-xl w-full">
      <h2 className="text-xl font-bold">Register</h2>
      <input
        className="w-full p-2 border rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Register
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}

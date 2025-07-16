import React, { useState, useEffect } from "react";
import MoodForm from "./components/MoodForm";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MoodHistory from "./components/MoodHistory";
import MoodChart from "./components/MoodChart";
import MoodTrendline from "./components/MoodTrendline";
import DateFilter from "./components/DateFilter";
import MoodSummary from "./components/MoodSummary";
import ExportCSVButton from "./components/ExportCSVButton";
import "./App.css";

function App() {
  const [userId, setUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [range, setRange] = useState("7days");
  const [customRange, setCustomRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(parseInt(storedId));
    }
  }, []);

  const handleLogin = (user) => {
    setUserId(user.id);
    localStorage.setItem("userId", user.id);
  };

  const triggerMoodRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {userId ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="header-title">
                <span className="emoji">🌤️</span>
                Mood Tracker
              </h1>

              <button
                onClick={() => {
                  setUserId(null);
                  localStorage.removeItem("userId");
                }}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
              >
                Log Out
              </button>
            </div>

            <MoodForm userId={userId} onMoodSubmitted={triggerMoodRefresh} />
            <DateFilter
              range={range}
              setRange={setRange}
              customRange={customRange}
              setCustomRange={setCustomRange}
            />
            <ExportCSVButton
              userId={userId}
              range={range}
              customRange={customRange}
              triggerRefresh={refreshKey}
            />

            <MoodSummary
              userId={userId}
              range={range}
              customRange={customRange}
              triggerRefresh={refreshKey}
            />
            <MoodChart
              userId={userId}
              triggerRefresh={refreshKey}
              range={range}
              customRange={customRange}
            />
            <MoodTrendline
              userId={userId}
              triggerRefresh={refreshKey}
              range={range}
              customRange={customRange}
            />
            <MoodHistory
              userId={userId}
              triggerRefresh={triggerMoodRefresh}
              range={range}
              customRange={customRange}
            />
          </>
        ) : (
          <div className="bg-white shadow-md rounded-xl p-6 space-y-8">
            <div>
              <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Login to Continue
              </h1>
              <LoginForm onLogin={handleLogin} />
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-3 text-center text-gray-700">
                New here? Register below:
              </h2>
              <RegisterForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

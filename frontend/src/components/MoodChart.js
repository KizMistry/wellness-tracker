import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MoodChart = ({ userId, triggerRefresh, range, customRange }) => {

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url =
          range === "custom"
            ? `${API_BASE}/mood-stats?user_id=${userId}&range=custom&start=${customRange.start}&end=${customRange.end}`
            : `${API_BASE}/mood-stats?user_id=${userId}&range=${range}`;

        const res = await fetch(url);
        const moodData = await res.json();

        const formatted = Object.entries(moodData).map(([mood, count]) => ({
          mood: mood === "disappointed" ? "disappoint." : mood,
          count,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching mood stats:", err);
      }
    };

    if (
      userId &&
      (range !== "custom" || (customRange.start && customRange.end))
    ) {
      fetchStats();
    }
  }, [userId, triggerRefresh, range, customRange]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white shadow rounded-xl p-6 my-4">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
        Mood Chart
      </h2>
      <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={data}
    margin={{ top: 10, right: 20, left: 0, bottom: 30 }} // key part
  >
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis
      dataKey="mood"
      interval={0}
      tick={{
        angle: -55,
        dy: 15,
        fontSize: 12,
        fill: "#374151", // Tailwind gray-700
      }}
      height={70}
    />
    <YAxis allowDecimals={false} />
    <Tooltip
      contentStyle={{
        backgroundColor: "white",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />
    <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
    </div>
  );
};

export default MoodChart;

// components/ExportCSVButton.js
import React from "react";

const ExportCSVButton = ({ userId, range, customRange }) => {
  if (!userId) return null;

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const handleExport = () => {
    const url = `${API_BASE}/export-csv?user_id=${userId}&range=all`;
    window.open(url, "_blank");
  };

  const handleFilteredExport = () => {
    let url = `${API_BASE}/export-csv?user_id=${userId}`;

    if (range === "custom" && customRange.start && customRange.end) {
      url += `&range=custom&start=${customRange.start}&end=${customRange.end}`;
    } else {
      url += `&range=${range}`;
    }

    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <button
        onClick={handleExport}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow"
      >
        Export All Mood Data (CSV)
      </button>
      <button
        onClick={handleFilteredExport}
        disabled={
          range === "custom" && (!customRange.start || !customRange.end)
        }
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Export Filtered Data (CSV)
      </button>
    </div>
  );
};

export default ExportCSVButton;

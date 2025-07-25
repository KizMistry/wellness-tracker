import React from "react";

export default function LoadingModal({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 text-center w-80">
        <h2 className="text-lg font-semibold mb-2">⏳ Please Wait</h2>
        <p className="text-sm text-gray-600">
          The server might be waking up (free hosting sleeps after inactivity).
          This can take up to 30 seconds.
        </p>
      </div>
    </div>
  );
}

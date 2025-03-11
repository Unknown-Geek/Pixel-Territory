import React from "react";

export const CellConfirmation = ({ position, onConfirm, onCancel }) => {
  // Handle events to prevent bubbling
  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  // Add null check to ensure position exists
  if (!position) return null;

  return (
    <div
      className="absolute bg-white shadow-lg rounded-md p-2 border border-gray-200 z-50"
      style={{
        top: `${position.y + 20}px`,
        left: `${position.x}px`,
      }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling
    >
      <p className="text-sm mb-2">Claim this territory?</p>
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Claim
        </button>
        <button
          onClick={handleCancel}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

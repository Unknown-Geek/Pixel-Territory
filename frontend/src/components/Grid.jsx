import React from "react";

export const Grid = ({ gameState, onCellClick }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4">
      <div className="grid grid-cols-20 gap-1">
        {gameState.grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="aspect-square cursor-pointer border border-gray-200 hover:opacity-75 transition-opacity"
              style={{ backgroundColor: cell.color }}
              onClick={() => onCellClick(x, y)}
              title={
                cell.owner ? `Owned by ${cell.owner}` : "Unclaimed territory"
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

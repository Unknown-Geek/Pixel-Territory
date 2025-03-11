import React, { useState } from "react";
import { RetroButton } from "./RetroButton";

interface AddSubredditsProps {
  currentSubreddits?: string[];
  onSubmit: (subreddits: string[]) => void;
  onCancel: () => void;
  onClose?: () => void; // Add the missing onClose prop
}

const AddSubreddits: React.FC<AddSubredditsProps> = ({
  currentSubreddits = [],
  onSubmit,
  onCancel,
  onClose = onCancel, // Default to onCancel if onClose not provided
}) => {
  const [subreddits, setSubreddits] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const subredditList = subreddits
      .split(",")
      .map((sub) => sub.trim())
      .filter((sub) => sub.length > 0);

    if (subredditList.length > 0) {
      onSubmit(subredditList);
      setSubreddits(""); // Clear input after submission
      onClose(); // Use onClose here
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="retro-container max-w-md w-full">
        <h2
          className="text-xl mb-2 text-[var(--retro-highlight)]"
          style={{ textTransform: "none" }}
        >
          Add Subreddit
        </h2>

        <p className="text-xs italic text-gray-500 mb-3 text-left">
          for moderators only
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="subreddits"
            className="block mb-2"
            style={{ textTransform: "none" }}
          >
            Enter Subreddit:
          </label>
          <input
            type="text"
            id="subreddits"
            value={subreddits}
            onChange={(e) => setSubreddits(e.target.value)}
            className="w-full p-2 bg-[var(--retro-black)] border-2 border-[var(--retro-primary)] text-[var(--retro-primary)] mb-2"
            placeholder="ENTER HERE"
          />

          <div className="flex justify-end gap-2 mt-4">
            <RetroButton variant="secondary" onClick={onCancel}>
              Cancel
            </RetroButton>
            <RetroButton variant="accent" type="submit">
              Submit
            </RetroButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubreddits;

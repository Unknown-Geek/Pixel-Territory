import React, { useState } from "react";
import { parseAllianceCommand } from "../utils/gameState";
import { RetroButton } from "./RetroButton";

export const AllianceCommands = ({ playerName, onProcessCommand }) => {
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setMessage({ text: "Please enter a command", type: "error" });
      return;
    }

    const command = parseAllianceCommand(commentText, playerName);

    if (command) {
      onProcessCommand(command);
      setMessage({ text: "Command processed successfully", type: "success" });
      setCommentText("");
    } else {
      setMessage({
        text: "Invalid command. Use /ally invite, /ally accept, /ally reject or /ally leave",
        type: "error",
      });
    }
  };

  return (
    <div className="retro-container mt-4">
      <h2 className="retro-header mb-4" data-text="ALLIANCE COMMANDS">
        ALLIANCE COMMANDS
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-2 ${
            message.type === "error" ? "error-text" : "success-text"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="comment-command" className="block mb-2 text-sm">
            Enter a comment with alliance commands:
          </label>
          <textarea
            id="comment-command"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-[var(--retro-black)] border border-[var(--retro-primary)] p-2 h-24 text-[var(--retro-highlight)]"
            placeholder="/ally invite PlayerName"
          ></textarea>
        </div>

        <div>
          <RetroButton type="submit" variant="accent">
            Process Command
          </RetroButton>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="text-[var(--retro-complement)] mb-2">
          Available Commands:
        </h3>
        <ul className="space-y-2">
          <li>
            <span className="text-[var(--retro-highlight)]">
              /ally invite PlayerName
            </span>{" "}
            - Invite a player to form an alliance
          </li>
          <li>
            <span className="text-[var(--retro-highlight)]">
              /ally accept PlayerName
            </span>{" "}
            - Accept an alliance invitation
          </li>
          <li>
            <span className="text-[var(--retro-highlight)]">
              /ally reject PlayerName
            </span>{" "}
            - Reject an alliance invitation
          </li>
          <li>
            <span className="text-[var(--retro-highlight)]">/ally leave</span> -
            Leave your current alliance
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AllianceCommands;

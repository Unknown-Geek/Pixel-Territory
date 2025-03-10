import React, { useState, useEffect } from "react";
import { RetroButton } from "./RetroButton";
import { AllianceCommands } from "./AllianceCommands";
import {
  getPlayerAlliances,
  getPendingInvitations,
  inviteToAlliance,
  respondToInvitation,
  dissolveAlliance,
} from "../utils/allianceUtils";

/**
 * Alliance management panel component
 * @param {Object} props Component properties
 * @param {Object} props.gameState Current game state
 * @param {string} props.playerName Current player name
 * @param {Function} props.onAllianceAction Handler for alliance actions
 */
export const AlliancePanel = ({ gameState, playerName, onAllianceAction }) => {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [newAllyName, setNewAllyName] = useState("");
  const [pendingInvites, setPendingInvites] = useState([]);
  const [playerAlliances, setPlayerAlliances] = useState([]);

  // Update alliances and invites when gameState changes
  useEffect(() => {
    if (gameState && playerName) {
      setPlayerAlliances(getPlayerAlliances(gameState, playerName));
      setPendingInvites(getPendingInvitations(gameState, playerName));
    }
  }, [gameState, playerName]);

  // Handle alliance invite submission
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!newAllyName || newAllyName.trim() === "") {
      setMessage({ text: "Please enter a player name", type: "error" });
      return;
    }

    if (newAllyName === playerName) {
      setMessage({ text: "You cannot invite yourself", type: "error" });
      return;
    }

    // Check if player exists
    if (!gameState.players[newAllyName]) {
      setMessage({ text: "Player not found", type: "error" });
      return;
    }

    // Check if alliance already exists
    const existingAlliance = playerAlliances.find(
      (alliance) => alliance.allyName === newAllyName
    );

    if (existingAlliance) {
      setMessage({
        text: "You are already allied with this player",
        type: "error",
      });
      return;
    }

    // Send invitation through the alliance action handler
    onAllianceAction({
      type: "INVITE",
      from: playerName,
      to: newAllyName,
    });

    setMessage({ text: `Invitation sent to ${newAllyName}`, type: "success" });
    setNewAllyName("");
  };

  // Handle invitation response
  const handleInviteResponse = (inviteId, accepted) => {
    onAllianceAction({
      type: accepted ? "ACCEPT" : "REJECT",
      inviteId: inviteId,
    });

    setPendingInvites(
      pendingInvites.filter((invite) => invite.id !== inviteId)
    );
    setMessage({
      text: `Invitation ${accepted ? "accepted" : "rejected"}`,
      type: "success",
    });
  };

  // Handle breaking alliance
  const handleBreakAlliance = (allianceId) => {
    onAllianceAction({
      type: "BREAK",
      allianceId: allianceId,
    });

    setPlayerAlliances(
      playerAlliances.filter((alliance) => alliance.id !== allianceId)
    );
    setMessage({ text: "Alliance broken", type: "success" });
  };

  return (
    <div className="retro-container">
      <h2 className="retro-header mb-4" data-text="ALLIANCES">
        ALLIANCES
      </h2>

      {/* Status messages */}
      {message.text && (
        <div
          className={`mb-4 p-2 text-center text-sm ${
            message.type === "error"
              ? "bg-[var(--retro-error)] bg-opacity-20 text-[var(--retro-error)]"
              : "bg-[var(--retro-success)] bg-opacity-20 text-[var(--retro-success)]"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-[var(--retro-highlight)] mb-2">
            PENDING INVITATIONS
          </h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="p-3 bg-[var(--retro-black)] bg-opacity-50 rounded"
              >
                <div className="mb-2">
                  <span className="text-[var(--retro-secondary)]">From: </span>
                  <span className="font-bold">{invite.from}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <RetroButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleInviteResponse(invite.id, false)}
                  >
                    REJECT
                  </RetroButton>
                  <RetroButton
                    variant="success"
                    size="sm"
                    onClick={() => handleInviteResponse(invite.id, true)}
                  >
                    ACCEPT
                  </RetroButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current alliances */}
      <div className="mb-6">
        <h3 className="text-sm text-[var(--retro-highlight)] mb-2">
          YOUR ALLIANCES
        </h3>

        {playerAlliances.length > 0 ? (
          <div className="space-y-3">
            {playerAlliances.map((alliance) => {
              const ally = gameState.players[alliance.allyName];
              if (!ally) return null;

              return (
                <div
                  key={alliance.id}
                  className="p-3 rounded border border-[var(--retro-shadow)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: ally.color }}
                      ></div>
                      <span className="font-bold">{alliance.allyName}</span>
                    </div>
                    <span className="text-xs text-[var(--retro-secondary)]">
                      Formed {new Date(alliance.formed).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-1 bg-[var(--retro-black)] text-center">
                      <span className="block text-[var(--retro-secondary)]">
                        Combined Territories
                      </span>
                      <span className="text-[var(--retro-accent)]">
                        {ally.cellCount +
                          gameState.players[playerName].cellCount}
                      </span>
                    </div>
                    <div className="p-1 bg-[var(--retro-black)] text-center">
                      <span className="block text-[var(--retro-secondary)]">
                        Combined Power
                      </span>
                      <span className="text-[var(--retro-primary)]">
                        {Math.floor(
                          (ally.lastAction +
                            gameState.players[playerName].lastAction) /
                            60000
                        ) + 2}
                      </span>
                    </div>
                  </div>

                  <RetroButton
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleBreakAlliance(alliance.id)}
                  >
                    BREAK ALLIANCE
                  </RetroButton>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-[var(--retro-secondary)] bg-[var(--retro-black)] bg-opacity-30 rounded">
            You have no active alliances
          </div>
        )}
      </div>

      {/* Create new alliance */}
      <div className="border-t border-[var(--retro-shadow)] pt-4">
        <h3 className="text-sm text-[var(--retro-highlight)] mb-3">
          FORM NEW ALLIANCE
        </h3>

        <form onSubmit={handleInviteSubmit}>
          <div className="mb-3">
            <label className="block text-xs mb-1 text-[var(--retro-secondary)]">
              PLAYER NAME
            </label>
            <input
              type="text"
              className="retro-input w-full"
              value={newAllyName}
              onChange={(e) => setNewAllyName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>

          <RetroButton type="submit" variant="accent" fullWidth>
            SEND ALLIANCE REQUEST
          </RetroButton>
        </form>
      </div>

      {/* Alliance commands help */}
      <div className="mt-5 pt-4 border-t border-[var(--retro-shadow)] opacity-70 hover:opacity-100 transition-opacity">
        <h3 className="text-xs text-[var(--retro-highlight)] mb-1">
          NEED HELP?
        </h3>
        <p className="text-xs text-[var(--retro-secondary)] mb-2">
          You can also use alliance commands in the chat
        </p>

        <RetroButton
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() =>
            alert(
              "Alliance Commands:\n/ally invite {playername}\n/ally accept {playername}\n/ally reject {playername}\n/ally leave"
            )
          }
        >
          VIEW ALLIANCE COMMANDS
        </RetroButton>
      </div>
    </div>
  );
};

export default AlliancePanel;

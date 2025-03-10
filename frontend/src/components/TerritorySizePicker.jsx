import React, { useState } from "react";
import { RetroButton } from "./RetroButton";
import { getAllianceScore } from "../utils/gameState";

export const TerritorySizePicker = ({
  gameState,
  playerName,
  onAllianceAction,
}) => {
  const [showAlliances, setShowAlliances] = useState(false);
  const [newAllyName, setNewAllyName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Find player's current alliance
  const getCurrentAlliance = () => {
    if (!gameState.alliances) return null;

    for (const allianceId in gameState.alliances) {
      if (gameState.alliances[allianceId].members.includes(playerName)) {
        return {
          id: allianceId,
          ...gameState.alliances[allianceId],
        };
      }
    }
    return null;
  };

  const currentAlliance = getCurrentAlliance();

  // Get pending alliance invitations for this player
  const getPendingInvites = () => {
    if (!gameState.allianceInvites) return [];

    return gameState.allianceInvites.filter(
      (invite) => invite.to === playerName && invite.status === "pending"
    );
  };

  const pendingInvites = getPendingInvites();

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!newAllyName || newAllyName.trim() === "") {
      setMessage({ text: "Please enter a player name", type: "error" });
      return;
    }

    if (newAllyName === playerName) {
      setMessage({ text: "You can't invite yourself", type: "error" });
      return;
    }

    // Check if player exists
    if (!gameState.players[newAllyName]) {
      setMessage({ text: "Player not found", type: "error" });
      return;
    }

    onAllianceAction({
      type: "invite",
      from: playerName,
      to: newAllyName,
    });

    setMessage({ text: `Invitation sent to ${newAllyName}`, type: "success" });
    setNewAllyName("");
  };

  const handleAcceptInvite = (inviterName) => {
    onAllianceAction({
      type: "accept",
      from: playerName,
      to: inviterName,
    });

    setMessage({
      text: `Alliance accepted with ${inviterName}`,
      type: "success",
    });
  };

  const handleRejectInvite = (inviterName) => {
    onAllianceAction({
      type: "reject",
      from: playerName,
      to: inviterName,
    });

    setMessage({
      text: `Alliance rejected with ${inviterName}`,
      type: "success",
    });
  };

  const handleLeaveAlliance = () => {
    onAllianceAction({
      type: "leave",
      from: playerName,
    });

    setMessage({ text: "You left the alliance", type: "success" });
  };

  return (
    <div className="retro-container my-4">
      <h2 className="retro-header mb-4" data-text="ALLIANCES">
        ALLIANCES
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

      {currentAlliance ? (
        <div className="mb-4">
          <div className="mb-2">
            <span className="text-[var(--retro-highlight)]">
              Current Alliance:
            </span>
            <span className="text-[var(--retro-complement)]">
              {" "}
              {currentAlliance.name}
            </span>
          </div>
          <div className="mb-4">
            <span className="text-[var(--retro-highlight)]">
              Combined Power:
            </span>
            <span className="text-[var(--retro-accent)]">
              {" "}
              {getAllianceScore(gameState, currentAlliance.id)} cells
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-[var(--retro-complement)] mb-2">Members:</h3>
            <ul className="space-y-2">
              {currentAlliance.members.map((member) => (
                <li key={member} className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        gameState.players[member]?.color || "gray",
                      boxShadow: `0 0 4px ${
                        gameState.players[member]?.color || "gray"
                      }`,
                    }}
                  />
                  <span>{member}</span>
                  {member === currentAlliance.leader && (
                    <span className="ml-2 text-[var(--retro-complement)]">
                      👑
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <RetroButton variant="danger" onClick={handleLeaveAlliance}>
            Leave Alliance
          </RetroButton>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="text-[var(--retro-highlight)] mb-2">
              Create an Alliance
            </h3>
            <form
              onSubmit={handleInviteSubmit}
              className="flex flex-col space-y-2"
            >
              <input
                type="text"
                value={newAllyName}
                onChange={(e) => setNewAllyName(e.target.value)}
                placeholder="Player name"
                className="mb-2"
              />
              <RetroButton type="submit" variant="accent">
                Send Invite
              </RetroButton>
            </form>
          </div>

          {pendingInvites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[var(--retro-highlight)] mb-2">
                Alliance Invitations
              </h3>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.from}
                    className="p-2 border border-[var(--retro-complement)] rounded"
                  >
                    <p className="mb-2">
                      <span className="text-[var(--retro-complement)]">
                        {invite.from}
                      </span>{" "}
                      has invited you to an alliance
                    </p>
                    <div className="flex space-x-2">
                      <RetroButton
                        variant="complement"
                        onClick={() => handleAcceptInvite(invite.from)}
                        className="text-xs py-1"
                      >
                        Accept
                      </RetroButton>
                      <RetroButton
                        variant="danger"
                        onClick={() => handleRejectInvite(invite.from)}
                        className="text-xs py-1"
                      >
                        Reject
                      </RetroButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs mb-2">
          Alliance commands you can use in comments:
        </p>
        <ul className="text-xs space-y-1 text-[var(--retro-secondary)]">
          <li>/ally invite PlayerName</li>
          <li>/ally accept PlayerName</li>
          <li>/ally reject PlayerName</li>
          <li>/ally leave</li>
        </ul>
      </div>
    </div>
  );
};

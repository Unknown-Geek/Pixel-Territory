import React from "react";

/**
 * Alliance command help component
 * Shows available alliance commands and their usage
 */
export const AllianceCommands = () => {
  const commands = [
    {
      command: "/ally invite PlayerName",
      description: "Send alliance invite to player",
    },
    {
      command: "/ally accept PlayerName",
      description: "Accept alliance invitation",
    },
    {
      command: "/ally reject PlayerName",
      description: "Reject alliance invitation",
    },
    { command: "/ally leave", description: "Leave your current alliance" },
    { command: "/ally stats", description: "Show alliance statistics" },
  ];

  return (
    <div className="retro-container p-3 my-4">
      <h3 className="text-sm mb-2 text-[var(--retro-highlight)]">
        ALLIANCE COMMANDS
      </h3>
      <div className="text-xs space-y-2">
        <p className="text-[var(--retro-secondary)]">
          Use these commands in the comment section:
        </p>
        <table className="w-full border-collapse">
          <tbody>
            {commands.map((cmd, idx) => (
              <tr
                key={idx}
                className={
                  idx % 2 ? "bg-[var(--retro-shadow)] bg-opacity-30" : ""
                }
              >
                <td className="py-1 px-2 text-[var(--retro-primary)]">
                  {cmd.command}
                </td>
                <td className="py-1 px-2 text-[var(--retro-secondary)]">
                  {cmd.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-2 text-[var(--retro-secondary)] text-center text-[10px]">
          Alliance actions can also be performed through the Alliance panel
        </div>
      </div>
    </div>
  );
};

export default AllianceCommands;

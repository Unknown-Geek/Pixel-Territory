import React from "react";
import { RetroButton } from "./RetroButton";

export const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  variant = "primary",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Handle different variant styles
  const getIconForVariant = () => {
    switch (variant) {
      case "danger":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
        return "ℹ️";
      default:
        return "❓";
    }
  };

  const getBorderColorForVariant = () => {
    switch (variant) {
      case "danger":
        return "var(--retro-error)";
      case "success":
        return "var(--retro-success)";
      case "info":
        return "var(--retro-accent)";
      default:
        return "var(--retro-primary)";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="retro-container max-w-md w-full animate-rise"
        style={{ borderColor: getBorderColorForVariant() }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{getIconForVariant()}</span>
          <h3 className="text-lg">{title}</h3>
        </div>

        <div className="mb-6 text-[var(--retro-secondary)]">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="flex justify-end space-x-4">
          <RetroButton onClick={onCancel}>{cancelText}</RetroButton>

          <RetroButton
            variant={variant === "danger" ? "danger" : "accent"}
            onClick={onConfirm}
          >
            {confirmText}
          </RetroButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

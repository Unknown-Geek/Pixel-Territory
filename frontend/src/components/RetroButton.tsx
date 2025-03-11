import React from "react";

// Add explicit prop types
interface RetroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "complement" | "danger";
  fullWidth?: boolean;
  // 'type' will be inferred as "button" | "reset" | "submit" from ButtonHTMLAttributes
}

/**
 * A styled button component with retro aesthetics
 *
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, danger)
 * @param {React.ReactNode} props.children - Button content
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {string} [props.className=''] - Additional class names
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type='button'] - Button type
 */
export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = "primary",
  children,
  fullWidth = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  // Define button style variants
  const variantStyles = {
    primary:
      "border-[var(--retro-primary)] text-[var(--retro-primary)] hover:bg-[var(--retro-primary)]",
    secondary:
      "border-[var(--retro-secondary)] text-[var(--retro-secondary)] hover:bg-[var(--retro-secondary)]",
    accent:
      "border-[var(--retro-accent)] text-[var(--retro-accent)] hover:bg-[var(--retro-accent)]",
    complement:
      "border-[var(--retro-complement)] text-[var(--retro-complement)] hover:bg-[var(--retro-complement)]",
    danger:
      "border-[var(--retro-error)] text-[var(--retro-error)] hover:bg-[var(--retro-error)]",
  };

  // Add sound effect on click
  const handleClick = (e) => {
    if (!disabled && onClick) {
      // Play a retro sound effect (if you have sound capabilities)
      // For demonstration, you could add this functionality later
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`
        retro-button
        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default RetroButton;

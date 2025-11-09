import { HTMLProps } from "react";

export interface MUIconProps extends HTMLProps<HTMLSpanElement> {
  icon: string;
  variant?: "success" | "warning" | "error" | "info";
  style?: any;
  cursor?: string;
}

export const MUIcon = (props: MUIconProps) => {
  const { icon, variant } = props;
  const iconColor =
    variant === "info"
      ? undefined
      : variant === "success"
      ? "#60ce47"
      : variant === "warning"
      ? "orange"
      : variant === "error"
      ? "red"
      : undefined;

  return (
    <span
      {...props}
      style={{
        color: iconColor,
        cursor: props.onClick ? "pointer" : "default",
        ...props.style,
      }}
      className={`material-symbols-outlined ${props.className}`}
    >
      {icon}
    </span>
  );
};

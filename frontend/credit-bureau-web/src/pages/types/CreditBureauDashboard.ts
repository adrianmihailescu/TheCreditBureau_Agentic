export type IconName =
  | "users"
  | "handshake"
  | "bank"
  | "database"
  | "arrows"
  | "arrowDown"
  | "shield"
  | "clipboard"
  | "chart"
  | "file"
  | "bell"
  | "workflow"
  | "spark"
  | "lock"
  | "check";

export interface Actor {
  name: string;
  icon: IconName;
  description: string;
}

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export interface FlowStepProps {
  number: string;
  label: string;
  title: string;
  description: string;
}

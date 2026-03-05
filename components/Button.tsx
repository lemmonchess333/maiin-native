import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "brand" | "running" | "teal" | "outline";
  loading?: boolean;
  className?: string;
}

const bgMap = {
  brand: "bg-brand",
  running: "bg-running",
  teal: "bg-teal",
  outline: "border border-[#2A2A3A]",
} as const;

export function Button({
  title,
  variant = "brand",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`h-12 items-center justify-center rounded-xl ${bgMap[variant]} ${disabled || loading ? "opacity-50" : ""} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-base font-semibold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}

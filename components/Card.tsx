import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-[#1A1A24] p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

import { View, Text } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

interface PerformanceGaugeProps {
  score: number;
}

export function PerformanceGauge({ score }: PerformanceGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const RADIUS = 70;
  const CX = 90;
  const CY = 90;
  const arcLength = Math.PI * RADIUS;
  const progress = clamped / 100;
  const dashOffset = arcLength * (1 - progress);

  const color =
    clamped >= 80 ? "#34d399" :
    clamped >= 60 ? "#2dd4bf" :
    clamped >= 40 ? "#f59e0b" :
    "#FF6B6B";

  const band =
    clamped >= 80 ? "Peak" :
    clamped >= 60 ? "Building" :
    clamped >= 40 ? "Moderate" :
    "Recovery";

  // Needle tip
  const angle = Math.PI - progress * Math.PI;
  const nx = CX + RADIUS * Math.cos(angle);
  const ny = CY - RADIUS * Math.sin(angle);

  // Arc path
  const arcPath = (r: number, start: number, end: number) => {
    const sx = CX + r * Math.cos(start);
    const sy = CY - r * Math.sin(start);
    const ex = CX + r * Math.cos(end);
    const ey = CY - r * Math.sin(end);
    return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
  };

  return (
    <View className="items-center">
      <Svg width={180} height={100} viewBox="0 0 180 100">
        {/* Track */}
        <Path
          d={arcPath(RADIUS, Math.PI, 0)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <Path
          d={arcPath(RADIUS, Math.PI, 0)}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${arcLength}`}
          strokeDashoffset={dashOffset}
        />
        {/* Needle */}
        <Line
          x1={CX} y1={CY}
          x2={nx} y2={ny}
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Circle cx={CX} cy={CY} r={4} fill="white" />
        {/* Labels */}
        <SvgText x={14} y={98} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="middle">0</SvgText>
        <SvgText x={90} y={16} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="middle">50</SvgText>
        <SvgText x={166} y={98} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="middle">100</SvgText>
      </Svg>

      <View className="-mt-1 items-center">
        <Text className="text-4xl font-black" style={{ color }}>
          {Math.round(clamped)}
        </Text>
        <Text className="mt-0.5 text-xs font-semibold" style={{ color }}>
          {band}
        </Text>
        <Text className="text-[10px] text-gray-500">Performance Index</Text>
      </View>
    </View>
  );
}

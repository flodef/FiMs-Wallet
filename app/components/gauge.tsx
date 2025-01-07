import { useEffect, useState } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { Text } from './typography';

interface GaugeProps {
  value: number;
  title: string;
  subtitle: string;
}

export function Gauge({ value, title, subtitle }: GaugeProps) {
  const { page } = useNavigation();

  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (value !== animatedValue) {
      setAnimatedValue(value);
    } else {
      setAnimatedValue(0);
      const timeout = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [page, value]); // eslint-disable-line

  if (value < 0) return null;

  // SVG parameters
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Angle parameters (in degrees)
  const startAngle = 160;
  const endAngle = 380;
  const range = endAngle - startAngle;

  // Calculate the current value angle
  const valueAngle = startAngle + range * animatedValue;

  // Convert angle to coordinates
  const getCoordinates = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  // Generate path for the arc
  const createArc = (start: number, end: number) => {
    const startCoord = getCoordinates(start);
    const endCoord = getCoordinates(end);
    const largeArcFlag = end - start <= 180 ? '0' : '1';

    return `
      M ${startCoord.x} ${startCoord.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endCoord.x} ${endCoord.y}
    `;
  };

  // Calculate segment angles
  const segments = [
    { start: 0, end: 0.2, color: '#52c41a' }, // Green
    { start: 0.2, end: 0.4, color: '#a0d911' }, // Light green
    { start: 0.4, end: 0.6, color: '#faad14' }, // Orange
    { start: 0.6, end: 0.8, color: '#fa8c16' }, // Dark orange
    { start: 0.8, end: 1, color: '#ff4d4f' }, // Red
  ];

  return (
    <div id="gauge" className="relative w-full aspect-square max-w-[160px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {/* Inactive Segments */}
        {segments.map(({ start, end }) => (
          <path
            key={`inactive-${start}`}
            d={createArc(startAngle + range * start, startAngle + range * end)}
            fill="none"
            stroke="var(--bgSubtle)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}

        {/* Active Segments */}
        {segments.map(
          ({ start, end, color }) =>
            animatedValue >= start && (
              <path
                key={`active-${start}`}
                d={createArc(startAngle + range * start, startAngle + range * end)}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            ),
        )}

        {/* Needle */}
        <g transform={`rotate(${valueAngle} ${center} ${center})`} className="transition-all duration-1000">
          <circle cx={center} cy={center} r="8" className="fill-neutral-600" />
          <path
            d={`M ${center} ${center - 4} L ${center + radius - strokeWidth} ${center} L ${center} ${center + 4} Z`}
            className="fill-neutral-600"
          />
        </g>
      </svg>

      {/* Title and subtitle */}
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center">
        <Text className="text-lg">{title}</Text>
        <Text className="text-sm">{subtitle}</Text>
      </div>
    </div>
  );
}

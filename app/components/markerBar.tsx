import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useNavigation } from '../hooks/useNavigation';

interface MarkerBarProps {
  className?: string;
  color?: string;
  value: number;
  minValue: number;
  maxValue: number;
}

export function MarkerBar({ className, color, value, minValue, maxValue }: MarkerBarProps) {
  const { page } = useNavigation();

  const [animatedMin, setAnimatedMin] = useState(value);
  const [animatedMax, setAnimatedMax] = useState(value);
  const [isFirstRender, setIsFirstRender] = useState(false);

  // Determine if the range is positive or negative
  const isPositive = maxValue > value;
  const barColor =
    color || minValue + maxValue === 0 ? 'var(--bgSubtle)' : isPositive ? 'var(--success)' : 'var(--error)';

  useEffect(() => {
    setIsFirstRender(true);
  }, []);

  useEffect(() => {
    if (isFirstRender) return;
    setAnimatedMin(minValue);
    setAnimatedMax(maxValue);
  }, [minValue, maxValue, isFirstRender]);

  useEffect(() => {
    setIsFirstRender(false);

    // Start from the marker position
    setAnimatedMin(value);
    setAnimatedMax(value);

    // Animate to final positions after a brief delay
    const timeout = setTimeout(() => {
      setAnimatedMin(minValue);
      setAnimatedMax(maxValue);
    }, 100);
    return () => clearTimeout(timeout);
  }, [page, minValue, maxValue, value, isFirstRender]);

  return (
    <div className={twMerge('flex flex-col gap-1', className)}>
      <div className="relative h-2">
        {/* Background bar */}
        <div className="absolute inset-0 rounded-full" style={{ background: 'var(--bgSubtle)' }} />
        {/* Colored segment */}
        <div
          className={twMerge(
            'absolute h-full rounded-full',
            animatedMin === animatedMax ? 'transition-none' : 'transition-all duration-1000',
          )}
          style={{
            left: `${Math.min(animatedMin, animatedMax)}%`,
            width: `${Math.abs(animatedMax - animatedMin)}%`,
            backgroundColor: barColor,
          }}
        />

        {/* Value marker */}
        <div
          className={twMerge(
            'absolute h-4 w-1 -top-1 ring-2 rounded-full',
            'ring-theme-brand-inverted dark:ring-dark-theme-brand-inverted',
          )}
          style={{
            left: `${value - 0.22}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

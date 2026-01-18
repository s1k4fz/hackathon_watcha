import React from 'react';
import clsx from 'clsx';

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  isPlayer?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, label, isPlayer }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className={clsx("w-full", isPlayer ? "text-left" : "text-right")}>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-xs text-gray-600">{current} / {max}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded border border-gray-300 overflow-hidden">
        <div
          className={clsx(
            "h-full",
            percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

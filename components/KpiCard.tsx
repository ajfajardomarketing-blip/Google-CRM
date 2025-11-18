

import React from 'react';
import { TrendingDownIcon, TrendingUpIcon, InfoIcon } from './icons';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  goalProgress?: number;
  percentageChange?: number | null;
  secondaryValue?: string;
  invertTrendColor?: boolean;
  description?: string;
  valueClassName?: string;
  tooltipAlignment?: 'left' | 'center' | 'right';
  onInfoClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
    title, 
    value, 
    icon, 
    goalProgress, 
    percentageChange, 
    secondaryValue, 
    invertTrendColor, 
    description, 
    valueClassName, 
    tooltipAlignment = 'center',
    onInfoClick
}) => {
  const getChangeContent = () => {
    // If a goal is being displayed, don't show percentage change.
    if (goalProgress !== undefined) {
        return null;
    }
    
    // If percentageChange is null, undefined, Infinity, or -Infinity, return null.
    if (percentageChange == null || !isFinite(percentageChange)) {
      return null;
    }

    const isPositive = percentageChange >= 0;
    
    const trendColorClass = invertTrendColor
        ? (isPositive ? 'text-red-400' : 'text-green-400')
        : (isPositive ? 'text-green-400' : 'text-red-400');

    return (
      <div className={`flex items-center text-base font-semibold ${trendColorClass}`}>
        {isPositive ? <TrendingUpIcon className="h-5 w-5 mr-1" /> : <TrendingDownIcon className="h-5 w-5 mr-1" />}
        <span>
          {`${Math.abs(percentageChange).toFixed(1)}%`}
        </span>
      </div>
    );
  };

  const getTooltipPositionClasses = () => {
    switch (tooltipAlignment) {
      case 'left':
        return 'left-0';
      case 'right':
        return 'right-0';
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };
  
  return (
    <div className="relative group">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col justify-between min-h-[160px] transition-colors duration-300 hover:bg-gray-800">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
                    {onInfoClick && (
                        <button onClick={onInfoClick} className="text-gray-500 hover:text-white transition-colors">
                            <InfoIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {icon}
            </div>
            <div>
                <p className={`text-4xl font-bold mt-2 ${valueClassName || 'text-white'}`}>{value}</p>
                <div className="mt-2 flex items-center gap-2">
                {getChangeContent()}
                {secondaryValue && <p className="text-sm text-gray-400">{secondaryValue}</p>}
                </div>
                {goalProgress !== undefined && (
                <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{goalProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                        className="bg-[#d356f8] h-1.5 rounded-full" 
                        style={{ width: `${Math.min(goalProgress, 100)}%` }}
                    ></div>
                    </div>
                </div>
                )}
            </div>
        </div>
        {description && (
            <div className={`absolute bottom-full mb-2 w-max max-w-xs p-2 text-sm text-white bg-black rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 ${getTooltipPositionClasses()}`}>
                <p className="text-left">{description}</p>
            </div>
        )}
    </div>
  );
};

export default KpiCard;
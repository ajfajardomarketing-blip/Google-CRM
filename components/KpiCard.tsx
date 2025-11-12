
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  goalProgress?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, goalProgress }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {goalProgress !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{goalProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;

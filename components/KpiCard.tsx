
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  goalProgress?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, goalProgress }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        {icon}
      </div>
      <div>
        <p className="text-4xl font-bold text-white mt-2">{value}</p>
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
  );
};

export default KpiCard;


import React from 'react';
import { Integration, IntegrationStatus } from '../types';

interface IntegrationCardProps {
  integration: Integration;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration }) => {
  const isConnected = integration.status === IntegrationStatus.Connected;

  let buttonText: React.ReactNode;
  let buttonTitle: string;
  let buttonClassName: string;

  if (isConnected) {
    buttonText = 'Manage';
    buttonTitle = 'Management for this integration is not yet available.';
    buttonClassName = 'bg-gray-700 text-gray-400 cursor-not-allowed';
  } else {
    buttonText = 'API Coming Soon';
    buttonTitle = 'Automated API connection is coming soon.';
    buttonClassName = 'bg-gray-800 text-gray-500 cursor-not-allowed';
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg">
            <img src={integration.logo} alt={`${integration.name} logo`} className="h-7 w-7 object-contain" />
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isConnected
                ? 'bg-green-500/20 text-green-300'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {integration.status}
          </span>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
          <p className="text-sm text-gray-400">{integration.category}</p>
        </div>
      </div>
      <div className="mt-6">
        <button
          disabled
          className={`w-full py-1.5 px-3 rounded-lg font-semibold text-sm transition-colors duration-200 ${buttonClassName}`}
          title={buttonTitle}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default IntegrationCard;

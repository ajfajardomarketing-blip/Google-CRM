
import React, { useState } from 'react';
import { integrationsData as initialIntegrations } from '../data/mockData';
import IntegrationCard from '../components/IntegrationCard';
import FirebaseQuery from '../components/FirebaseQuery';
import { Integration } from '../types';

const IntegrationsView: React.FC = () => {
  const [integrations] = useState<Integration[]>(initialIntegrations);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Integrations & Tools</h1>
        <p className="mt-4 text-lg text-gray-400">
          Connect your marketing stack and use developer tools to interact with your data.
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl shadow-lg mb-10 p-4 border border-sky-500/30">
        <h2 className="text-xl font-bold text-white">Connect Your Tools</h2>
        <p className="text-gray-400 mt-2 text-sm">
            Automated API connections are coming soon. For now, all data in the "Metrics by Channel" table on the Dashboard can be entered and updated manually.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard 
            key={integration.name} 
            integration={integration}
          />
        ))}
      </div>

      <FirebaseQuery />
    </div>
  );
};

export default IntegrationsView;

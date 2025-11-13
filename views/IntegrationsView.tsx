

import React from 'react';
import { integrationsData } from '../data/mockData';
import IntegrationCard from '../components/IntegrationCard';
import FirebaseQuery from '../components/FirebaseQuery';

const IntegrationsView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">Integrations & Tools</h1>
        <p className="mt-4 text-xl text-gray-400">
          Connect your marketing stack and use developer tools to interact with your data.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {integrationsData.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>

      <FirebaseQuery />
    </div>
  );
};

export default IntegrationsView;

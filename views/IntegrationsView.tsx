
import React from 'react';
import { integrationsData } from '../data/mockData';
import IntegrationCard from '../components/IntegrationCard';

const IntegrationsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">The single source of truth you've always wanted</h1>
        <p className="mt-4 text-lg text-gray-400">
          Stop juggling logins. Stop downloading CSVs. Our platform pulls everything into <span className="text-blue-400 font-semibold">one intelligent system.</span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsData.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>
    </div>
  );
};

export default IntegrationsView;
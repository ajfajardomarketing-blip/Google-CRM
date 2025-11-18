





import React from 'react';
import { View } from '../types';
import { DashboardIcon, CrmIcon, CampaignsIcon, GoalsIcon, IntegrationsIcon, OperationsIcon, ReportingIcon } from './icons';

interface MobileNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, setCurrentView }) => {
  const allNavItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { view: View.CRM, label: 'CRM', icon: CrmIcon },
    { view: View.Campaigns, label: 'Campaigns', icon: CampaignsIcon },
    { view: View.Operations, label: 'Operations', icon: OperationsIcon },
    { view: View.Planning, label: 'Planning', icon: GoalsIcon },
    { view: View.Reporting, label: 'Reporting', icon: ReportingIcon },
    { view: View.Integrations, label: 'Integrations', icon: IntegrationsIcon }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 z-50">
      <div className="flex justify-around items-center h-16">
        {allNavItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
              currentView === item.view ? 'text-[#e9a7fb]' : 'text-gray-400 hover:text-white'
            }`}
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
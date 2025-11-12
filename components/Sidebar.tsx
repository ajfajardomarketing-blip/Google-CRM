
import React from 'react';
import { View } from '../types';
import { DashboardIcon, IntegrationsIcon, CrmIcon, CampaignsIcon, GoalsIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { view: View.CRM, label: 'CRM', icon: CrmIcon },
    { view: View.Campaigns, label: 'Campaigns', icon: CampaignsIcon },
  ];

  const managementItems = [
    { view: View.Goals, label: 'Goals', icon: GoalsIcon },
    { view: View.Integrations, label: 'Integrations', icon: IntegrationsIcon }
  ];

  return (
    <aside className="w-64 bg-gray-800 shadow-md flex-shrink-0 hidden md:flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Marketing OS</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.view}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.view);
                }}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-gray-700 divide-y divide-gray-700">
        <div className="px-4 py-3">
            <ul>
                {managementItems.map((item) => (
                    <li key={item.view}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentView(item.view);
                            }}
                            className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                                currentView === item.view
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-4">
            <div className="flex items-center">
                <img className="h-10 w-10 rounded-full object-cover" src="https://picsum.photos/100" alt="User" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-gray-200">Jane Doe</p>
                    <p className="text-xs text-gray-400">Marketing Manager</p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

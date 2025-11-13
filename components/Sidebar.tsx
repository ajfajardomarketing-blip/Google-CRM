
import React from 'react';
import { View } from '../types';
import { DashboardIcon, IntegrationsIcon, CrmIcon, CampaignsIcon, GoalsIcon, ChevronDoubleLeftIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isCollapsed, setIsCollapsed }) => {
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
    <aside className={`bg-gray-900 shadow-md flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`h-16 flex items-center border-b border-gray-700 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
        {isCollapsed ? (
          <div className="text-2xl font-bold text-white">M</div>
        ) : (
          <h1 className="text-2xl font-bold text-white">Marketing OS</h1>
        )}
      </div>
      
      <div className={`px-2 py-2 border-b border-gray-700 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center w-full p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronDoubleLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            <span className={`font-medium ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>Collapse</span>
          </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.view} title={isCollapsed ? item.label : undefined}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.view);
                }}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-[#d356f8] text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-gray-700">
        <div className="px-2 py-3 space-y-2">
            <ul>
                {managementItems.map((item) => (
                    <li key={item.view} title={isCollapsed ? item.label : undefined}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentView(item.view);
                            }}
                            className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                                currentView === item.view
                                ? 'bg-[#d356f8] text-white shadow-sm'
                                : 'text-gray-300 hover:bg-gray-700'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className={`font-medium ml-3 whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-4 border-t border-gray-700">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src="https://picsum.photos/100" alt="User" />
                <div className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                    <p className="text-base font-medium text-gray-200">Jane Doe</p>
                    <p className="text-sm text-gray-400">Marketing Manager</p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

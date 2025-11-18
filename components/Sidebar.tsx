

import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { DashboardIcon, IntegrationsIcon, CrmIcon, CampaignsIcon, GoalsIcon, ChevronDoubleLeftIcon, OperationsIcon, ReportingIcon } from './icons';
import ProfileEditModal from './ProfileEditModal';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' className={className}>
      <defs>
        <linearGradient id='grad1' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#E570FF' />
          <stop offset='100%' stopColor='#BE60F3' />
        </linearGradient>
        <linearGradient id='grad2' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#B152EF' />
          <stop offset='100%' stopColor='#8D4CDF' />
        </linearGradient>
        <linearGradient id='grad3' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='#8545D9' />
          <stop offset='100%' stopColor='#6234C5' />
        </linearGradient>
      </defs>
      <rect x='25' y='25' width='50' height='50' rx='8' transform='rotate(45 50 50) translate(0, 14)' fill='url(#grad3)'/>
      <rect x='25' y='25' width='50' height='50' rx='8' transform='rotate(45 50 50) translate(0, 0)' fill='url(#grad2)'/>
      <rect x='25' y='25' width='50' height='50' rx='8' transform='rotate(45 50 50) translate(0, -14)' fill='url(#grad1)'/>
    </svg>
);

interface UserProfile {
  name: string;
  company: string;
  image: string | null;
}

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isCollapsed, setIsCollapsed }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'A.J Fajardo',
    company: 'Cóndor Comunicaciones',
    image: null,
  });

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
    }
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    try {
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
    } catch (error) {
      console.error("Failed to save user profile to localStorage", error);
    }
    setIsProfileModalOpen(false);
  };

  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: DashboardIcon },
    { view: View.CRM, label: 'CRM', icon: CrmIcon },
    { view: View.Campaigns, label: 'Campaigns', icon: CampaignsIcon },
    { view: View.Operations, label: 'Operations', icon: OperationsIcon },
    { view: View.Planning, label: 'Planning', icon: GoalsIcon },
    { view: View.Reporting, label: 'Reporting', icon: ReportingIcon },
  ];

  const managementItems = [
    { view: View.Integrations, label: 'Integrations', icon: IntegrationsIcon }
  ];

  const getUserInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <aside className={`bg-gray-900 shadow-md flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`h-16 flex items-center gap-2 border-b border-gray-700 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
          <LogoIcon className="w-8 h-8 flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-white whitespace-nowrap">Marketing OS</h1>
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
              <button onClick={() => setIsProfileModalOpen(true)} className={`flex items-center w-full text-left rounded-lg p-2 hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`} title="Edit Profile">
                  {userProfile.image ? (
                    <img src={userProfile.image} alt="Profile" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-sm bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getUserInitials(userProfile.name)}
                    </div>
                  )}
                  <div className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                      <p className="text-base font-medium text-gray-200">{userProfile.name}</p>
                      <p className="text-sm text-gray-400">{userProfile.company}</p>
                  </div>
              </button>
          </div>
        </div>
      </aside>
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={userProfile}
        onSave={handleSaveProfile}
      />
    </>
  );
};

export default Sidebar;
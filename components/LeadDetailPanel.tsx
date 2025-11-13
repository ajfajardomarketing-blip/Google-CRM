
import React from 'react';
import { Lead } from '../types';
import { CloseIcon } from './icons';

interface LeadDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stageName: string | null;
  leads: Lead[];
}

const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ isOpen, onClose, stageName, leads }) => {

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Leads in "{stageName}"</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
          {leads.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {leads.map(lead => (
                <li key={lead.id} className="py-4">
                  <p className="font-semibold text-white">{lead.name}</p>
                  <p className="text-base text-gray-400">{lead.company}</p>
                  {(lead.stage === 'Opportunity' || lead.stage === 'Conversion') && lead.dealValue && (
                     <p className="text-base text-green-400 font-medium mt-1">${lead.dealValue.toLocaleString()}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-full flex items-center justify-center">
                <p className="text-base text-gray-500 text-center">No leads in this stage.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadDetailPanel;

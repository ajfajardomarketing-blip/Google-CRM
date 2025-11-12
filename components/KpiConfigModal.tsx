
import React, { useState, useEffect } from 'react';
import { campaignKpiOptions } from '../data/mockData';

interface KpiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Record<string, Record<string, boolean>>;
  onSave: (newConfig: Record<string, Record<string, boolean>>) => void;
}

const KpiConfigModal: React.FC<KpiConfigModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const channels = Object.keys(campaignKpiOptions);
  const [activeTab, setActiveTab] = useState(channels[0]);

  useEffect(() => {
    setLocalConfig(config);
  }, [isOpen, config]);

  const handleCheckboxChange = (channel: string, kpiId: string, isChecked: boolean) => {
    setLocalConfig(prevConfig => ({
      ...prevConfig,
      [channel]: {
        ...prevConfig[channel],
        [kpiId]: isChecked,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Configure Campaign KPIs</h2>
          <p className="text-sm text-gray-400 mt-1">Select the metrics you want to see for each channel.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                  {channels.map((channel) => (
                      <button
                          key={channel}
                          type="button"
                          onClick={() => setActiveTab(channel)}
                          className={`${
                              activeTab === channel
                              ? 'border-blue-500 text-blue-400'
                              : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                      >
                          {channel}
                      </button>
                  ))}
              </nav>
          </div>

          <div className="p-6 max-h-80 overflow-y-auto">
            {channels.map((channel) => (
                <div key={channel} className={`${activeTab === channel ? 'block' : 'hidden'}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                        {(campaignKpiOptions[channel] || []).map(kpi => (
                             <label key={kpi.id} className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    checked={!!localConfig[channel]?.[kpi.id]}
                                    onChange={(e) => handleCheckboxChange(channel, kpi.id as string, e.target.checked)}
                                />
                                <span className="text-sm text-gray-300">{kpi.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
          </div>
          <div className="bg-gray-900 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KpiConfigModal;
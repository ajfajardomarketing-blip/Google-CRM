

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
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);

  useEffect(() => {
    // Reset state when modal opens
    setLocalConfig(config);
    if (channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
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
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Configure Campaign KPIs</h2>
          <p className="text-base text-gray-400 mt-1">Select the metrics you want to see for each channel.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="channel-select" className="block text-base font-medium text-gray-300">Channel</label>
              <select
                id="channel-select"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="mt-1 block w-full bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]"
              >
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="pt-2 border-t border-gray-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 pt-4">
                {(campaignKpiOptions[selectedChannel] || []).map(kpi => (
                     <label key={kpi.id} className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-[#d356f8] bg-gray-700 border-gray-600 rounded focus:ring-[#d356f8]"
                            checked={!!localConfig[selectedChannel]?.[kpi.id]}
                            onChange={(e) => handleCheckboxChange(selectedChannel, kpi.id as string, e.target.checked)}
                        />
                        <span className="text-base text-gray-300">{kpi.label}</span>
                    </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-black px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="bg-[#d356f8] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KpiConfigModal;

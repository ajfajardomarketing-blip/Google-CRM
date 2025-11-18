import React, { useState } from 'react';
import AiAssistantChatWindow from './AiAssistantChatWindow';
import { SparklesIcon, CloseIcon } from './icons';
import { Lead, Campaign, CampaignGroup, GoalSettings, PlatformMetrics, Message } from '../types';

interface AiAssistantBubbleProps {
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  goals: GoalSettings;
  actualMetrics: PlatformMetrics[];
  dateRange: string | { start: Date; end: Date };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const AiAssistantBubble: React.FC<AiAssistantBubbleProps> = (props) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-gradient-to-br from-[#d356f8] to-[#8D4CDF] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#d356f8]"
          aria-label={isChatOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          {isChatOpen ? <CloseIcon className="w-8 h-8" /> : <SparklesIcon className="w-8 h-8" />}
        </button>
      </div>
      <AiAssistantChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        {...props}
      />
    </>
  );
};

export default AiAssistantBubble;
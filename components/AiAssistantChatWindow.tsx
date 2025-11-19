import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Lead, Campaign, CampaignGroup, GoalSettings, PlatformMetrics, Message, LeadStage } from '../types';
import { CloseIcon, SparklesIcon, SendIcon } from './icons';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import remarkGfm from 'https://esm.sh/remark-gfm@4';

interface AiAssistantChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  campaigns: Campaign[];
  campaignGroups: CampaignGroup[];
  goals: GoalSettings;
  actualMetrics: PlatformMetrics[];
  dateRange: string | { start: Date; end: Date };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

// Helper function to get date periods
const getPeriods = (range: string | { start: Date; end: Date }): { current: { start: Date; end: Date } } => {
    const now = new Date();
    let currentStart: Date, currentEnd: Date;

    if (typeof range === 'string') {
        currentEnd = new Date();
        currentEnd.setHours(23, 59, 59, 999);
        switch (range) {
            case 'Last 30 Days':
                currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
                currentStart.setHours(0, 0, 0, 0);
                break;
            case 'Last 90 Days':
                currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89);
                currentStart.setHours(0, 0, 0, 0);
                break;
            case 'Last Year':
                currentStart = new Date(now.getFullYear() - 1, 0, 1);
                currentEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
                break;
            case 'This Year':
            default:
                currentStart = new Date(now.getFullYear(), 0, 1);
                break;
        }
    } else {
        currentStart = range.start;
        currentEnd = range.end;
    }

    return {
        current: { start: currentStart, end: currentEnd },
    };
};


const AiAssistantChatWindow: React.FC<AiAssistantChatWindowProps> = ({ isOpen, onClose, dateRange, messages, setMessages, ...data }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        const periods = getPeriods(dateRange);
        
        // Filter data based on the selected period
        const filteredLeads = data.leads.filter(lead => {
            const leadDate = new Date(lead.dateAdded);
            return leadDate >= periods.current.start && leadDate <= periods.current.end;
        });
        
        const filteredCampaigns = data.campaigns.filter(campaign => {
            const campaignStartDate = new Date(campaign.startDate);
            return campaignStartDate <= periods.current.end && (!campaign.endDate || new Date(campaign.endDate) >= periods.current.start);
        });

        // --- CALCULATE ACTUAL PERFORMANCE METRICS ---
        // We calculate ROAS, Cost, Revenue per channel so the AI has the "Real" numbers, not just the Goals.
        const groups = data.campaignGroups || [];
        // Fix: Explicitly type uniqueChannels as string[] to prevent "Type 'unknown' cannot be used as an index" error
        const uniqueChannels: string[] = Array.from(new Set(groups.map(g => g.channel)));
        const calculatedChannelPerformance: Record<string, any> = {};

        uniqueChannels.forEach(channel => {
            if (!channel) return;
            
            // 1. Filter campaigns for this channel to get Cost (Ad Spend)
            const channelGroupIds = groups.filter(g => g.channel === channel).map(g => g.id);
            const channelCampaigns = filteredCampaigns.filter(c => channelGroupIds.includes(c.campaignGroupId));
            const cost = channelCampaigns.reduce((sum, c) => sum + (c.cost || 0), 0);

            // 2. Filter leads for this channel to get Revenue (Deal Value)
            // Note: We use filteredLeads to ensure we are looking at revenue generated *in this period*
            const channelLeads = filteredLeads.filter(l => l.channel === channel);
            const conversions = channelLeads.filter(l => l.stage === LeadStage.Conversion).length;
            const revenue = channelLeads
                .filter(l => l.stage === LeadStage.Conversion)
                .reduce((sum, l) => sum + (l.dealValue || 0), 0);

            // 3. Calculate KPIs
            const roas = cost > 0 ? revenue / cost : 0;
            const cpa = conversions > 0 ? cost / conversions : 0;
            const cpl = channelLeads.length > 0 ? cost / channelLeads.length : 0;

            calculatedChannelPerformance[channel] = {
                spend: cost,
                revenue: revenue,
                conversions: conversions,
                leads: channelLeads.length,
                actualROAS: parseFloat(roas.toFixed(2)), // Explicitly named 'actualROAS'
                actualCPA: parseFloat(cpa.toFixed(2)),
                actualCPL: parseFloat(cpl.toFixed(2))
            };
        });

        const dataContext = JSON.stringify({
            currentDateRange: periods.current,
            calculatedChannelPerformance: calculatedChannelPerformance, // <--- Priority Data
            goals: data.goals,
            leadsInPeriod: filteredLeads.map(({ id, ...rest }) => rest),
            campaignsActiveInPeriod: filteredCampaigns.map(({ id, ...rest }) => rest),
            allCampaignGroups: groups.map(({ id, ...rest }) => rest),
            // historicalMetricsData: data.actualMetrics // Removed to reduce token usage and confusion
        }, null, 2);

        const systemInstruction = `You are a world-class Marketing Strategist AI Assistant named "Marketing OS Copilot".
        
        **CRITICAL INSTRUCTION ON DATA PRIORITY:**
        - The context contains 'calculatedChannelPerformance' (ACTUAL RESULTS) and 'goals' (TARGETS).
        - If the user asks for "my ROAS", "my spend", or "my performance", YOU MUST USE 'calculatedChannelPerformance'.
        - ONLY use 'goals' if the user specifically asks for "targets", "goals", or "budgeted" numbers.
        - If there is a conflict between 'calculatedChannelPerformance' and 'goals', the 'calculatedChannelPerformance' is the truth for what actually happened.

        **CONTEXT:**
        - The data is filtered for the period: ${JSON.stringify(periods.current)}.
        - 'calculatedChannelPerformance' contains the aggregated Spend, Revenue, ROAS, and CPA for each channel based on the filtered data.
        - 'leadsInPeriod' contains individual lead details.
        
        **YOUR TASK:**
        - Analyze the provided JSON data context to answer the user's question.
        - Be concise, insightful, and professional. Use Markdown for formatting.
        - If the data isn't sufficient, state clearly what is missing.
        
        **DATA CONTEXT:**
        ${dataContext}
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const history = newMessages.slice(0, -1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const response = await chat.sendMessageStream({ message: userMessage.content });

        let modelResponse = '';
        setMessages(prev => [...prev, { sender: 'model', content: '' }]);

        for await (const chunk of response) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1].content = modelResponse;
                return updatedMessages;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, { sender: 'model', content: 'Sorry, I encountered an error. Please check your API key and try again.' }]);
    } finally {
        setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col border border-gray-700">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-[#d356f8]" />
            <h3 className="text-lg font-bold text-white">Marketing OS Copilot</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-sm rounded-xl px-4 py-2 ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-xs md:max-w-sm rounded-xl px-4 py-2 bg-gray-700 text-gray-200 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-grow bg-gray-700 border-gray-600 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#d356f8]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#d356f8] text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantChatWindow;
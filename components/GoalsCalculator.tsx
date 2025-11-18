

import React, { useMemo } from 'react';
import { CalculatorInputs } from '../types';

interface GoalsCalculatorProps {
    inputs: CalculatorInputs;
    onInputsChange: (newInputs: CalculatorInputs) => void;
}

// A reusable component for displaying a single result
const ResultCard: React.FC<{ label: string; value: string; isHighlighted?: boolean }> = ({ label, value, isHighlighted }) => (
    <div className={`flex justify-between items-center p-4 rounded-lg ${isHighlighted ? 'bg-gray-700' : 'bg-black/50'}`}>
        <span className="text-base text-gray-300 uppercase tracking-wider">{label}</span>
        <span className={`text-2xl font-bold ${isHighlighted ? 'text-[#e9a7fb]' : 'text-white'}`}>{value}</span>
    </div>
);

// Helper function to format numbers as currency
const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

// Helper function to format plain numbers with commas
const formatNumber = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.ceil(value));
};

const GoalsCalculator: React.FC<GoalsCalculatorProps> = ({ inputs, onInputsChange }) => {
    
    // Handler for all input changes, now calls the prop function
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let numericValue: number;

        if (type === 'text') {
            numericValue = parseFloat(value.replace(/,/g, '')) || 0;
        } else {
            numericValue = parseFloat(value) || 0;
        }
        
        onInputsChange({ ...inputs, [name]: numericValue });
    };
    
    // Calculate results based on inputs, memoized for performance
    const results = useMemo(() => {
        const { totalSalesGoal, marketingContribution, avgTicket, oppToCustomerRate, leadToOppRate, avgCpl } = inputs;

        const marketingSalesGoal = totalSalesGoal * (marketingContribution / 100);
        const requiredCustomers = avgTicket > 0 ? marketingSalesGoal / avgTicket : 0;
        const requiredOpportunities = oppToCustomerRate > 0 ? requiredCustomers / (oppToCustomerRate / 100) : 0;
        const requiredLeads = leadToOppRate > 0 ? requiredOpportunities / (leadToOppRate / 100) : 0;
        const estimatedInvestment = requiredLeads * avgCpl;
        const expectedRoas = estimatedInvestment > 0 ? marketingSalesGoal / estimatedInvestment : 0;

        return {
            marketingSalesGoal,
            requiredCustomers,
            requiredOpportunities,
            requiredLeads,
            estimatedInvestment,
            expectedRoas,
        };
    }, [inputs]);

    return (
        <div className="space-y-8">
            {/* Input Section */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-1">Inputs</h2>
                <p className="text-gray-400 mb-6">Define your high-level goals and conversion rates to project your marketing needs.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="totalSalesGoal" className="block text-base font-medium text-gray-300">Total Sales Goal ($)</label>
                        <input id="totalSalesGoal" type="text" name="totalSalesGoal" value={inputs.totalSalesGoal.toLocaleString('en-US')} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                    </div>
                    <div>
                        <label htmlFor="marketingContribution" className="block text-base font-medium text-gray-300">% Sales from Marketing ({inputs.marketingContribution}%)</label>
                        <input id="marketingContribution" type="range" name="marketingContribution" min="0" max="100" value={inputs.marketingContribution} onChange={handleInputChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-3 accent-[#d356f8]" />
                    </div>
                    <div>
                        <label htmlFor="avgTicket" className="block text-base font-medium text-gray-300">Average Ticket ($)</label>
                        <input id="avgTicket" type="text" name="avgTicket" value={inputs.avgTicket.toLocaleString('en-US')} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                    </div>
                    <div>
                        <label htmlFor="avgCpl" className="block text-base font-medium text-gray-300">Average CPL ($)</label>
                        <input id="avgCpl" type="text" name="avgCpl" value={inputs.avgCpl.toLocaleString('en-US')} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                    </div>
                    <div>
                        <label htmlFor="leadToOppRate" className="block text-base font-medium text-gray-300">MQL → Opportunity (%)</label>
                        <input id="leadToOppRate" type="number" name="leadToOppRate" value={inputs.leadToOppRate} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                    </div>
                    <div>
                        <label htmlFor="oppToCustomerRate" className="block text-base font-medium text-gray-300">Opportunity → Customer (%)</label>
                        <input id="oppToCustomerRate" type="number" name="oppToCustomerRate" value={inputs.oppToCustomerRate} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-[#d356f8] focus:border-[#d356f8]" />
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Results</h2>
                <div className="space-y-3">
                    <ResultCard label="Total Sales Goal" value={formatCurrency(inputs.totalSalesGoal)} />
                    <ResultCard label="Sales Attributed to Marketing" value={formatCurrency(results.marketingSalesGoal)} isHighlighted />
                    <ResultCard label="Required Customers" value={formatNumber(results.requiredCustomers)} />
                    <ResultCard label="Required Opportunities" value={formatNumber(results.requiredOpportunities)} />
                    <ResultCard label="Required MQLs" value={formatNumber(results.requiredLeads)} />
                    <ResultCard label="Estimated Investment" value={formatCurrency(results.estimatedInvestment)} isHighlighted />
                    <ResultCard label="Expected ROAS" value={`${results.expectedRoas.toFixed(2)}x`} />
                </div>
            </div>
            
            {/* Interpretation Section */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Interpretation</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                    To achieve <strong className="text-[#e9a7fb]">{formatCurrency(results.marketingSalesGoal)}</strong> in sales attributed to marketing, you will need <strong className="text-white">{formatNumber(results.requiredLeads)}</strong> MQLs at an estimated CPL of <strong className="text-white">{formatCurrency(inputs.avgCpl)}</strong>, which implies an investment of <strong className="text-[#e9a7fb]">{formatCurrency(results.estimatedInvestment)}</strong> and an expected ROAS of <strong className="text-white">{results.expectedRoas.toFixed(2)}x</strong>.
                </p>
            </div>
        </div>
    );
};

export default GoalsCalculator;
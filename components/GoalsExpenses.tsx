import React, { useState, useMemo } from 'react';
import { FixedExpense, VariableExpense, Campaign, CampaignGroup, GoalSettings } from '../types';
import { TrashIcon, EditIcon, CheckIcon, CloseIcon } from './icons';

interface GoalsExpensesProps {
    expenses: Required<GoalSettings>['expenses'];
    onExpensesChange: (newExpenses: Required<GoalSettings>['expenses']) => void;
    campaigns: Campaign[];
    campaignGroups: CampaignGroup[];
    dateRange: string | { start: Date; end: Date };
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const GoalsExpenses: React.FC<GoalsExpensesProps> = ({ expenses, onExpensesChange, campaigns, campaignGroups, dateRange }) => {
    // Destructure with default values to prevent runtime errors if properties are missing from the Firestore object.
    const { salaries = [], tools = [], variable = [] } = expenses || {};
    
    const [newSalary, setNewSalary] = useState({ name: '', monthlyAmount: '' });
    const [newTool, setNewTool] = useState({ name: '', monthlyAmount: '' });
    const [newVariable, setNewVariable] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0] });

    const [editingExpense, setEditingExpense] = useState<{ type: 'salary' | 'tool' | 'variable'; expense: FixedExpense | VariableExpense | { monthlyAmount?: string | number, amount?: string | number } } | null>(null);

    const handleEditClick = (type: 'salary' | 'tool' | 'variable', expense: FixedExpense | VariableExpense) => {
        setEditingExpense({ type, expense: { ...expense } });
    };

    const handleCancelEdit = () => {
        setEditingExpense(null);
    };

    const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingExpense) return;
        const { name, value } = e.target;
        setEditingExpense({
            ...editingExpense,
            expense: {
                ...editingExpense.expense,
                [name]: value,
            },
        });
    };

    const handleSaveEdit = () => {
        if (!editingExpense) return;
        const { type, expense } = editingExpense;
    
        const expenseToSave = { ...expense };
        if ('monthlyAmount' in expenseToSave) {
            expenseToSave.monthlyAmount = parseFloat(String(expenseToSave.monthlyAmount)) || 0;
        }
        if ('amount' in expenseToSave) {
            expenseToSave.amount = parseFloat(String(expenseToSave.amount)) || 0;
        }

        let updatedSalaries = salaries;
        let updatedTools = tools;
        let updatedVariable = variable;

        if (type === 'salary') {
            updatedSalaries = salaries.map(s => s.id === expenseToSave.id ? expenseToSave as FixedExpense : s);
        } else if (type === 'tool') {
            updatedTools = tools.map(t => t.id === expenseToSave.id ? expenseToSave as FixedExpense : t);
        } else if (type === 'variable') {
            updatedVariable = variable.map(v => v.id === expenseToSave.id ? expenseToSave as VariableExpense : v);
        }

        onExpensesChange({
            salaries: updatedSalaries,
            tools: updatedTools,
            variable: updatedVariable,
        });

        setEditingExpense(null);
    };


    const handleAddSalary = () => {
        if (!newSalary.name || !newSalary.monthlyAmount) return;
        const newExpense: FixedExpense = {
            id: generateId(),
            name: newSalary.name,
            monthlyAmount: parseFloat(newSalary.monthlyAmount)
        };
        onExpensesChange({
            salaries: [...salaries, newExpense],
            tools,
            variable
        });
        setNewSalary({ name: '', monthlyAmount: '' });
    };

    const handleDeleteSalary = (id: string) => {
        onExpensesChange({
            salaries: salaries.filter(exp => exp.id !== id),
            tools,
            variable
        });
    };

    const handleAddTool = () => {
        if (!newTool.name || !newTool.monthlyAmount) return;
        const newExpense: FixedExpense = {
            id: generateId(),
            name: newTool.name,
            monthlyAmount: parseFloat(newTool.monthlyAmount)
        };
        onExpensesChange({
            salaries,
            tools: [...tools, newExpense],
            variable
        });
        setNewTool({ name: '', monthlyAmount: '' });
    };

    const handleDeleteTool = (id: string) => {
        onExpensesChange({
            salaries,
            tools: tools.filter(exp => exp.id !== id),
            variable
        });
    };

    const handleAddVariableExpense = () => {
        if (!newVariable.name || !newVariable.amount || !newVariable.date) return;
        const newExpense: VariableExpense = {
            id: generateId(),
            name: newVariable.name,
            amount: parseFloat(newVariable.amount),
            date: newVariable.date
        };
        onExpensesChange({
            salaries,
            tools,
            variable: [...variable, newExpense],
        });
        setNewVariable({ name: '', amount: '', date: new Date().toISOString().split('T')[0] });
    };

    const handleDeleteVariableExpense = (id: string) => {
        onExpensesChange({
            salaries,
            tools,
            variable: variable.filter(exp => exp.id !== id)
        });
    };

    const period = useMemo(() => {
        const now = new Date();
        let currentStart: Date, currentEnd: Date;

        if (typeof dateRange === 'string') {
            currentEnd = new Date();
            currentEnd.setHours(23, 59, 59, 999);
            switch (dateRange) {
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
            currentStart = dateRange.start;
            currentEnd = dateRange.end;
        }
        return { start: currentStart, end: currentEnd };
    }, [dateRange]);

    const periodBreakdown = useMemo(() => {
        const paidChannels = ['Meta Ads', 'Google Ads', 'LinkedIn Ads'];
        const paidGroupIds = campaignGroups.filter(g => paidChannels.includes(g.channel)).map(g => g.id);

        const filteredCampaigns = campaigns.filter(campaign => {
            const campaignStartDate = new Date(campaign.startDate);
            return campaignStartDate >= period.start && campaignStartDate <= period.end;
        });

        const adSpend = filteredCampaigns
            .filter(c => paidGroupIds.includes(c.campaignGroupId))
            .reduce((sum, c) => sum + c.cost, 0);
        
        const variableUserAdded = variable
            .filter(e => {
                const expenseDate = new Date(e.date + 'T00:00:00');
                return !e.isAutoGenerated && expenseDate >= period.start && expenseDate <= period.end;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        const months = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
        const roundedMonths = parseFloat(months.toFixed(2));
        
        const salariesForPeriod = salaries.reduce((sum, exp) => sum + exp.monthlyAmount, 0) * roundedMonths;
        const toolsForPeriod = tools.reduce((sum, exp) => sum + exp.monthlyAmount, 0) * roundedMonths;
        
        const recurringSubtotal = salariesForPeriod + toolsForPeriod;
        const variableSubtotal = adSpend + variableUserAdded;
        const total = recurringSubtotal + variableSubtotal;

        return {
            salaries: salariesForPeriod,
            tools: toolsForPeriod,
            adSpend: adSpend,
            variable: variableUserAdded,
            recurringSubtotal,
            variableSubtotal,
            total: total,
            months: roundedMonths
        };
    }, [salaries, tools, variable, campaigns, campaignGroups, period]);
    
    const annualBreakdown = useMemo(() => {
        const paidChannels = ['Meta Ads', 'Google Ads', 'LinkedIn Ads'];
        const paidGroupIds = campaignGroups.filter(g => paidChannels.includes(g.channel)).map(g => g.id);
        const currentYear = new Date().getFullYear();

        const totalMonthlySalaries = salaries.reduce((sum, s) => sum + s.monthlyAmount, 0);
        const totalMonthlyTools = tools.reduce((sum, t) => sum + t.monthlyAmount, 0);

        const annualSalaries = totalMonthlySalaries * 12;
        const annualTools = totalMonthlyTools * 12;
        
        const adSpendAnnual = campaigns
            .filter(c => {
                const campaignDate = new Date(c.startDate);
                return paidGroupIds.includes(c.campaignGroupId) && campaignDate.getFullYear() === currentYear;
            })
            .reduce((sum, c) => sum + c.cost, 0);

        const variableAnnual = variable
            .filter(v => {
                const expenseDate = new Date(v.date + 'T00:00:00');
                return !v.isAutoGenerated && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, v) => sum + v.amount, 0);

        const totalAnnual = annualSalaries + annualTools + adSpendAnnual + variableAnnual;

        return {
            salaries: annualSalaries,
            tools: annualTools,
            adSpend: adSpendAnnual,
            variable: variableAnnual,
            total: totalAnnual,
        };
    }, [salaries, tools, variable, campaigns, campaignGroups]);
    
    const getDateRangeText = (range: string | { start: Date; end: Date }): string => {
        if (typeof range === 'string') {
            return range;
        }
        if (range?.start && range?.end) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            if (range.start.toDateString() === range.end.toDateString()) {
                 return range.start.toLocaleDateString(undefined, options);
            }
            return `${range.start.toLocaleDateString(undefined, options)} - ${range.end.toLocaleDateString(undefined, options)}`;
        }
        return '...';
    };
    
    const totalSalaries = useMemo(() => salaries.reduce((sum, s) => sum + s.monthlyAmount, 0), [salaries]);
    const totalTools = useMemo(() => tools.reduce((sum, t) => sum + t.monthlyAmount, 0), [tools]);
    const totalVariable = useMemo(() => {
        const manualVariableTotal = variable
            .filter(exp => !exp.isAutoGenerated)
            .reduce((sum, exp) => sum + exp.amount, 0);
        return periodBreakdown.adSpend + manualVariableTotal;
    }, [variable, periodBreakdown.adSpend]);


    return (
        <div className="space-y-8">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white">Spend Breakdown</h3>
                    <p className="text-sm text-gray-400 mb-4">For period: {getDateRangeText(dateRange)}</p>
                    
                    <div className="space-y-4">
                        {/* Recurring Expenses Section */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-200">Recurring Expenses</h4>
                            <div className="pl-4 mt-2 space-y-1 border-l-2 border-gray-700">
                                <div className="flex justify-between text-base"><span className="text-gray-400">Salaries</span><span className="font-medium text-gray-200">{formatCurrency(periodBreakdown.salaries)}</span></div>
                                <div className="flex justify-between text-base"><span className="text-gray-400">Tools</span><span className="font-medium text-gray-200">{formatCurrency(periodBreakdown.tools)}</span></div>
                                <div className="flex justify-between text-sm text-gray-500 pt-1">
                                    <span>(Monthly Total x Period)</span>
                                    <span>x {periodBreakdown.months.toFixed(2)} months</span>
                                </div>
                            </div>
                        </div>

                        {/* Variable Expenses Section */}
                        <div>
                            <h4 className="text-base font-semibold text-gray-200">Variable Expenses</h4>
                            <div className="pl-4 mt-2 space-y-1 border-l-2 border-gray-700">
                                <div className="flex justify-between text-base"><span className="text-gray-400">Ad Spend</span><span className="font-medium text-gray-200">{formatCurrency(periodBreakdown.adSpend)}</span></div>
                                <div className="flex justify-between text-base"><span className="text-gray-400">Other Variable</span><span className="font-medium text-gray-200">{formatCurrency(periodBreakdown.variable)}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-4 mb-2"></div>
                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total Period Spend</span>
                        <span className="text-white">{formatCurrency(periodBreakdown.total)}</span>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Projected Annual Spend</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-base"><span className="text-gray-400">Salaries</span><span className="font-medium text-gray-200">{formatCurrency(annualBreakdown.salaries)}</span></div>
                        <div className="flex justify-between text-base"><span className="text-gray-400">Tools</span><span className="font-medium text-gray-200">{formatCurrency(annualBreakdown.tools)}</span></div>
                        <div className="flex justify-between text-base"><span className="text-gray-400">Ad Spend</span><span className="font-medium text-gray-200">{formatCurrency(annualBreakdown.adSpend)}</span></div>
                        <div className="flex justify-between text-base"><span className="text-gray-400">Variable Expenses</span><span className="font-medium text-gray-200">{formatCurrency(annualBreakdown.variable)}</span></div>
                        <div className="border-t border-gray-700 my-2"></div>
                        <div className="flex justify-between text-lg font-bold"><span className="text-white">Total Annual</span><span className="text-white">{formatCurrency(annualBreakdown.total)}</span></div>
                    </div>
                </div>
            </div>

            {/* Salaries Section */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white">Salaries</h2>
                <p className="text-gray-400 mt-1 mb-6">Recurring monthly personnel costs.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="py-3 pr-4 text-left text-sm font-medium text-gray-400 uppercase">Expense Name</th>
                                <th className="py-3 px-4 text-right text-sm font-medium text-gray-400 uppercase">Monthly Amount</th>
                                <th className="py-3 pl-4 w-24 text-right text-sm font-medium text-gray-400 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaries.map(exp => {
                                const isEditing = editingExpense?.type === 'salary' && editingExpense.expense.id === exp.id;
                                return isEditing ? (
                                    <tr key={exp.id} className="bg-gray-700/50">
                                        <td className="py-2 pr-4"><input type="text" name="name" value={editingExpense.expense.name} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" /></td>
                                        <td className="py-2 px-4"><input type="number" name="monthlyAmount" value={editingExpense.expense.monthlyAmount} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1 text-right" /></td>
                                        <td className="py-2 pl-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button type="button" title="Save" onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5" /></button>
                                                <button type="button" title="Cancel" onClick={handleCancelEdit} className="text-gray-500 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                <tr key={exp.id} className="border-b border-gray-800">
                                    <td className="py-3 pr-4 text-base text-gray-200">{exp.name}</td>
                                    <td className="py-3 px-4 text-right text-base text-gray-300">{formatCurrency(exp.monthlyAmount)}</td>
                                    <td className="py-3 pl-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button type="button" title="Edit" onClick={() => handleEditClick('salary', exp)} className="text-gray-500 hover:text-yellow-400"><EditIcon className="w-5 h-5" /></button>
                                            <button type="button" title="Delete" onClick={() => handleDeleteSalary(exp.id)} className="text-gray-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-600 font-bold">
                                <td className="py-3 pr-4 text-base text-white">Total Monthly</td>
                                <td className="py-3 px-4 text-right text-base text-white">{formatCurrency(totalSalaries)}</td>
                                <td className="py-3 pl-4"></td>
                            </tr>
                            <tr className="bg-black/30">
                                <td className="p-3">
                                    <input type="text" placeholder="e.g., Marketing Salaries" value={newSalary.name} onChange={e => setNewSalary({...newSalary, name: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3">
                                    <input type="number" placeholder="5000" value={newSalary.monthlyAmount} onChange={e => setNewSalary({...newSalary, monthlyAmount: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3 text-right">
                                    <button type="button" onClick={handleAddSalary} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md">Add</button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            {/* Tools & Subscriptions Section */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white">Tools &amp; Subscriptions</h2>
                <p className="text-gray-400 mt-1 mb-6">Recurring monthly costs for marketing software and tools.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="py-3 pr-4 text-left text-sm font-medium text-gray-400 uppercase">Tool Name</th>
                                <th className="py-3 px-4 text-right text-sm font-medium text-gray-400 uppercase">Monthly Amount</th>
                                <th className="py-3 pl-4 w-24 text-right text-sm font-medium text-gray-400 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tools.map(exp => {
                                const isEditing = editingExpense?.type === 'tool' && editingExpense.expense.id === exp.id;
                                return isEditing ? (
                                    <tr key={exp.id} className="bg-gray-700/50">
                                        <td className="py-2 pr-4"><input type="text" name="name" value={editingExpense.expense.name} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" /></td>
                                        <td className="py-2 px-4"><input type="number" name="monthlyAmount" value={editingExpense.expense.monthlyAmount} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1 text-right" /></td>
                                        <td className="py-2 pl-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button type="button" title="Save" onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5" /></button>
                                                <button type="button" title="Cancel" onClick={handleCancelEdit} className="text-gray-500 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                <tr key={exp.id} className="border-b border-gray-800">
                                    <td className="py-3 pr-4 text-base text-gray-200">{exp.name}</td>
                                    <td className="py-3 px-4 text-right text-base text-gray-300">{formatCurrency(exp.monthlyAmount)}</td>
                                    <td className="py-3 pl-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button type="button" title="Edit" onClick={() => handleEditClick('tool', exp)} className="text-gray-500 hover:text-yellow-400"><EditIcon className="w-5 h-5" /></button>
                                            <button type="button" title="Delete" onClick={() => handleDeleteTool(exp.id)} className="text-gray-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-600 font-bold">
                                <td className="py-3 pr-4 text-base text-white">Total Monthly</td>
                                <td className="py-3 px-4 text-right text-base text-white">{formatCurrency(totalTools)}</td>
                                <td className="py-3 pl-4"></td>
                            </tr>
                            <tr className="bg-black/30">
                                <td className="p-3">
                                    <input type="text" placeholder="e.g., HubSpot Subscription" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3">
                                    <input type="number" placeholder="800" value={newTool.monthlyAmount} onChange={e => setNewTool({...newTool, monthlyAmount: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3 text-right">
                                    <button type="button" onClick={handleAddTool} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md">Add</button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Variable Expenses Section */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white">Variable Expenses</h2>
                <p className="text-gray-400 mt-1 mb-6">One-time or fluctuating costs like advertising, events, or marketing materials.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="py-3 pr-4 text-left text-sm font-medium text-gray-400 uppercase">Expense Name</th>
                                <th className="py-3 px-4 text-right text-sm font-medium text-gray-400 uppercase">Amount</th>
                                <th className="py-3 px-4 text-right text-sm font-medium text-gray-400 uppercase">Date</th>
                                <th className="py-3 pl-4 w-24 text-right text-sm font-medium text-gray-400 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-800 bg-black/20">
                                <td className="py-3 pr-4 text-base text-gray-400 italic">Total Ad Spend (from Campaigns for Selected Period)</td>
                                <td className="py-3 px-4 text-right text-base text-gray-400 italic">{formatCurrency(periodBreakdown.adSpend)}</td>
                                <td className="py-3 px-4 text-right text-base text-gray-400 italic"></td>
                                <td className="py-3 pl-4"></td>
                            </tr>
                            {variable.map(exp => {
                                const isEditing = editingExpense?.type === 'variable' && editingExpense.expense.id === exp.id;
                                return isEditing ? (
                                    <tr key={exp.id} className="bg-gray-700/50">
                                        <td className="py-2 pr-4"><input type="text" name="name" value={editingExpense.expense.name} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" /></td>
                                        <td className="py-2 px-4"><input type="number" name="amount" value={editingExpense.expense.amount} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1 text-right" /></td>
                                        <td className="py-2 px-4"><input type="date" name="date" value={(editingExpense.expense as VariableExpense).date} onChange={handleUpdateChange} className="w-full bg-gray-800 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" /></td>
                                        <td className="py-2 pl-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button type="button" title="Save" onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5" /></button>
                                                <button type="button" title="Cancel" onClick={handleCancelEdit} className="text-gray-500 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                <tr key={exp.id} className="border-b border-gray-800">
                                    <td className="py-3 pr-4 text-base text-gray-200">{exp.name}</td>
                                    <td className="py-3 px-4 text-right text-base text-gray-300">{formatCurrency(exp.amount)}</td>
                                    <td className="py-3 px-4 text-right text-base text-gray-300">{exp.date}</td>
                                    <td className="py-3 pl-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button type="button" title="Edit" onClick={() => handleEditClick('variable', exp)} className="text-gray-500 hover:text-yellow-400"><EditIcon className="w-5 h-5" /></button>
                                            <button type="button" title="Delete" onClick={() => handleDeleteVariableExpense(exp.id)} className="text-gray-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-600 font-bold">
                                <td className="py-3 pr-4 text-base text-white">Total</td>
                                <td className="py-3 px-4 text-right text-base text-white">{formatCurrency(totalVariable)}</td>
                                <td className="py-3 px-4"></td>
                                <td className="py-3 pl-4"></td>
                            </tr>
                            <tr className="bg-black/30">
                                <td className="p-3">
                                    <input type="text" placeholder="e.g., Q3 Webinar" value={newVariable.name} onChange={e => setNewVariable({...newVariable, name: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3">
                                    <input type="number" placeholder="1500" value={newVariable.amount} onChange={e => setNewVariable({...newVariable, amount: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3">
                                     <input type="date" value={newVariable.date} onChange={e => setNewVariable({...newVariable, date: e.target.value})} className="w-full bg-gray-700 border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#d356f8] text-base px-2 py-1" />
                                </td>
                                <td className="p-3 text-right">
                                    <button type="button" onClick={handleAddVariableExpense} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md">Add</button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GoalsExpenses;
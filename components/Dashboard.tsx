import React, { useState } from 'react';
import DocumentAnalysis from './DocumentAnalysis';
import LegalQA from './LegalQA';
import { DocumentIcon, ChatIcon, LogoutIcon } from './icons';

interface DashboardProps {
    onLogout: () => void;
}

type ActiveTab = 'analysis' | 'qa';

const Dashboard = ({ onLogout }: DashboardProps) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');

    const TabButton = ({ tabName, label, icon }: { tabName: ActiveTab; label: string; icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center justify-center w-full md:w-auto px-4 py-3 font-semibold text-sm md:text-base rounded-t-lg transition-colors duration-200 focus:outline-none ${
                activeTab === tabName
                    ? 'bg-white dark:bg-slate-800 text-brand-secondary border-b-2 border-brand-secondary'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-brand-dark text-brand-dark dark:text-gray-200 font-sans">
            <header className="bg-white dark:bg-slate-900 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div 
                        className="text-2xl font-bold text-brand-primary dark:text-white cursor-pointer"
                        onClick={() => setActiveTab('analysis')}
                    >
                        Lexi<span className="text-brand-secondary">Gem</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setActiveTab('analysis')}
                            className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-secondary dark:hover:text-brand-secondary transition-colors"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                            <LogoutIcon className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <TabButton 
                            tabName="analysis" 
                            label="Legal Analysis" 
                            icon={<DocumentIcon className="w-5 h-5" />}
                        />
                        <TabButton 
                            tabName="qa" 
                            label="Legal Q&A"
                            icon={<ChatIcon className="w-5 h-5" />}
                        />
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-b-lg shadow-lg">
                        {activeTab === 'analysis' ? <DocumentAnalysis /> : <LegalQA />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
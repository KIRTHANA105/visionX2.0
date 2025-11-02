import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Disclaimer from './Disclaimer';
import { ShieldCheckIcon, ExclamationCircleIcon, LightbulbIcon, BalanceScaleIcon, UploadIcon } from './icons';

const AnalysisSection = ({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
        <h3 className="flex items-center text-lg font-semibold text-brand-dark dark:text-white mb-3">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-brand-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <p className="ml-2 text-gray-700 dark:text-gray-300 text-sm">{item}</p>
                </li>
            ))}
        </ul>
    </div>
);


const DocumentAnalysis = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError("Please upload a document to analyze.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeDocument(selectedFile);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <label htmlFor="document-upload" className="block text-lg font-medium text-brand-dark dark:text-gray-200 mb-2">
                    Upload your legal document
                </label>
                <div 
                    className="flex justify-center items-center w-full px-6 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:border-brand-secondary dark:hover:border-brand-secondary transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold text-brand-secondary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOCX, PNG, or JPG</p>
                         {selectedFile && <p className="mt-4 text-sm font-medium text-brand-dark dark:text-gray-300">Selected: {selectedFile.name}</p>}
                    </div>
                </div>
                <input
                    type="file"
                    id="document-upload"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp"
                    disabled={isLoading}
                />
            </div>

            <div className="text-center">
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !selectedFile}
                    className="px-8 py-3 bg-brand-secondary text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Document'}
                </button>
            </div>

            {isLoading && <LoadingSpinner />}
            
            {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">{error}</div>}

            {analysisResult && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-3">Analysis Summary</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysisResult.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnalysisSection title="Pros" items={analysisResult.pros} icon={<ShieldCheckIcon className="w-6 h-6 text-green-500" />} />
                        <AnalysisSection title="Cons" items={analysisResult.cons} icon={<ExclamationCircleIcon className="w-6 h-6 text-red-500" />} />
                        <AnalysisSection title="Potential Loopholes" items={analysisResult.potentialLoopholes} icon={<LightbulbIcon className="w-6 h-6 text-yellow-500" />} />
                        <AnalysisSection title="Potential Challenges" items={analysisResult.potentialChallenges} icon={<BalanceScaleIcon className="w-6 h-6 text-blue-500" />} />
                    </div>
                    
                    <Disclaimer />
                </div>
            )}
        </div>
    );
};

export default DocumentAnalysis;
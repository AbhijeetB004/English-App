import React from 'react';
import { Mic, Languages, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Languages className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SpeakFluent</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Settings className="h-4 w-4 mr-1" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SecureScanner</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Advanced File Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/1enMap/SecureScanner" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm hidden sm:block">Documentation</a>
              <a href="https://github.com/1enMap/SecureScanner/issues" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm">Support</a>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="text-blue-600 bg-blue-50 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Real-time Scanning</h2>
            <p className="text-sm text-gray-600">
              Advanced file analysis with instant threat detection and reporting.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="text-emerald-600 bg-emerald-50 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Threat Detection</h2>
            <p className="text-sm text-gray-600">
              Multiple detection engines to identify potential security risks.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="text-purple-600 bg-purple-50 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Detailed Reports</h2>
            <p className="text-sm text-gray-600">
              Comprehensive analysis reports with actionable insights.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-4 sm:px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">File Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload files for instant security analysis and threat detection
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <FileUpload />
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              © 2024 SecureScanner. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="#terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { 
  FaDownload, 
  FaFileAlt, 
  FaFileCsv,
  FaFileExcel,
  FaCalendarAlt,
  FaFilter,
  FaSync,
  FaTimesCircle
} from 'react-icons/fa';

interface SecurityExportProps {
  // No props needed
}

export const SecurityExport: React.FC<SecurityExportProps> = () => {
  const [exportConfig, setExportConfig] = useState({
    format: 'json',
    dateRange: '30d',
    includePersonalData: false,
    dataTypes: {
      users: true,
      activities: true,
      alerts: true,
      metrics: false
    }
  });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const params = new URLSearchParams({
        format: exportConfig.format,
        dateRange: exportConfig.dateRange,
        includePersonalData: exportConfig.includePersonalData.toString(),
        dataTypes: Object.entries(exportConfig.dataTypes)
          .filter(([_, enabled]) => enabled)
          .map(([type]) => type)
          .join(',')
      });

      const response = await fetch(`/api/security-dashboard/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `security-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const updateDataType = (type: string, enabled: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      dataTypes: {
        ...prev.dataTypes,
        [type]: enabled
      }
    }));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <FaFileAlt className="h-5 w-5 text-blue-500" />;
      case 'csv': return <FaFileCsv className="h-5 w-5 text-green-500" />;
      case 'excel': return <FaFileExcel className="h-5 w-5 text-green-600" />;
      default: return <FaFileAlt className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Export & Reports</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Configuration */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Configuration</h3>
            
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'json', label: 'JSON', description: 'Structured data format' },
                  { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
                  { value: 'excel', label: 'Excel', description: 'Excel workbook' }
                ].map((format) => (
                  <div
                    key={format.value}
                    className={`relative rounded-lg border p-4 cursor-pointer ${
                      exportConfig.format === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportConfig(prev => ({ ...prev, format: format.value }))}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getFormatIcon(format.value)}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 text-center">{format.label}</h4>
                    <p className="text-xs text-gray-500 text-center mt-1">{format.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={exportConfig.dateRange}
                onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Data Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Data to Include</label>
              <div className="space-y-3">
                {[
                  { key: 'users', label: 'User Security Data', description: 'User profiles, security status, risk levels' },
                  { key: 'activities', label: 'Activity Logs', description: 'Security events, login attempts, actions' },
                  { key: 'alerts', label: 'Security Alerts', description: 'Alerts, notifications, incidents' },
                  { key: 'metrics', label: 'System Metrics', description: 'Performance data, health scores' }
                ].map((dataType) => (
                  <label key={dataType.key} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={exportConfig.dataTypes[dataType.key as keyof typeof exportConfig.dataTypes]}
                      onChange={(e) => updateDataType(dataType.key, e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dataType.label}</div>
                      <div className="text-xs text-gray-500">{dataType.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Privacy & Compliance</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportConfig.includePersonalData}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includePersonalData: e.target.checked }))}
                  className="mr-3"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Include Personal Data</div>
                  <div className="text-xs text-gray-500">Include email addresses, names, and other PII</div>
                </div>
              </label>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || Object.values(exportConfig.dataTypes).every(v => !v)}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <FaSync className="animate-spin h-4 w-4 mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <FaDownload className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <FaTimesCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Export Error</h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports & Templates */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reports</h3>
            
            <div className="space-y-4">
              {[
                {
                  title: 'Security Summary Report',
                  description: 'Overview of security metrics and health status',
                  format: 'PDF',
                  icon: <FaFileAlt className="h-5 w-5 text-red-500" />
                },
                {
                  title: 'User Risk Assessment',
                  description: 'Detailed analysis of user security risks',
                  format: 'Excel',
                  icon: <FaFileExcel className="h-5 w-5 text-green-600" />
                },
                {
                  title: 'Incident Log Export',
                  description: 'Complete log of security incidents and responses',
                  format: 'CSV',
                  icon: <FaFileCsv className="h-5 w-5 text-green-500" />
                },
                {
                  title: 'Compliance Report',
                  description: 'Security compliance status and audit trail',
                  format: 'PDF',
                  icon: <FaFileAlt className="h-5 w-5 text-red-500" />
                }
              ].map((report, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {report.icon}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                        <p className="text-xs text-gray-500">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{report.format}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        <FaDownload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Exports */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Exports</h3>
            
            <div className="text-center py-8">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Scheduled Exports</h3>
              <p className="mt-1 text-sm text-gray-500">Set up automated security report generation.</p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                Schedule Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
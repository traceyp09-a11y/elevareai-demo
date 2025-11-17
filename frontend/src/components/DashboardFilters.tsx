import { useState } from 'react';

interface FilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onDepartmentChange: (department: string) => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  onExportPDF: () => void;
}

export default function DashboardFilters({
  onDateRangeChange,
  onDepartmentChange,
  onSearch,
  onRefresh,
  onExportPDF
}: FilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'hr', label: '👥 HR Analytics' },
    { value: 'hse', label: '🦺 HSE Analytics' },
    { value: 'operations', label: '⚙️ Operations' },
    { value: 'qc', label: '✓ Quality Control' },
    { value: 'supplychain', label: '🚚 Supply Chain' },
    { value: 'finance', label: '💰 Finance' },
    { value: 'administration', label: '💻 IT & Administration' },
    { value: 'sales', label: '💵 Sales & Revenue' },
    { value: 'customer-success', label: '❤️ Customer Success' },
    { value: 'marketing', label: '📢 Marketing' }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    onDepartmentChange(e.target.value);
  };

  const handleDateChange = () => {
    onDateRangeChange(startDate, endDate);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Search KPIs
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search metrics..."
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2.5 text-gray-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleDateChange();
              }}
              className="w-1/2 bg-gray-900/50 border border-gray-600 rounded-lg px-2 py-2.5 text-gray-100 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleDateChange();
              }}
              className="w-1/2 bg-gray-900/50 border border-gray-600 rounded-lg px-2 py-2.5 text-gray-100 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Actions
          </label>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 group"
              title="Refresh Data"
            >
              <svg
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={onExportPDF}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2"
              title="Export to PDF"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

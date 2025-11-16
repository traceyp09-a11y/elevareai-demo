import { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, HelpCircle, DollarSign, Shield, FileText, Database, Folder, Users, Clock, Cpu, AlertTriangle } from 'lucide-react';
import CalculationDetails from '../components/CalculationDetails';

interface KPI {
  name: string;
  value: number | string;
  unit: string;
  benchmark: number | string;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  formula: string;
  dataPoints: any;
}

interface KPIResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  kpis: {
    systemUptime: KPI;
    helpdeskResponseTime: KPI;
    itCostPerEmployee: KPI;
    securityIncidentRate: KPI;
    licenseUtilization: KPI;
    backupSuccessRate: KPI;
    projectOnTimeDelivery: KPI;
    employeeSatisfaction: KPI;
    ticketResolutionTime: KPI;
    infrastructureUtilization: KPI;
  };
}

interface PainPoint {
  id: number;
  title: string;
  severity: string;
}

interface PainPointsResponse {
  success: boolean;
  pain_points: PainPoint[];
}

export default function DashboardAdministration() {
  const [kpiData, setKpiData] = useState<KPIResponse | null>(null);
  const [painPointsCount, setPainPointsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKPIs();
    fetchPainPointsCount();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get<KPIResponse>('http://localhost:3001/api/administration/kpis/current');
      setKpiData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchPainPointsCount = async () => {
    try {
      const response = await axios.get<PainPointsResponse>('http://localhost:3001/api/administration/pain-points');
      setPainPointsCount(response.data.pain_points.length);
    } catch (err) {
      console.error('Error fetching pain points count:', err);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Excellent': return 'border-blue-500 bg-blue-500/10';
      case 'Good': return 'border-purple-500 bg-purple-500/10';
      case 'Warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'Critical': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getIcon = (kpiName: string) => {
    const iconClass = "w-8 h-8 text-blue-400";
    switch (kpiName) {
      case 'systemUptime': return <Server className={iconClass} />;
      case 'helpdeskResponseTime': return <HelpCircle className={iconClass} />;
      case 'itCostPerEmployee': return <DollarSign className={iconClass} />;
      case 'securityIncidentRate': return <Shield className={iconClass} />;
      case 'licenseUtilization': return <FileText className={iconClass} />;
      case 'backupSuccessRate': return <Database className={iconClass} />;
      case 'projectOnTimeDelivery': return <Folder className={iconClass} />;
      case 'employeeSatisfaction': return <Users className={iconClass} />;
      case 'ticketResolutionTime': return <Clock className={iconClass} />;
      case 'infrastructureUtilization': return <Cpu className={iconClass} />;
      default: return <Server className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading Administration Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !kpiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const kpiArray = [
    { key: 'systemUptime', ...kpiData.kpis.systemUptime },
    { key: 'helpdeskResponseTime', ...kpiData.kpis.helpdeskResponseTime },
    { key: 'itCostPerEmployee', ...kpiData.kpis.itCostPerEmployee },
    { key: 'securityIncidentRate', ...kpiData.kpis.securityIncidentRate },
    { key: 'licenseUtilization', ...kpiData.kpis.licenseUtilization },
    { key: 'backupSuccessRate', ...kpiData.kpis.backupSuccessRate },
    { key: 'projectOnTimeDelivery', ...kpiData.kpis.projectOnTimeDelivery },
    { key: 'employeeSatisfaction', ...kpiData.kpis.employeeSatisfaction },
    { key: 'ticketResolutionTime', ...kpiData.kpis.ticketResolutionTime },
    { key: 'infrastructureUtilization', ...kpiData.kpis.infrastructureUtilization }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          IT & Administration Analytics Dashboard
        </h1>
        <p className="text-gray-400">
          Period: {kpiData.period.label} ({kpiData.period.startDate} to {kpiData.period.endDate})
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-500/10 border border-blue-500 p-4 rounded-lg">
          <div className="text-sm text-blue-300">Total KPIs</div>
          <div className="text-3xl font-bold text-blue-400">10</div>
        </div>
        <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg">
          <div className="text-sm text-green-300">Good/Excellent</div>
          <div className="text-3xl font-bold text-green-400">
            {kpiArray.filter(k => k.status === 'Good' || k.status === 'Excellent').length}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500 p-4 rounded-lg">
          <div className="text-sm text-yellow-300">Warnings</div>
          <div className="text-3xl font-bold text-yellow-400">
            {kpiArray.filter(k => k.status === 'Warning').length}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500 p-4 rounded-lg">
          <div className="text-sm text-red-300">Critical</div>
          <div className="text-3xl font-bold text-red-400">
            {kpiArray.filter(k => k.status === 'Critical').length}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpiArray.map((kpi) => {
          const calculation = {
            formula: kpi.formula,
            components: kpi.dataPoints,
            steps: [] as string[]
          };
          return (
            <div key={kpi.key} className="group">
              <CalculationDetails kpiName={kpi.name} calculation={calculation}>
                <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:scale-105 ${getStatusColor(kpi.status)}`}>
            {/* Icon and Name */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getIcon(kpi.key)}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300">{kpi.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    kpi.status === 'Excellent' ? 'bg-blue-500/20 text-blue-400' :
                    kpi.status === 'Good' ? 'bg-purple-500/20 text-purple-400' :
                    kpi.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {kpi.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="mb-2">
              <div className="text-3xl font-bold text-white">
                {kpi.value}{kpi.unit}
              </div>
              <div className="text-sm text-gray-400">
                Benchmark: {kpi.benchmark}{kpi.unit}
              </div>
            </div>
                </div>
              </CalculationDetails>
            </div>
          );
        })}
      </div>

      {/* Visual Separator */}
      <div className="my-8 border-t-2 border-blue-500/30"></div>

      {/* Pain Points Section */}
      <div className="bg-gray-800/50 border-2 border-blue-500 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Critical IT Pain Points</h2>
              <p className="text-gray-400">Top challenges requiring immediate attention</p>
            </div>
          </div>
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
            {painPointsCount} Issues Identified
          </div>
        </div>

        <div className="mt-4">
          <a
            href="/administration/pain-points"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            View Detailed Pain Points Analysis →
          </a>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        All calculations are transparent and auditable. Click any KPI card to see the formula and data points.
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Facility {
  id: number;
  name: string;
  type: string;
  city: string;
  state: string;
}

interface Report {
  id: string;
  date: string;
  type: string;
  severity: string;
  description: string;
  reportType: string;
  status?: string;
}

export default function MobileSafetyApp() {
  const [activeView, setActiveView] = useState<'home' | 'incident' | 'near-miss' | 'hazard' | 'reports'>('home');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Demo employee ID
  const defaultEmployeeId = '1';

  useEffect(() => {
    fetchFacilities();
    fetchReports(employeeId || defaultEmployeeId);
    getLocation();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/mobile/facilities');
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchReports = async (empId: string) => {
    try {
      const response = await fetch(`/api/mobile/reports/${empId}`);
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  const submitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      facilityId: parseInt(formData.get('facilityId') as string),
      department: formData.get('department') as string,
      employeeId: employeeId || defaultEmployeeId,
      description: formData.get('description') as string,
      incidentType: formData.get('incidentType') as string,
      severity: formData.get('severity') as string,
      location: formData.get('location') as string,
      latitude: location?.latitude,
      longitude: location?.longitude
    };

    try {
      const response = await fetch('/api/mobile/report/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          setSuccess(false);
          setActiveView('home');
          fetchReports(employeeId || defaultEmployeeId);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitNearMiss = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      facilityId: parseInt(formData.get('facilityId') as string),
      department: formData.get('department') as string,
      employeeId: employeeId || defaultEmployeeId,
      description: formData.get('description') as string,
      potentialSeverity: formData.get('potentialSeverity') as string,
      hazardType: formData.get('hazardType') as string,
      location: formData.get('location') as string,
      latitude: location?.latitude,
      longitude: location?.longitude
    };

    try {
      const response = await fetch('/api/mobile/report/near-miss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          setSuccess(false);
          setActiveView('home');
          fetchReports(employeeId || defaultEmployeeId);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting near miss:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      facilityId: parseInt(formData.get('facilityId') as string),
      department: formData.get('department') as string,
      employeeId: employeeId || defaultEmployeeId,
      hazardType: formData.get('hazardType') as string,
      hazardCategory: formData.get('hazardCategory') as string,
      locationDescription: formData.get('locationDescription') as string,
      severityLevel: formData.get('severityLevel') as string,
      probability: formData.get('probability') as string,
      description: formData.get('description') as string,
      latitude: location?.latitude,
      longitude: location?.longitude
    };

    try {
      const response = await fetch('/api/mobile/report/hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          setSuccess(false);
          setActiveView('home');
          fetchReports(employeeId || defaultEmployeeId);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting hazard:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeColor = (reportType: string) => {
    switch (reportType) {
      case 'incident': return 'from-red-500 to-red-600';
      case 'near-miss': return 'from-yellow-500 to-yellow-600';
      case 'hazard': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getReportTypeIcon = (reportType: string) => {
    switch (reportType) {
      case 'incident': return '🚨';
      case 'near-miss': return '⚠️';
      case 'hazard': return '⚡';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {activeView !== 'home' && (
              <button
                onClick={() => setActiveView('home')}
                className="text-cyan-400 hover:text-cyan-300"
              >
                ← Back
              </button>
            )}
            {activeView === 'home' && (
              <Link to="/hse" className="text-cyan-400 hover:text-cyan-300">
                ← Dashboard
              </Link>
            )}
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            📱 Safety Reporter
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Home View */}
      {activeView === 'home' && (
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Welcome, Safety Reporter! 👷</h2>
            <p className="text-gray-400 mb-4">
              Report safety incidents, near misses, and hazards directly from your mobile device.
              Your reports help keep everyone safe.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-red-400">{reports.filter(r => r.reportType === 'incident').length}</div>
                <div className="text-xs text-gray-400">Incidents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{reports.filter(r => r.reportType === 'near-miss').length}</div>
                <div className="text-xs text-gray-400">Near Misses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{reports.filter(r => r.reportType === 'hazard').length}</div>
                <div className="text-xs text-gray-400">Hazards</div>
              </div>
            </div>
          </div>

          {/* Report Type Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Create New Report</h3>

            <button
              onClick={() => setActiveView('incident')}
              className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/50 rounded-xl p-6 text-left hover:border-red-400/70 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🚨</div>
                <div>
                  <h4 className="text-lg font-bold">Report Incident</h4>
                  <p className="text-sm text-gray-400">An injury or incident has occurred</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView('near-miss')}
              className="w-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50 rounded-xl p-6 text-left hover:border-yellow-400/70 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <h4 className="text-lg font-bold">Report Near Miss</h4>
                  <p className="text-sm text-gray-400">Something almost happened</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveView('hazard')}
              className="w-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-2 border-orange-500/50 rounded-xl p-6 text-left hover:border-orange-400/70 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⚡</div>
                <div>
                  <h4 className="text-lg font-bold">Report Hazard</h4>
                  <p className="text-sm text-gray-400">Identify a potential danger</p>
                </div>
              </div>
            </button>
          </div>

          {/* View Reports Button */}
          <button
            onClick={() => setActiveView('reports')}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-4 hover:border-purple-400/70 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">View My Reports</span>
              <span className="text-purple-400">→</span>
            </div>
          </button>

          {/* Location Status */}
          {location && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">📍</span>
                <span className="text-gray-400">Location enabled for accurate reporting</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incident Form */}
      {activeView === 'incident' && (
        <div className="p-4">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🚨</div>
              <div>
                <h2 className="text-2xl font-bold">Report Incident</h2>
                <p className="text-sm text-gray-400">Provide details about the incident</p>
              </div>
            </div>

            {success && (
              <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold">Report submitted successfully!</span>
                </div>
              </div>
            )}

            <form onSubmit={submitIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Facility *</label>
                <select
                  name="facilityId"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select facility...</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - {f.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Department *</label>
                <select
                  name="department"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select department...</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Construction">Construction</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Incident Type *</label>
                <select
                  name="incidentType"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Medical Treatment">Medical Treatment</option>
                  <option value="Lost Time">Lost Time</option>
                  <option value="Restricted Work">Restricted Work</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Severity *</label>
                <select
                  name="severity"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select severity...</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g., Production Floor Area A"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe what happened..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-bold text-lg hover:from-red-400 hover:to-red-500 transition-all disabled:opacity-50 active:scale-95"
              >
                {submitting ? 'Submitting...' : 'Submit Incident Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Near Miss Form */}
      {activeView === 'near-miss' && (
        <div className="p-4">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">⚠️</div>
              <div>
                <h2 className="text-2xl font-bold">Report Near Miss</h2>
                <p className="text-sm text-gray-400">Help prevent future incidents</p>
              </div>
            </div>

            {success && (
              <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold">Report submitted successfully!</span>
                </div>
              </div>
            )}

            <form onSubmit={submitNearMiss} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Facility *</label>
                <select
                  name="facilityId"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Select facility...</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - {f.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Department *</label>
                <select
                  name="department"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Select department...</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Construction">Construction</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Hazard Type *</label>
                <select
                  name="hazardType"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="Slip/Trip">Slip/Trip</option>
                  <option value="Fall from Height">Fall from Height</option>
                  <option value="Struck By">Struck By</option>
                  <option value="Chemical Exposure">Chemical Exposure</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Caught In/Between">Caught In/Between</option>
                  <option value="Vehicle/Equipment">Vehicle/Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Potential Severity *</label>
                <select
                  name="potentialSeverity"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Select potential severity...</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g., Warehouse Bay 3"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">What Almost Happened? *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe the near miss event..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 text-black active:scale-95"
              >
                {submitting ? 'Submitting...' : 'Submit Near Miss Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hazard Form */}
      {activeView === 'hazard' && (
        <div className="p-4">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">⚡</div>
              <div>
                <h2 className="text-2xl font-bold">Report Hazard</h2>
                <p className="text-sm text-gray-400">Identify potential dangers</p>
              </div>
            </div>

            {success && (
              <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-semibold">Report submitted successfully!</span>
                </div>
              </div>
            )}

            <form onSubmit={submitHazard} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Facility *</label>
                <select
                  name="facilityId"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select facility...</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - {f.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Department *</label>
                <select
                  name="department"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select department...</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Construction">Construction</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Hazard Category *</label>
                <select
                  name="hazardCategory"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select category...</option>
                  <option value="Physical">Physical</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Biological">Biological</option>
                  <option value="Ergonomic">Ergonomic</option>
                  <option value="Psychosocial">Psychosocial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Hazard Type *</label>
                <select
                  name="hazardType"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="Slip/Trip">Slip/Trip</option>
                  <option value="Fall from Height">Fall from Height</option>
                  <option value="Struck By">Struck By</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Caught In/Between">Caught In/Between</option>
                  <option value="Ergonomic">Ergonomic</option>
                  <option value="Material Handling">Material Handling</option>
                  <option value="Vehicle/Equipment">Vehicle/Equipment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Severity *</label>
                  <select
                    name="severityLevel"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Probability *</label>
                  <select
                    name="probability"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Rare">Rare</option>
                    <option value="Unlikely">Unlikely</option>
                    <option value="Possible">Possible</option>
                    <option value="Likely">Likely</option>
                    <option value="Almost Certain">Almost Certain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location Description *</label>
                <input
                  type="text"
                  name="locationDescription"
                  required
                  placeholder="e.g., Loading Dock 2, near forklift charging station"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Hazard Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe the hazard and potential risk..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-bold text-lg hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50 active:scale-95"
              >
                {submitting ? 'Submitting...' : 'Submit Hazard Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reports View */}
      {activeView === 'reports' && (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">My Reports</h2>
          {reports.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-400">No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${getReportTypeColor(report.reportType)}/10 border border-gray-700 rounded-xl p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getReportTypeIcon(report.reportType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold capitalize">{report.reportType.replace('-', ' ')}</span>
                        <span className="text-xs text-gray-400">{report.date}</span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        <span className="font-semibold">{report.type}</span> • {report.severity}
                      </div>
                      <p className="text-sm text-gray-300">{report.description}</p>
                      {report.status && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            report.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' :
                            report.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

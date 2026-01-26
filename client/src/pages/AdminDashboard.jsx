import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports');
      setReports(data);
      calculateStats(data);
    } catch (err) {
      console.error("Failed to fetch reports");
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'PENDING').length;
    const resolved = data.filter(r => r.status === 'RESOLVED').length;
    setStats({ total, pending, resolved });
  };

  const handleStatusChange = async (id, newStatus) => {
    if(!window.confirm(`Mark this report as ${newStatus}?`)) return;
    
    try {
      await api.patch(`/reports/${id}/status`, { status: newStatus });
      fetchReports(); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏛️ Municipal Admin Dashboard</h1>
      
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 uppercase text-xs font-bold">Total Reports</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 uppercase text-xs font-bold">Pending Issues</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 uppercase text-xs font-bold">Resolved Cases</h3>
          <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      {/* 2. 📍 Map Section (UPDATED) */}
      <div className="mb-8 w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">📍 Issue Locations</h2>
          <div className="flex space-x-4 text-xs font-bold">
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span> Pending/In Progress</span>
              <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span> Resolved</span>
          </div>
        </div>
        
        <div className="h-[500px] w-full relative z-0">
          <MapContainer 
            center={[28.6139, 77.2090]} // Default Center (New Delhi - Change as needed)
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            
            {/* RENDER COLORED MARKERS */}
            {reports.map((report) => (
              report.latitude && report.longitude && (
                <CircleMarker 
                  key={report.id}
                  center={[report.latitude, report.longitude]}
                  radius={8}
                  pathOptions={{ 
                      color: report.status === 'RESOLVED' ? '#22c55e' : '#ef4444',
                      fillColor: report.status === 'RESOLVED' ? '#22c55e' : '#ef4444',
                      fillOpacity: 0.7,
                      weight: 1
                  }}
                >
                  <Popup>
                      <div className="text-center">
                          <img src={report.image_url} alt="Proof" className="w-24 h-24 object-cover rounded mx-auto mb-2"/>
                          <p className="font-bold text-sm">{report.category}</p>
                          <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                          <span className={`text-xs px-2 py-1 rounded font-bold text-white ${
                              report.status === 'RESOLVED' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                              {report.status}
                          </span>
                      </div>
                  </Popup>
                </CircleMarker>
              )
            ))}
          </MapContainer>
        </div>
      </div>

      {/* 3. Management Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">📋 Report Management</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800 text-white">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <a href={report.image_url} target="_blank" rel="noreferrer">
                        <img src={report.image_url} alt="Report" className="h-12 w-12 rounded object-cover border hover:scale-150 transition-transform duration-200 cursor-zoom-in shadow-sm" />
                    </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={report.description}>
                        {report.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 
                        report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {report.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {report.status !== 'IN_PROGRESS' && (
                        <button 
                        onClick={() => handleStatusChange(report.id, 'IN_PROGRESS')}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100 transition"
                        >
                        Process
                        </button>
                    )}
                    {report.status !== 'RESOLVED' && (
                        <button 
                        onClick={() => handleStatusChange(report.id, 'RESOLVED')}
                        className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded border border-green-200 hover:bg-green-100 transition"
                        >
                        Resolve
                        </button>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
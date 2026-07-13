import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import HeatmapLayer from '../components/HeatmapLayer';
import 'leaflet/dist/leaflet.css';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0 });
  
  // Pagination Tracking Hooks
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // AI Assistant State Hooks
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [summarizedIds, setSummarizedIds] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, [page]); 

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data using backend cursor segmentation route queries
      const { data } = await api.get(`/reports?page=${page}&limit=5`);
      
      const fetchedReports = data.data || []; 
      setReports(fetchedReports);
      setTotalPages(data.meta?.totalPages || 1);

      // Map metrics counting structures securely
      setStats({
        total: data.meta?.totalReports || fetchedReports.length,
        pending: fetchedReports.filter(r => r.status === 'PENDING').length,
        progress: fetchedReports.filter(r => r.status === 'IN_PROGRESS').length,
        resolved: fetchedReports.filter(r => r.status === 'RESOLVED').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data contextual summaries.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/reports/${id}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update report status workflow');
    }
  };

  const handleAiQuery = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    try {
      setAiLoading(true);
      setAiResponse('Analyzing data schemas and querying database strings...');
      const { data } = await api.post('/ai/chat', { query: aiQuery });
      setAiResponse(data.answer);
    } catch (err) {
      setAiResponse('Failed to fetch AI insights. Check database logs.');
    } finally {
      setAiLoading(false);
    }
  };

  const summarizeRowDescription = async (id, text) => {
    try {
      setSummarizedIds(prev => ({ ...prev, [id]: 'Summarizing...' }));
      const { data } = await api.post('/ai/chat', { textToSummarize: text });
      setSummarizedIds(prev => ({ ...prev, [id]: data.answer }));
    } catch (err) {
      setSummarizedIds(prev => ({ ...prev, [id]: 'Failed to summarize.' }));
    }
  };

  const exportToExcel = async () => {
    if (!reports || reports.length === 0) return alert("No reports available to export");
    alert("Resolving city data locations and compiling spreadsheet metrics...");

    const csvRows = [["ID", "Category", "Description", "Status", "Latitude", "Longitude", "Resolved City Location"]];
    for (const r of reports) {
      let city = "Unknown";
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${r.latitude}&lon=${r.longitude}`);
        const data = await res.json();
        city = data.address.city || data.address.town || data.address.village || "Unknown";
      } catch (e) { city = "Fetch Failed"; }

      csvRows.push([r.id, r.category, `"${r.description.replace(/"/g, '""')}"`, r.status, r.latitude, r.longitude, `"${city}"`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Municipal_Report_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && (!reports || reports.length === 0)) {
    return <div className="p-6 text-center font-semibold text-gray-600">Loading Admin Panel Context...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">🏛️ Municipal Admin Dashboard</h1>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm shadow transition duration-200">
          📥 Export Data to Excel (CSV)
        </button>
      </div>

      {/* DYNAMIC GEMINI AI SUMMARIZER PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h3 className="font-bold text-lg">CivicConnect AI Analytics Copilot</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Ask natural language database questions about complaint densities, hotzones, or localized performance metrics.
        </p>
        
        <form onSubmit={handleAiQuery} className="flex gap-2">
          <input 
            type="text" 
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g., Which city has the highest number of complaints? How many pending issues in Dehradun?"
            className="flex-grow p-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button 
            type="submit" 
            disabled={aiLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg disabled:opacity-50 transition"
          >
            {aiLoading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {aiResponse && (
          <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 whitespace-pre-line">
            <strong className="text-green-400 block mb-1">Response:</strong>
            {aiResponse}
          </div>
        )}
      </div>

      {/* COUNTER CARDS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100"><p className="text-sm text-gray-500 font-semibold uppercase">Total Filed</p><h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3></div>
        <div className="bg-amber-50 p-4 rounded-xl shadow border border-amber-100"><p className="text-sm text-amber-600 font-semibold uppercase">Pending</p><h3 className="text-2xl font-bold text-amber-700">{stats.pending}</h3></div>
        <div className="bg-blue-50 p-4 rounded-xl shadow border border-blue-100"><p className="text-sm text-blue-600 font-semibold uppercase">In Progress</p><h3 className="text-2xl font-bold text-blue-700">{stats.progress}</h3></div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow border border-emerald-100"><p className="text-sm text-emerald-600 font-semibold uppercase">Resolved Tasks</p><h3 className="text-2xl font-bold text-emerald-700">{stats.resolved}</h3></div>
      </div>

      {/* HEATMAP ANALYTICS */}
      <div className="bg-white p-4 rounded-xl shadow border mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-3">📍 High Density Waste Incidents Heatmap</h3>
        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <MapContainer center={[30.3165, 78.0322]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <HeatmapLayer 
              points={
                Array.isArray(reports) 
                  ? reports
                      .filter(r => r && r.latitude && r.longitude) // Only pass items that have valid coordinates
                      .map(r => [parseFloat(r.latitude), parseFloat(r.longitude), 50]) 
                  : []
              } 
            />
            {Array.isArray(reports) && reports
              .filter(r => r && r.latitude && r.longitude) // Strict coordinate validation drop check
              .map(r => (
                <Marker key={r.id} position={[parseFloat(r.latitude), parseFloat(r.longitude)]}>
                  <Popup><span className="font-bold">{r.category}</span><br />{r.description}</Popup>
                </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* DATA MANAGEMENT TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-sm uppercase">
              <th className="p-4">Image</th>
              <th className="p-4">Category</th>
              <th className="p-4">Description</th>
              <th className="p-4">Coordinates</th>
              <th className="p-4">Action Workflow Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-gray-700">
            {Array.isArray(reports) && reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="p-4"><img src={report.image_url} alt="Evidence" className="w-12 h-12 object-cover rounded border" /></td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">{report.category}</span></td>
                  <td className="p-4 text-sm max-w-xs">
                    <div className="text-gray-800">
                      {summarizedIds[report.id] ? summarizedIds[report.id] : report.description}
                    </div>
                    {!summarizedIds[report.id] && (
                      <button 
                        onClick={() => summarizeRowDescription(report.id, report.description)}
                        className="text-[10px] mt-1 bg-slate-100 hover:bg-slate-200 border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded font-bold transition block"
                      >
                        🪄 Summarize Text
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-xs font-mono text-gray-500">
                    {parseFloat(report.latitude || 0).toFixed(4)}, {parseFloat(report.longitude || 0).toFixed(4)}
                  </td>
                  <td className="p-4">
                    <select 
                      value={report.status} 
                      onChange={(e) => handleStatusChange(report.id, e.target.value)} 
                      className={`p-1.5 text-xs rounded font-bold border text-white focus:outline-none ${report.status === 'RESOLVED' ? 'bg-emerald-600 border-emerald-700' : report.status === 'IN_PROGRESS' ? 'bg-blue-600 border-blue-700' : 'bg-amber-600 border-amber-700'}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-4 text-center text-sm text-gray-500">No active complaints found for this page scope.</td></tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION PANEL TRAY */}
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(p - 1, 1))} 
            className="px-3 py-1.5 rounded border text-sm font-semibold bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition duration-150"
          >
            ◀ Previous Page
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
          </span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)} 
            className="px-3 py-1.5 rounded border text-sm font-semibold bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition duration-150"
          >
            Next Page ▶
          </button>
        </div>
      </div>
    </div>
  );
}
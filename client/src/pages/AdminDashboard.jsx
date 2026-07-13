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

  useEffect(() => {
    fetchDashboardData();
  }, [page]); // Re-runs data lookups every time the page counter changes!

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetching the split segmented page numbers
      const { data } = await api.get(`/reports?page=${page}&limit=5`);
      
      const fetchedReports = data.data; // Targets rows array safely
      setReports(fetchedReports);
      setTotalPages(data.meta.totalPages);

      // Generating metrics summaries
      setStats({
        total: data.meta.totalReports,
        pending: fetchedReports.filter(r => r.status === 'PENDING').length,
        progress: fetchedReports.filter(r => r.status === 'IN_PROGRESS').length,
        resolved: fetchedReports.filter(r => r.status === 'RESOLVED').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard statistics.');
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

  const exportToExcel = async () => {
    if (reports.length === 0) return alert("No reports available to export");
    alert("Resolving city location markers and compiling dataset...");

    const csvRows = [["ID", "Category", "Description", "Status", "Latitude", "Longitude", "City Name"]];
    for (const r of reports) {
      let city = "Unknown";
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${r.latitude}&lon=${r.longitude}`);
        const data = await res.json();
        city = data.address.city || data.address.town || data.address.village || "Unknown";
      } catch (e) { city = "Fetch Failed"; }

      csvRows.push([r.id, r.category, `"${r.description}"`, r.status, r.latitude, r.longitude, `"${city}"`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Municipal_Report_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && reports.length === 0) return <div className="p-6 text-center">Loading Admin Panel Context...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">🏛️ Municipal Admin Dashboard</h1>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 text-sm shadow">
          📥 Export Data to Excel (CSV)
        </button>
      </div>

      {/* Metrics Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100"><p className="text-sm text-gray-500 font-semibold uppercase">Total Filed</p><h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3></div>
        <div className="bg-amber-50 p-4 rounded-xl shadow border border-amber-100"><p className="text-sm text-amber-600 font-semibold uppercase">Pending</p><h3 className="text-2xl font-bold text-amber-700">{stats.pending}</h3></div>
        <div className="bg-blue-50 p-4 rounded-xl shadow border border-blue-100"><p className="text-sm text-blue-600 font-semibold uppercase">In Progress</p><h3 className="text-2xl font-bold text-blue-700">{stats.progress}</h3></div>
        <div className="bg-emerald-50 p-4 rounded-xl shadow border border-emerald-100"><p className="text-sm text-emerald-600 font-semibold uppercase">Resolved Tasks</p><h3 className="text-2xl font-bold text-emerald-700">{stats.resolved}</h3></div>
      </div>

      {/* Analytics Heat Map View */}
      <div className="bg-white p-4 rounded-xl shadow border mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-3">📍 High Density Waste Incidents Heatmap</h3>
        <div className="h-96 w-full rounded-lg overflow-hidden border">
          <MapContainer center={[28.6139, 77.2090]} zoom={5} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <HeatmapLayer points={reports.map(r => [parseFloat(r.latitude), parseFloat(r.longitude), 50])} />
            {reports.map(r => (
              <Marker key={r.id} position={[parseFloat(r.latitude), parseFloat(r.longitude)]}>
                <Popup><span className="font-bold">{r.category}</span><br />{r.description}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Data Management Table Layout */}
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
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition">
                <td className="p-4"><img src={report.image_url} alt="Evidence" className="w-12 h-12 object-cover rounded border" /></td>
                <td className="p-4"><span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">{report.category}</span></td>
                <td className="p-4 text-sm max-w-xs truncate">{report.description}</td>
                <td className="p-4 text-xs font-mono text-gray-500">{parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}</td>
                <td className="p-4">
                  <select value={report.status} onChange={(e) => handleStatusChange(report.id, e.target.value)} className={`p-1.5 text-xs rounded font-bold border text-white ${report.status === 'RESOLVED' ? 'bg-emerald-600' : report.status === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-amber-600'}`}>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Dynamic Pagination Controls Button Tray */}
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))} className="px-3 py-1.5 rounded border text-sm font-semibold bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition">
            ◀ Previous Page
          </button>
          <span className="text-sm font-medium text-gray-600">Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded border text-sm font-semibold bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition">
            Next Page ▶
          </button>
        </div>
      </div>
    </div>
  );
}
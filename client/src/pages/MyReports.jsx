import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const { data } = await api.get('/reports/my-reports');
        setReports(data);
      } catch (err) {
        console.error("Failed to load personal history");
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  if (loading) return <div className="text-center mt-10 font-medium">Loading history...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 My Reported Issues</h2>
      {reports.length === 0 ? (
        <div className="bg-white p-6 rounded-lg border text-center text-gray-500 shadow-sm">
          You haven't submitted any reports yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-4 items-center">
                <img src={report.image_url} alt="Issue evidence" className="w-16 h-16 object-cover rounded-md border" />
                <div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {report.category}
                  </span>
                  <h4 className="font-semibold text-gray-900 mt-1">{report.description}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Reported on: {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                  report.status === 'RESOLVED' ? 'bg-green-500' : 
                  report.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
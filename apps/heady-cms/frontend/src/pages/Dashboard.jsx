import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileType, FileText, Image, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    contentTypes: 0,
    entries: 0,
    media: 0,
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [contentTypesRes, mediaRes] = await Promise.all([
        api.get('/content-types'),
        api.get('/media?limit=10'),
      ]);

      let totalEntries = 0;
      const entries = [];

      for (const ct of contentTypesRes.data) {
        const entriesRes = await api.get(`/entries/${ct.name}?limit=5`);
        totalEntries += entriesRes.data.length;
        entries.push(...entriesRes.data.map(e => ({ ...e, contentType: ct.display_name })));
      }

      setStats({
        contentTypes: contentTypesRes.data.length,
        entries: totalEntries,
        media: mediaRes.data.length,
      });

      setRecentEntries(entries.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Content Types', value: stats.contentTypes, icon: FileType, color: 'bg-blue-500' },
    { name: 'Total Entries', value: stats.entries, icon: FileText, color: 'bg-green-500' },
    { name: 'Media Files', value: stats.media, icon: Image, color: 'bg-purple-500' },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your Heady CMS</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Entries</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentEntries.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No entries yet. Create your first content!
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.data.title || entry.data.name || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-500">{entry.contentType}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/content-types"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <FileType className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Manage Content Types</h3>
          <p className="text-blue-100">Define and organize your content structure</p>
        </Link>

        <Link
          to="/media"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <Image className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Media Library</h3>
          <p className="text-purple-100">Upload and manage your media files</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

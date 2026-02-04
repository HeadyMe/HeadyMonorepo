import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, FileText, Trash2 } from 'lucide-react';

const ContentTypes = () => {
  const [contentTypes, setContentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async () => {
    try {
      const response = await api.get('/content-types');
      setContentTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch content types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content type?')) {
      return;
    }

    try {
      await api.delete(`/content-types/${id}`);
      setContentTypes(contentTypes.filter(ct => ct.id !== id));
    } catch (error) {
      console.error('Failed to delete content type:', error);
      alert('Failed to delete content type');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading content types...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Types</h1>
          <p className="mt-2 text-gray-600">Manage your content structure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((contentType) => (
          <div key={contentType.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contentType.display_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{contentType.name}</p>
                  {contentType.description && (
                    <p className="text-sm text-gray-600 mt-2">{contentType.description}</p>
                  )}
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      {contentType.schema.fields.length} field{contentType.schema.fields.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contentType.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-6">
                <Link
                  to={`/entries/${contentType.name}`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Entries
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contentTypes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content types</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first content type.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentTypes;

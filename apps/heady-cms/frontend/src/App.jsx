import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentTypes from './pages/ContentTypes';
import Entries from './pages/Entries';
import Media from './pages/Media';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="content-types" element={<ContentTypes />} />
            <Route path="entries/:contentType" element={<Entries />} />
            <Route path="media" element={<Media />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

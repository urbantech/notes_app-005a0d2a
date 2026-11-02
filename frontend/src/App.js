import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import NoteCreation from './components/NoteCreation';
import NoteListing from './components/NoteListing';
import NoteDeletion from './components/NoteDeletion';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('ainative_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem('ainative_token', token);
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://api.ainative.studio/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Failed to login');
      }
      const data = await response.json();
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setToken('');
  };

  const ProtectedRoute = ({ children }) => {
    if (!token && !loading) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <header className="bg-dark-navy text-white p-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Notes App</h1>
            <div>
              {token ? (
                <>
                  <Link to="/" className="mx-2 text-lg">Home</Link>
                  <Link to="/create" className="mx-2 text-lg">Create Note</Link>
                  <button onClick={handleLogout} className="mx-2 text-lg bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="mx-2 text-lg">Login</Link>
              )}
            </div>
          </nav>
        </header>
        <main className="p-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/" element={<ProtectedRoute><NoteListing /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><NoteCreation /></ProtectedRoute>} />
            <Route path="/delete/:id" element={<ProtectedRoute><NoteDeletion /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AINativeProvider>
  );
};

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 bg-white p-8 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" required />
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Login
      </button>
    </form>
  );
};

export default App;
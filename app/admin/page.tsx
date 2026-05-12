"use client"
import React, { useState, useEffect } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  verificationStatus: string;
  createdAt: string;
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate token
  useEffect(() => {
    const t = localStorage.getItem('adminToken');
    if (t) setToken(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === 'SUPERADMIN') {
          localStorage.setItem('adminToken', data.token);
          setToken(data.token);
        } else {
          setErrorMsg('No eres SUPERADMIN');
        }
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) {
      setErrorMsg('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  const fetchPending = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/verifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        if (res.status === 401 || res.status === 403) logout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPending();
      // "Proceso en vivo": poll every 10 seconds
      const interval = setInterval(fetchPending, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleAction = async (userId: string, action: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/verifications/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert('Error al procesar petición');
      }
    } catch (e) {
      alert('Error de conexión');
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center text-green-400">Panel SuperAdmin</h1>
          {errorMsg && <p className="text-red-500 mb-4 text-center">{errorMsg}</p>}
          <input 
            type="email" placeholder="Email" required
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-green-400"
          />
          <input 
            type="password" placeholder="Contraseña" required
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-3 mb-6 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-green-400"
          />
          <button 
            type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold p-3 rounded"
          >
            {loading ? 'Entrando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Verificaciones Pendientes</h1>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Cerrar Sesión
          </button>
        </div>

        {users.length === 0 ? (
          <div className="bg-gray-800 p-8 text-center rounded text-gray-400">
            No hay solicitudes de verificación pendientes ✨
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-gray-800 p-6 rounded flex flex-col md:flex-row justify-between items-center shadow-lg border border-gray-700">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold">{u.name || 'Sin Nombre'}</h2>
                  <p className="text-gray-400">{u.email}</p>
                  <p className="text-xs mt-1 text-gray-500">Registrado el {new Date(u.createdAt).toLocaleDateString()}</p>
                  <p className="inline-block mt-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/50">
                    Rol: {u.role}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction(u.id, 'VERIFIED')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold transition-colors"
                  >
                    Aprobar ✅
                  </button>
                  <button 
                    onClick={() => handleAction(u.id, 'REJECTED')}
                    className="bg-gray-700 hover:bg-red-600 text-white px-6 py-2 rounded font-bold border border-gray-600 hover:border-red-600 transition-colors"
                  >
                    Rechazar ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

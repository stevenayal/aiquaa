import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

interface FeedbackStats {
  tool: string;
  count: number;
}

interface UserStats {
  date: string;
  activeUsers: number;
}

interface TopicStats {
  topic: string;
  requests: number;
}

const Stats: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [userActivity, setUserActivity] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - en producción esto vendría del backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simular llamada al backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTotalUsers(1247);
        
        setFeedbackStats([
          { tool: 'Selenium', count: 45 },
          { tool: 'Cypress', count: 38 },
          { tool: 'Postman', count: 32 },
          { tool: 'JMeter', count: 28 },
          { tool: 'Appium', count: 22 },
          { tool: 'Playwright', count: 18 }
        ]);

        setTopicStats([
          { topic: 'Automatización Web', requests: 156 },
          { topic: 'Testing de APIs', requests: 134 },
          { topic: 'Performance Testing', requests: 98 },
          { topic: 'Mobile Testing', requests: 87 },
          { topic: 'Security Testing', requests: 76 },
          { topic: 'CI/CD Integration', requests: 65 }
        ]);

        setUserActivity([
          { date: 'Lun', activeUsers: 89 },
          { date: 'Mar', activeUsers: 124 },
          { date: 'Mié', activeUsers: 156 },
          { date: 'Jue', activeUsers: 143 },
          { date: 'Vie', activeUsers: 167 },
          { date: 'Sáb', activeUsers: 98 },
          { date: 'Dom', activeUsers: 76 }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Estadísticas de Comunidad - Aiquaa</title>
        <meta name="description" content="Estadísticas y métricas de la comunidad de QA Testing" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Estadísticas de la Comunidad
          </h1>
          <p className="text-xl text-gray-600">
            Descubre las tendencias y el crecimiento de nuestra comunidad de QA
          </p>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos (7 días)</p>
                <p className="text-2xl font-bold text-gray-900">853</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Feedback Recibido</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Herramientas Usadas</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Herramientas más populares */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🛠️ Herramientas Más Populares
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedbackStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tool" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de herramientas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Distribución de Herramientas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feedbackStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tool, percent }) => `${tool} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {feedbackStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Actividad de usuarios */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📈 Actividad de Usuarios (Últimos 7 días)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activeUsers" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Temas más solicitados */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🎯 Temas Más Solicitados
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="topic" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="requests" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Resumen de la Comunidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">68%</div>
              <p className="text-gray-600">Usuarios activos semanalmente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <p className="text-gray-600">Satisfacción con herramientas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
              <p className="text-gray-600">Nuevos usuarios este mes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats; 
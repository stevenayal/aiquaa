import React from 'react';
import Layout from '../components/Layout';
import ApiTestComponent from '../components/ApiTestComponent';

const ApiTest: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-dark-text mb-4">
              🧪 Pruebas de API - Backend Aiquaa
            </h1>
            <p className="text-lg text-gray-600 dark:text-dark-muted max-w-2xl mx-auto">
              Esta página te permite verificar que el backend en <code className="bg-gray-100 dark:bg-dark-secondary px-2 py-1 rounded">https://api.aiquaa.com</code> esté funcionando correctamente.
            </p>
          </div>
          
          <ApiTestComponent />
          
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
              📋 Instrucciones de verificación
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-200">
              <li>Espera a que el SSL cambie de "Generating SSL Certificate" a "Valid Configuration"</li>
              <li>Ejecuta las pruebas usando el botón "Ejecutar todas las pruebas"</li>
              <li>Verifica que todos los endpoints respondan con códigos de éxito (200/201)</li>
              <li>Confirma que no hay errores de CORS</li>
              <li>Verifica que los datos se estén guardando en Supabase</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApiTest; 
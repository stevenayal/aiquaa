'use client';

import { PairwiseInput } from '@aiquaa/allpairs-core';

interface ExamplesTabProps {
  onSelect: (input: PairwiseInput) => void;
}

const EXAMPLES: Array<{
  id: string;
  name: string;
  description: string;
  data: PairwiseInput;
}> = [
  {
    id: 'car-colors',
    name: 'Colores de Autos',
    description: 'Combinaciones de prueba de año, color y modelo de auto',
    data: {
      labels: ['Año', 'Color', 'Auto'],
      parameters: [
        ['2023', '2024', '2025'],
        ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'],
        ['Tesla Model 3', 'Ford Mustang', 'Honda Civic', 'Toyota Camry'],
      ],
    },
  },
  {
    id: 'browser-os',
    name: 'Navegador y SO',
    description: 'Pruebas de compatibilidad de navegadores en diferentes sistemas operativos',
    data: {
      labels: ['Navegador', 'Sistema Operativo', 'Versión'],
      parameters: [
        ['Chrome', 'Firefox', 'Safari', 'Edge'],
        ['Windows', 'macOS', 'Linux'],
        ['Última', 'Anterior', 'Legado'],
      ],
    },
  },
  {
    id: '10x10',
    name: 'Parámetros 10x10',
    description: 'Dataset grande con 10 parámetros de 10 valores cada uno',
    data: {
      labels: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
      parameters: [
        ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'],
        ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'],
        ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'],
        ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
        ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10'],
        ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'],
        ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'],
        ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10'],
        ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10'],
        ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10'],
      ],
    },
  },
];

export default function ExamplesTab({ onSelect }: ExamplesTabProps) {
  const handleSelect = (example: typeof EXAMPLES[0]) => {
    onSelect(example.data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Ejemplos de Datasets
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((example) => (
          <div
            key={example.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {example.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {example.description}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              <div>Parámetros: {example.data.labels.length}</div>
              <div>
                Valores:{' '}
                {example.data.parameters.map((p) => p.length).join(' × ')}
              </div>
            </div>
            <button
              onClick={() => handleSelect(example)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Cargar Ejemplo
            </button>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Nota:</strong> Cargar un ejemplo reemplazará tu configuración actual.
          Asegúrate de exportar o guardar cualquier trabajo que quieras conservar.
        </p>
      </div>
    </div>
  );
}

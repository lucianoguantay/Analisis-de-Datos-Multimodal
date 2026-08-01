import React, { useState } from 'react';
import { ExtractedTableColumn, ExtractedTableRow } from '../types';
import { Table, Search, Download } from 'lucide-react';

interface DataTableProps {
  table?: {
    columns: ExtractedTableColumn[];
    rows: ExtractedTableRow[];
  };
}

export const DataTable: React.FC<DataTableProps> = ({ table }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) return null;

  const validColumns = table.columns.filter(
    (col) => col && typeof col.key === 'string' && typeof col.header === 'string' && col.header.trim().length > 0
  );

  const validRows = table.rows.filter((row) => {
    if (!row || typeof row !== 'object') return false;
    return validColumns.some((col) => {
      const val = String(row[col.key] ?? '').trim();
      return val !== '' && val !== '-' && val !== 'N/A' && val !== 'null' && val !== 'undefined';
    });
  });

  if (validColumns.length === 0 || validRows.length === 0) {
    return null;
  }

  const filteredRows = validRows.filter((row) => {
    if (!searchTerm.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportCSV = () => {
    const headers = validColumns.map((c) => c.header).join(',');
    const rowsCSV = validRows
      .map((row) =>
        validColumns.map((col) => `"${String(row[col.key] ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([`${headers}\n${rowsCSV}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datalens_tabla_extraida.csv`;
    a.click();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Tabla de Datos Desglosada (Conceptos / Muestra)
          </h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-semibold px-2 py-0.5 rounded border border-indigo-100">
            {validRows.length} registros
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar fila..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 w-40 sm:w-52"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
            <tr>
              {validColumns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {validColumns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 font-normal whitespace-nowrap text-slate-800">
                    {String(row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

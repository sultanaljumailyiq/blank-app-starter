import React, { useState } from 'react';
import { ChevronDown, Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';

export interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
  width?: string;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  actions?: {
    view?: (record: any) => void;
    edit?: (record: any) => void;
    delete?: (record: any) => void;
  };
  pageSize?: number;
  className?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data = [],
  title,
  searchable = true,
  filterable = true,
  exportable = true,
  actions,
  pageSize = 10,
  className = ''
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // تصفية البيانات بناء على البحث
  const filteredData = (data || []).filter(item =>
    columns.some(col => {
      const value = item[col.key];
      return value && value.toString().toLowerCase().includes(search.toLowerCase());
    })
  );

  // ترتيب البيانات
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = aValue?.toString() || '';
    const bStr = bValue?.toString() || '';

    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });

  // تقسيم الصفحات
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.title).join(','),
      ...sortedData.map(row =>
        columns.map(col => {
          const value = row[col.key];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Title & Toolbar */}
      {(title || searchable || filterable || exportable) && (
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && (
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            )}

            <div className="flex items-center gap-3">
              {searchable && (
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="البحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50"
                  />
                </div>
              )}

              {filterable && (
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>فلترة</span>
                </button>
              )}

              {exportable && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-5 text-right text-sm font-bold text-gray-600 bg-gray-50/30
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                    ${column.width ? `w-${column.width}` : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-start gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <ChevronDown className={`
                        w-4 h-4 transition-transform
                        ${sortField === column.key && sortDirection === 'desc' ? 'rotate-180' : ''}
                        ${sortField === column.key ? 'text-purple-600' : 'text-gray-300'}
                      `} />
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-5 text-right text-sm font-bold text-gray-600 bg-gray-50/30">
                  العمليات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.map((record, index) => (
              <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-700 group-hover:text-gray-900">
                    {column.render
                      ? column.render(record[column.key], record)
                      : record[column.key]
                    }
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {actions.view && (
                        <button
                          onClick={() => actions.view!(record)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {actions.edit && (
                        <button
                          onClick={() => actions.edit!(record)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {actions.delete && (
                        <button
                          onClick={() => actions.delete!(record)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              عرض {startIndex + 1} إلى {Math.min(startIndex + pageSize, sortedData.length)} من {sortedData.length} عنصر
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                السابق
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      w-9 h-9 flex items-center justify-center rounded-xl transition-all text-sm font-bold
                      ${currentPage === page
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
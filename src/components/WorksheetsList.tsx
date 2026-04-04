/**
 * OOGMATIK - Worksheets List Component
 * Display worksheets with filtering, pagination, and CRUD operations
 */

// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedWorksheet } from '../types';
import {
  useGetUserWorksheets,
  useDeleteWorksheet,
  useShareWorksheet,
} from '../hooks/useWorksheets';
import { ErrorDisplay } from './ErrorDisplay';
import { AppError } from '../utils/AppError';
import { staggerContainer, staggerChild, buttonHover } from '../utils/motionPresets';

interface WorksheetsListProps {
  userId: string;
  userRole: 'admin' | 'teacher' | 'parent' | 'student';
  userName: string;
}

interface _WorksheetListItem extends SavedWorksheet {
  isSelected?: boolean;
  isSharing?: boolean;
  shareError?: string;
}

export const WorksheetsList: React.FC<WorksheetsListProps> = ({ userId, userRole, userName }) => {
  // State
  const [page, setPage] = useState(0);
  const [pageSize, _setPageSize] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);

  // API hooks
  const {
    data: worksheetsData,
    loading,
    error,
  } = useGetUserWorksheets({
    userId,
    userRole,
    page,
    pageSize,
    categoryId: categoryFilter,
  });

  const {
    deleteWorksheet,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteWorksheet(userId, userRole);
  const {
    shareWorksheet,
    loading: shareLoading,
    error: shareError,
  } = useShareWorksheet(userId, userRole);

  // Filter worksheets by search term
  const filteredWorksheets = useMemo(() => {
    if (!worksheetsData?.items) return [];
    return worksheetsData.items.filter((ws) =>
      ws.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [worksheetsData?.items, searchTerm]);

  // Handle delete
  const handleDelete = async (worksheetId: string) => {
    if (window.confirm('Bu çalışmayı silmek istediğinize emin misiniz?')) {
      try {
        await deleteWorksheet(worksheetId);
        setSelectedWorksheets((prev) => prev.filter((id) => id !== worksheetId));
        // Refetch worksheets
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // Handle share
  const handleShare = async (worksheetId: string, recipientId: string) => {
    try {
      await shareWorksheet(worksheetId, recipientId, userName);
      window.alert('Çalışma başarıyla paylaşıldı!');
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Handle select
  const toggleSelect = (worksheetId: string) => {
    setSelectedWorksheets((prev) =>
      prev.includes(worksheetId) ? prev.filter((id) => id !== worksheetId) : [...prev, worksheetId]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Çalışma sayfaları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Çalışma Sayfaları</h2>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Çalışma adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="math">Matematik</option>
            <option value="reading">Okuma</option>
            <option value="creative">Yaratıcı</option>
            <option value="assessment">Değerlendirme</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorDisplay error={new Error(error.message)} onRetry={() => window.location.reload()} />
      )}
      {deleteError && <ErrorDisplay error={new Error(deleteError.message)} />}
      {shareError && <ErrorDisplay error={new Error(shareError.message)} />}

      {/* Worksheets Table */}
      {filteredWorksheets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedWorksheets.length === filteredWorksheets.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedWorksheets(filteredWorksheets.map((ws) => ws.id));
                      } else {
                        setSelectedWorksheets([]);
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Adı</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Aktivite Türü</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Oluşturan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tarih</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">İşlem</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-200"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {filteredWorksheets.map((worksheet) => (
                  <motion.tr
                    key={worksheet.id}
                    className="hover:bg-gray-50 transition-colors"
                    variants={staggerChild}
                    layout
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedWorksheets.includes(worksheet.id)}
                        onChange={() => toggleSelect(worksheet.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid ${worksheet.icon || 'fa-file'}`}></i>
                        <span className="font-medium text-gray-800">{worksheet.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {worksheet.activityType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{worksheet.category?.title || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {worksheet.userId === userId ? (
                        <span className="text-blue-600 font-medium">Sizin</span>
                      ) : (
                        <span className="text-gray-500">
                          {worksheet.sharedByName || 'Paylaşılan'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(worksheet.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Düzenleme */}
                        {worksheet.userId === userId && (
                          <motion.button
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Düzenle"
                            variants={buttonHover}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </motion.button>
                        )}

                        {/* Paylaş */}
                        {userRole === 'teacher' || userRole === 'admin' ? (
                          <motion.button
                            onClick={() => {
                              const recipientId = prompt("Alıcı kullanıcı ID'sini girin:");
                              if (recipientId) {
                                handleShare(worksheet.id, recipientId);
                              }
                            }}
                            disabled={shareLoading}
                            className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:bg-green-50 disabled:opacity-50 rounded transition-colors"
                            title="Paylaş"
                            variants={buttonHover}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <i className="fa-solid fa-share-alt"></i>
                          </motion.button>
                        ) : null}

                        {/* Sil */}
                        {worksheet.userId === userId && (
                          <motion.button
                            onClick={() => handleDelete(worksheet.id)}
                            disabled={deleteLoading}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded transition-colors"
                            title="Sil"
                            variants={buttonHover}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <i className="fa-solid fa-file-circle-exclamation text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">Çalışma sayfası bulunamadı</p>
        </div>
      )}

      {/* Pagination */}
      {worksheetsData && worksheetsData.count > pageSize && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">Toplam: {worksheetsData.count} çalışma</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Önceki
            </button>
            <span className="px-4 py-2 text-gray-600">Sayfa {page + 1}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!worksheetsData || (page + 1) * pageSize >= worksheetsData.count}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksheetsList;

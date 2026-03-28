import React, { useState } from 'react';
import { useStudentStore } from '../store/useStudentStore';

interface StudentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (studentId: string) => void | Promise<void>;
  activityTitle?: string;
  isAssigning?: boolean;
}

export const StudentAssignmentModal: React.FC<StudentAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  activityTitle,
  isAssigning,
}) => {
  const { students } = useStudentStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedStudentId) {
      onAssign(selectedStudentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200 font-lexend">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[85vh]">
        <div className="bg-zinc-900 dark:bg-black p-5 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <i className="fa-solid fa-user-graduate"></i> Öğrenciye Ata
            </h3>
            <p className="text-xs text-zinc-400 mt-1 truncate max-w-[250px]">
              {activityTitle || 'Etkinlik'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-zinc-800 flex flex-col h-full">
          <div className="space-y-4">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
              <input
                type="text"
                placeholder="Öğrenci ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-9 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <i className="fa-regular fa-user text-3xl mb-2"></i>
                <p>Öğrenci bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {filteredStudents.map((student) => {
                  const isSelected = selectedStudentId === student.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/30 border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={
                            student.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`
                          }
                          alt={student.name}
                          className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-600 bg-white"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-white dark:border-zinc-800">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-800 dark:text-zinc-100 text-sm truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {student.grade || 'Öğrenci'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedStudentId && (
            <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700/50 flex flex-col gap-3">
              <button
                onClick={handleAssign}
                disabled={isAssigning}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
              >
                {isAssigning ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                )}
                Ata
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Search, Users, Calendar } from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Student } from '../../types';
import { useToastStore } from '../../store/useToastStore';

export const AssignModal: React.FC = () => {
  const { isAssignModalOpen, activeWorksheetId, setIsAssignModalOpen, createAssignment } = useAssignmentStore();
  const { students, fetchStudents } = useStudentStore();
  const { user } = useAuthStore();
  const { error } = useToastStore();

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Sadece öğretmen kendi öğrencilerini listeler
  useEffect(() => {
    if (user?.uid && isAssignModalOpen) {
      const unsubscribe = fetchStudents(user.uid);
      return () => unsubscribe();
    }
  }, [user?.uid, fetchStudents, isAssignModalOpen]);

  // Modal kapandığında state temizle
  useEffect(() => {
    if (!isAssignModalOpen) {
      setSelectedStudents(new Set());
      setSearchTerm('');
      setTeacherNotes('');
      setDueDate('');
    }
  }, [isAssignModalOpen]);

  if (!isAssignModalOpen || !activeWorksheetId) return null;

  const filteredStudents = students.filter((s: Student) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudents(newSet);
  };

  const selectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s: Student) => s.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.size === 0) {
      error("Lütfen en az bir öğrenci seçin.");
      return;
    }
    if (!user?.uid) return;

    setIsSubmitting(true);
    const success = await createAssignment({
      studentIds: Array.from(selectedStudents),
      worksheetId: activeWorksheetId,
      dueDate: dueDate || undefined,
      teacherNotes: teacherNotes || undefined
    }, user.uid);

    setIsSubmitting(false);
    if (success) {
      setIsAssignModalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAssignModalOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <div>
              <h2 className="text-xl font-semibold text-white font-inter">Öğrenciye Ata</h2>
              <p className="text-sm text-slate-400 mt-1">Bu çalışmayı belirlediğiniz öğrencilere gönderin.</p>
            </div>
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Search and List */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Öğrenci ara..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-inter"
                  />
                </div>
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors font-medium whitespace-nowrap"
                >
                  <Users size={18} />
                  {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? 'Seçimi Temizle' : 'Tümünü Seç'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                {filteredStudents.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 font-inter">
                    Öğrenci bulunamadı.
                  </div>
                ) : (
                  filteredStudents.map((student: Student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        selectedStudents.has(student.id) 
                          ? 'bg-blue-500/10 border-blue-500/50 text-white' 
                          : 'bg-slate-800/50 border-transparent hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        selectedStudents.has(student.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                      }`}>
                        {selectedStudents.has(student.id) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      
                      {student.avatar && (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">
                          <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="flex-1 truncate">
                        <p className="font-medium text-sm font-inter truncate">{student.name}</p>
                        {student.grade && <p className="text-xs text-slate-500 truncate">{student.grade}. Sınıf</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarih */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 font-inter flex items-center gap-2">
                  <Calendar size={16} /> 
                  Bitiş Tarihi (İsteğe Bağlı)
                </label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-inter"
                />
              </div>

              {/* Eğitmen Notları */}
              {/* DIKKAT: KVKK Uyumu - Tanı bilgisi vs buraya girilmemeli */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300 font-inter">
                  Öğretmen Notları (Gizli - Sadece Siz Görürsünüz)
                </label>
                <textarea 
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Bu etkinlikte dikkat edilmesi gerekenler, hedef puan vb."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-inter"
                />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-inter"
            >
              İptal
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedStudents.size === 0 || isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-medium text-white transition-all shadow-lg font-inter flex items-center gap-2 ${
                selectedStudents.size === 0 || isSubmitting
                  ? 'bg-blue-600/50 cursor-not-allowed opacity-50' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Atanıyor...
                </>
              ) : (
                `Gönder (${selectedStudents.size} Öğrenci)`
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

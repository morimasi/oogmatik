import { create } from 'zustand';
import { db } from '../services/firebaseClient';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { 
  ActivityAssignment, 
  CreateAssignmentPayload, 
  AssignmentUpdatePayload 
} from '../types/assignment';
import { assignmentService } from '../services/assignmentService';
import { useToastStore } from './useToastStore';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface AssignmentState {
  assignments: ActivityAssignment[];
  isLoading: boolean;
  
  // UI State for Modal
  isAssignModalOpen: boolean;
  activeWorksheetId: string | null;

  // Actions
  setIsAssignModalOpen: (isOpen: boolean, worksheetId?: string) => void;
  fetchTeacherAssignments: (teacherId: string) => () => void;
  fetchStudentAssignments: (studentId: string) => () => void;
  createAssignment: (payload: CreateAssignmentPayload, assignedBy: string) => Promise<boolean>;
  updateAssignment: (id: string, updates: AssignmentUpdatePayload) => Promise<boolean>;
}

export const useAssignmentStore = create<AssignmentState>()((set, get) => ({
  assignments: [],
  isLoading: false,
  isAssignModalOpen: false,
  activeWorksheetId: null,

  setIsAssignModalOpen: (isOpen: boolean, worksheetId?: string) => {
    set({ 
      isAssignModalOpen: isOpen, 
      activeWorksheetId: isOpen && worksheetId ? worksheetId : null 
    });
  },

  fetchTeacherAssignments: (teacherId: string) => {
    set({ isLoading: true });
    
    const q = query(
      collection(db, 'assignments'),
      where('assignedBy', '==', teacherId)
    );

    return onSnapshot(q, (snapshot) => {
      const assignmentList: ActivityAssignment[] = [];
      snapshot.forEach((doc) => {
        assignmentList.push(doc.data() as ActivityAssignment);
      });
      set({ assignments: assignmentList, isLoading: false });
    }, (error) => {
      logError("Assignment listener error:", error);
      set({ isLoading: false });
    });
  },

  fetchStudentAssignments: (studentId: string) => {
    set({ isLoading: true });
    
    const q = query(
      collection(db, 'assignments'),
      where('studentId', '==', studentId)
    );

    return onSnapshot(q, (snapshot) => {
      const assignmentList: ActivityAssignment[] = [];
      snapshot.forEach((doc) => {
        assignmentList.push(doc.data() as ActivityAssignment);
      });
      set({ assignments: assignmentList, isLoading: false });
    }, (error) => {
      logError("Assignment listener error:", error);
      set({ isLoading: false });
    });
  },

  createAssignment: async (payload: CreateAssignmentPayload, assignedBy: string) => {
    set({ isLoading: true });
    try {
      await assignmentService.createAssignments(payload, assignedBy);
      useToastStore.getState().success("Atama başarıyla tamamlandı.");
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      useToastStore.getState().error(error.userMessage || "Atama sırasında bir hata oluştu.");
      return false;
    }
  },

  updateAssignment: async (id: string, updates: AssignmentUpdatePayload) => {
    set({ isLoading: true });
    try {
      await assignmentService.updateAssignment(id, updates);
      useToastStore.getState().success("Atama durumu güncellendi.");
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      useToastStore.getState().error(error.userMessage || "Güncelleme sırasında bir hata oluştu.");
      return false;
    }
  }
}));

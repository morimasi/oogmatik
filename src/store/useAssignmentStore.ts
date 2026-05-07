import { create } from 'zustand';
import { db } from '../services/firebaseClient';
import {
  collection,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  // @ts-ignore
} from 'firebase/firestore';
import { 
  ActivityAssignment, 
  CreateAssignmentPayload, 
  AssignmentUpdatePayload 
} from '../types/assignment';
import { assignmentService } from '../services/assignmentService';
import { useToastStore } from './useToastStore';

import { AppError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';
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

export const useAssignmentStore = create<AssignmentState>()((set) => ({
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

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const assignmentList: ActivityAssignment[] = [];
      snapshot.forEach((doc: any) => {
        assignmentList.push(doc.data() as ActivityAssignment);
      });
      set({ assignments: assignmentList, isLoading: false });
    }, (error: Error) => {
      logError("Assignment listener error:", { message: error.message });
      set({ isLoading: false });
    });
  },

  fetchStudentAssignments: (studentId: string) => {
    set({ isLoading: true });
    
    const q = query(
      collection(db, 'assignments'),
      where('studentId', '==', studentId)
    );

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const assignmentList: ActivityAssignment[] = [];
      snapshot.forEach((doc: any) => {
        assignmentList.push(doc.data() as ActivityAssignment);
      });
      set({ assignments: assignmentList, isLoading: false });
    }, (error: Error) => {
      logError("Assignment listener error:", { message: error.message });
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
    } catch (error: unknown) {
      set({ isLoading: false });
      const appError = error instanceof AppError ? error : new AppError(
        'Assignment creation failed',
        'ASSIGNMENT_CREATE_ERROR',
        500,
        { originalError: error }
      );
      useToastStore.getState().error(appError.userMessage || "Atama sırasında bir hata oluştu.");
      return false;
    }
  },

  updateAssignment: async (id: string, updates: AssignmentUpdatePayload) => {
    set({ isLoading: true });
    try {
      await assignmentService.updateAssignment(id, updates);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ isLoading: false });
      const appError = error instanceof AppError ? error : new AppError(
        'Assignment update failed',
        'ASSIGNMENT_UPDATE_ERROR',
        500,
        { originalError: error }
      );
      useToastStore.getState().error(appError.userMessage || "Güncelleme sırasında bir hata oluştu.");
      return false;
    }
  },
}));

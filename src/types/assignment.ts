export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface ActivityAssignment {
  id: string; // Firebase Doc ID
  worksheetId: string; // Atanan çalışma kağıdının ID'si
  studentId: string; // Atanan öğrencinin ID'si
  assignedBy: string; // Atamayı yapan öğretmenin/adminin ID'si
  assignedAt: string; // ISO Date String
  dueDate?: string; // İsteğe bağlı bitiş/tamamlama hedef tarihi
  status: AssignmentStatus; // Atamanın mevcut durumu
  statusUpdatedAt: string; // Durumun son değiştiği tarih
  
  // Eğitmen notları ve öğrenci skoru (KVKK Kuralları uyarınca gizli tutulmalı)
  score?: number; 
  teacherNotes?: string; 
}

export interface CreateAssignmentPayload {
  worksheetId: string;
  studentIds: string[]; // Toplu atama yapabilmek için array
  dueDate?: string;
  teacherNotes?: string;
}

export interface AssignmentUpdatePayload {
  status?: AssignmentStatus;
  score?: number;
  teacherNotes?: string;
}

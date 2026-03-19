export interface Student {
    id: string;
    teacherId: string;
    name: string;
    age: number;
    grade: string;
    avatar: string;
    diagnosis: string[];
    interests: string[];
    strengths: string[];
    weaknesses: string[];
    learningStyle: 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma';
    parentName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    notesHistory?: string;
    createdAt: string;
}

export interface StudentProfile {
    studentId?: string;
    name: string;
    school: string;
    grade: string;
    date: string;
    notes?: string;
}

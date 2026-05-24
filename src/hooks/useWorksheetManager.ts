import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';
import { useWorksheetStore } from '../store/useWorksheetStore';
import { useToastStore } from '../store/useToastStore';
import { useUIStore } from '../store/useUIStore';
import { worksheetService } from '../services/worksheetService';
import { ActivityType, SingleWorksheetData, SavedWorksheet, Curriculum, SavedAssessment, StyleSettings, StudentProfile, WorksheetData, View } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useNavigationLogic } from './useNavigationLogic';

export const useWorksheetManager = (
    styleSettings: StyleSettings,
    studentProfile: StudentProfile | null,
    setStudentProfile: (profile: StudentProfile | null) => void,
    setStyleSettings: (settings: StyleSettings) => void,
    setIsAuthModalOpen: (open: boolean) => void,
    setWorkbookItems: (items: any) => void,
    setWorkbookSettings: (settings: any) => void,
    setSelectedSavedReport: (report: any) => void,
    setLoadedCurriculum: (curriculum: any) => void,
    navigateTo: (view: View) => void,
    setIsSidebarExpanded: (expanded: boolean) => void
) => {
    const { user } = useAuthStore();
    const { activeStudent, setActiveStudent, students } = useStudentStore();
    const { setSelectedActivity, setWorksheetData, setActiveWorksheet } = useWorksheetStore();
    const toast = useToastStore();

    const addSavedWorksheet = async (
        name: string,
        activityType: ActivityType,
        data: WorksheetData
    ) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return null;
        }
        const activity = ACTIVITIES.find((a) => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find((c) => c.activities.includes(activityType));
        if (!activity || !category) return null;
        try {
            const saved = await worksheetService.saveWorksheet(
                user.id,
                name,
                activityType,
                data as SingleWorksheetData[],
                activity.icon,
                { id: category.id, title: category.title },
                styleSettings,
                studentProfile || (activeStudent ? {
                    name: activeStudent.name,
                    grade: activeStudent.grade,
                    date: new Date().toLocaleDateString('tr-TR'),
                    school: ''
                } : undefined),
                activeStudent?.id || studentProfile?.studentId,
                activeStudent?.name || studentProfile?.name
            );
            toast.success(`Etkinlik "${name}" adıyla arşivinize kaydedildi.`);
            return saved.id;
        } catch (e: unknown) {
            toast.error(`Kaydedilirken bir hata oluştu: ${(e as Error).message}.`);
            return null;
        }
    };

    const loadSavedWorksheet = (item: SavedWorksheet | Curriculum | SavedAssessment | any) => {
        if (item.report || item.activityType === ActivityType.ASSESSMENT_REPORT) {
            setSelectedSavedReport(item);
            return;
        }
        if (item.schedule && item.durationDays) {
            setLoadedCurriculum(item);
            navigateTo('curriculum');
            return;
        }
        if (item.activityType === ActivityType.WORKBOOK || item.workbookItems) {
            if (item.workbookItems && item.workbookSettings) {
                setWorkbookItems(item.workbookItems);
                setWorkbookSettings(item.workbookSettings);
                navigateTo('workbook');
            }
            return;
        }

        setSelectedActivity(item.activityType);
        let wd = item.worksheetData;
        if (typeof wd === 'string') { try { wd = JSON.parse(wd); } catch { wd = []; } }
        if (wd && typeof wd === 'object' && !Array.isArray(wd)) { wd = [wd]; }
        setWorksheetData(Array.isArray(wd) ? wd : null);
        setActiveWorksheet(item.id, item.name);

        if (item.styleSettings) setStyleSettings(item.styleSettings);

        if (item.studentProfile) {
            setStudentProfile(item.studentProfile);
            if (item.studentId) {
                const s = students.find((x: { id: string }) => x.id === item.studentId);
                if (s) setActiveStudent(s);
            }
        } else {
            setStudentProfile(null);
            setActiveStudent(null);
        }
        navigateTo('generator');
        setIsSidebarExpanded(true);
    };

    return { addSavedWorksheet, loadSavedWorksheet };
};

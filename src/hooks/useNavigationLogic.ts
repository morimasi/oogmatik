import { View, ActivityType } from '../types';
import { useWorksheetStore } from '../store/useWorksheetStore';
import { useUIStore } from '../store/useUIStore';
import { useNavigate } from 'react-router-dom';

export const useNavigationLogic = (
    setScreeningPlanData: (data: any) => void,
    setIsAdvancedScreeningOpen: (open: boolean) => void
) => {
    const navigate = useNavigate();
    const {
        currentView,
        activeCurriculumSession,
        setActiveCurriculumSession,
        resetGeneratorContext,
    } = useWorksheetStore();

    const { setIsSidebarOpen } = useUIStore();

    const navigateTo = (view: View) => {
        if (currentView === view) return;
        
        // Map common views to routes
        if (view === 'generator') navigate('/');
        else navigate(`/${view}`);
    };

    const handleGoBack = () => {
        if (currentView === 'generator' && activeCurriculumSession) {
            setActiveCurriculumSession(null);
            navigateTo('curriculum');
            return;
        }
        navigate(-1);
    };

    const handleOpenStudio = (viewName: View) => {
        resetGeneratorContext();
        if (viewName === 'screening') {
            setIsAdvancedScreeningOpen(true);
            setIsSidebarOpen(false);
        } else {
            navigateTo(viewName);
        }
    };

    const handleGeneratePlanFromScreening = (
        studentName: string,
        age: number,
        weaknesses: string[],
        diagnosisContext?: string
    ) => {
        setScreeningPlanData({ name: studentName, age, weaknesses, diagnosisContext });
        handleOpenStudio('curriculum');
    };

    return {
        navigateTo,
        handleGoBack,
        handleOpenStudio,
        handleGeneratePlanFromScreening,
    };
};

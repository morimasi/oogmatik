import { View, ActivityType } from '../types';
import { useWorksheetStore } from '../store/useWorksheetStore';
import { useUIStore } from '../store/useUIStore';

export const useNavigationLogic = (
    setScreeningPlanData: (data: any) => void,
    setIsAdvancedScreeningOpen: (open: boolean) => void
) => {
    const {
        currentView,
        setCurrentView,
        addHistoryView,
        popHistoryView,
        addForwardView,
        popForwardView,
        activeCurriculumSession,
        setActiveCurriculumSession,
        resetGeneratorContext,
    } = useWorksheetStore();

    const { setIsSidebarOpen } = useUIStore();

    const navigateTo = (view: View) => {
        if (currentView === view) return;
        addHistoryView(currentView);
        setCurrentView(view);
    };

    const handleGoBack = () => {
        if (currentView === 'generator' && activeCurriculumSession) {
            setActiveCurriculumSession(null);
            navigateTo('curriculum');
            return;
        }
        const prevView = popHistoryView();
        if (prevView) {
            addForwardView(currentView);
            setCurrentView(prevView);
        } else {
            setCurrentView('generator');
        }
    };

    const handleGoForward = () => {
        const nextView = popForwardView();
        if (nextView) {
            addHistoryView(currentView, false);
            setCurrentView(nextView);
        }
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
        handleGoForward,
        handleOpenStudio,
        handleGeneratePlanFromScreening,
    };
};

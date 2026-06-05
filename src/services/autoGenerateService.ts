import { AssessmentReport, CollectionItem, GeneratorOptions, User, StudentProfile, StyleSettings, ActivityType } from '../types';
import { ACTIVITIES } from '../constants';
import * as offlineGenerators from './offlineGenerators';
import { logError } from '../utils/logger.js';

export const autoGenerateService = {
  async generateWorkbookFromReport(
    report: AssessmentReport,
    user: User | null,
    studentProfile: StudentProfile | null,
    styleSettings: StyleSettings
  ): Promise<CollectionItem[]> {
    const newItems: CollectionItem[] = [];
    const defaultOptions: GeneratorOptions = {
      mode: 'fast',
      difficulty: 'Orta',
      worksheetCount: 1,
      itemCount: 10,
      gridSize: 10,
      operationType: 'mixed',
      numberRange: '1-20',
    };

    try {
      const reportItem: CollectionItem = {
        id: crypto.randomUUID(),
        activityType: ActivityType.ASSESSMENT_REPORT,
        data: {
          id: 'temp-report',
          userId: user?.id || 'guest',
          studentName: studentProfile?.name || 'Öğrenci',
          gender: 'Erkek',
          age: 7,
          grade: studentProfile?.grade || '1. Sınıf',
          createdAt: new Date().toISOString(),
          report: report,
        } as unknown as Record<string, unknown>,
        settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
        title: `Rapor: ${studentProfile?.name || 'Öğrenci'}`,
      };
      
      newItems.push(reportItem);

      for (const roadItem of report.roadmap) {
        const activityId = roadItem.activityId as ActivityType;
        const pascalName = activityId
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        const generatorName = `generateOffline${pascalName}`;
        const generator = (offlineGenerators as any)[generatorName];
        
        if (generator) {
          try {
            const generatedData = await generator(defaultOptions as unknown as Record<string, unknown>);
            generatedData.forEach((sheet: any) => {
              newItems.push({
                id: crypto.randomUUID(),
                activityType: activityId,
                data: sheet,
                settings: { ...styleSettings },
                title: ACTIVITIES.find((a) => a.id === activityId)?.title || activityId,
              });
            });
          } catch (genErr) {
            logError(genErr as any, { activityId });
          }
        }
      }
      
      return newItems;
    } catch (e) {
      logError(e as any, { reportSummary: report ? 'var' : 'yok' });
      throw e;
    }
  }
};

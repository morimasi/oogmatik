import { v4 as uuidv4 } from 'uuid';
import type { CollectionItem, WorkbookSettings as LegacyWorkbookSettings, StyleSettings, Difficulty, AgeGroup } from '../types';
import type {
  Workbook,
  WorkbookPage,
  WorkbookActivityContent,
  WorkbookDividerContent,
  WorkbookSettings as V2WorkbookSettings,
} from '../types/workbook';
import { ActivityType } from '../types/activity';

const DEFAULT_STYLE: StyleSettings = {
  fontSize: 18,
  scale: 1,
  borderColor: '#3f3f46',
  borderWidth: 1,
  margin: 10,
  columns: 1,
  gap: 15,
  orientation: 'portrait',
  themeBorder: 'simple',
  contentAlign: 'left',
  fontWeight: 'normal',
  fontStyle: 'normal',
  visualStyle: 'card',
  showPedagogicalNote: false,
  showAnswers: false,
  showClues: false,
  showMascot: false,
  showStudentInfo: true,
  showTitle: true,
  showInstruction: true,
  showImage: true,
  showFooter: true,
  smartPagination: true,
  fontFamily: 'Lexend',
  lineHeight: 1.6,
  letterSpacing: 0,
  wordSpacing: 2,
  paragraphSpacing: 24,
  focusMode: false,
  rulerColor: '#6366f1',
  rulerHeight: 80,
  maskOpacity: 0.4,
  footerText: '',
};

export function workbookToCollectionItems(workbook: Workbook): CollectionItem[] {
  return [...workbook.pages]
    .sort((a, b) => a.order - b.order)
    .flatMap((page): CollectionItem[] => {
      if (page.type === 'divider') {
        const content = page.content as WorkbookDividerContent;
        return [{
          id: page.id,
          activityType: ActivityType.WORKBOOK,
          itemType: 'divider',
          data: {},
          settings: DEFAULT_STYLE,
          title: content.sectionTitle || 'Bölüm',
          dividerConfig: {
            title: content.sectionTitle || 'Bölüm',
            subtitle: '',
            icon: 'fa-solid fa-bookmark',
          },
        }];
      }
      if (page.type !== 'activity') return [];
      const content = page.content as WorkbookActivityContent;
      return [{
        id: page.id,
        activityType: content.activityType,
        itemType: 'activity',
        data: (content.activityData ?? {}) as CollectionItem['data'],
        settings: DEFAULT_STYLE,
        title: `Aktivite ${page.order + 1}`,
      }];
    });
}

export function collectionItemsToWorkbookPages(workbookId: string, items: CollectionItem[]): WorkbookPage[] {
  const now = new Date().toISOString();
  return items.map((item, index) => {
    if (item.itemType === 'divider') {
      const dividerContent: WorkbookDividerContent = {
        type: 'divider',
        sectionTitle: item.dividerConfig?.title || item.title,
        sectionNumber: index + 1,
        design: 'simple',
      };
      return {
        id: item.id || uuidv4(),
        workbookId,
        order: index,
        type: 'divider',
        content: dividerContent,
        createdAt: now,
        updatedAt: now,
      };
    }

    const activityContent: WorkbookActivityContent = {
      type: 'activity',
      activityType: item.activityType,
      activityData: item.data,
      targetSkills: [],
      difficulty: 'easy' as Difficulty,
      estimatedDuration: 15,
      profile: 'dyslexia',
      ageGroup: 'elementary' as AgeGroup,
    };

    return {
      id: item.id || uuidv4(),
      workbookId,
      order: index,
      type: 'activity',
      content: activityContent,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export function legacySettingsToV2(settings: LegacyWorkbookSettings): Partial<V2WorkbookSettings> {
  return {
    title: settings.title,
    studentName: settings.studentName,
  };
}

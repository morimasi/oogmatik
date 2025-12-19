
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import { PedagogicalHeader, ImageDisplay, GridComponent, ConnectionDot } from './sheets/common';
import { EditableElement, EditableText } from './Editable';
import { StoryComprehensionSheet } from './sheets/ReadingComprehensionSheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

// ... existing widgets ...

const DynamicLayoutRenderer: React.FC<{ data: any }> = ({ data }) => {
    // ... existing logic ...
    return <div className="p-4">Dynamic Content Placeholder</div>;
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    if (activityType === 'STORY_COMPREHENSION') {
        return <StoryComprehensionSheet data={data} />;
    }

    if (activityType === 'ALGORITHM_GENERATOR') {
        return <AlgorithmSheet data={data} />;
    }

    return <DynamicLayoutRenderer data={data} />;
});

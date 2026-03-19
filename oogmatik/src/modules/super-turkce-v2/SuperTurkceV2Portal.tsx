import React, { useState } from 'react';
import { PortalHome } from './ui/PortalHome';
import { StudioLayout } from './ui/StudioLayout';
import { useSuperTurkceV2Store } from './core/store';

// react-pdf Font register vs işlemleri
import { Font } from '@react-pdf/renderer';
Font.register({
    family: 'OpenDyslexic',
    src: '/fonts/OpenDyslexic-Regular.otf'
});
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 }
    ]
});

interface Props {
    onBack?: () => void;
}

export const SuperTurkceV2Portal: React.FC<Props> = ({ onBack }) => {
    const activeStudioId = useSuperTurkceV2Store(state => state.activeStudioId);
    const setStudioId = useSuperTurkceV2Store(state => state.setStudioId);

    const handleReturnToHome = () => {
        setStudioId(null);
    };

    const handeExitPortal = () => {
        if (onBack) onBack();
    };

    return (
        <div className="w-full h-full bg-slate-50 relative flex overflow-hidden">
            {activeStudioId ? (
                <StudioLayout onBack={handleReturnToHome} />
            ) : (
                <PortalHome onBack={handeExitPortal} />
            )}
        </div>
    );
};

export default SuperTurkceV2Portal;

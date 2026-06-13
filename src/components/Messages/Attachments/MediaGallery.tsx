import React from 'react';
import { Attachment } from '../../../types/messaging';

interface MediaGalleryProps {
    attachments: Attachment[];
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ attachments }) => {
    return (
        <div className="grid grid-cols-2 gap-2 mt-2">
            {attachments.map(att => (
                <div key={att.id} className="relative rounded overflow-hidden bg-black/40 border border-white/10 aspect-video flex items-center justify-center group">
                    <img src={att.url} alt={att.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                    {/* Yükleniyor / Tarama Mock */}
                    {att.virusScanStatus?.status === 'pending' && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2 backdrop-blur-sm">
                            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
                            <span className="text-[10px] text-white mt-1">Taranıyor...</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

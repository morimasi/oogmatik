import React from 'react';
import type { AdStudioTarget } from '../../../types/adStudio';
import { AD_TARGET_LABELS } from '../../../types/adStudio';
import { getModuleColor } from '../../../services/screenshotCaptureService';

interface ModulePreviewProps {
  target: AdStudioTarget;
  className?: string;
}

export const ModulePreview: React.FC<ModulePreviewProps> = ({ target, className }) => {
  const color = getModuleColor(target);
  const label = AD_TARGET_LABELS[target] || target;

  return (
    <div
      className={className}
      style={{
        width: 400,
        height: 300,
        background: `linear-gradient(135deg, #0f0a2e 0%, ${color}15 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '8px 16px',
          background: `${color}20`,
          borderBottom: `1px solid ${color}20`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 900,
            color: '#fff',
          }}
        >
          O
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>Oogmatik</span>
        <span style={{ fontSize: 9, color: '#64748b', marginLeft: 'auto' }}>{label}</span>
      </div>

      <div
        style={{
          padding: '48px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${color}, ${color}66)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 900,
            color: '#fff',
            boxShadow: `0 0 40px ${color}30`,
          }}
        >
          O
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', textAlign: 'center' }}>
          {label}
        </div>
        <div
          style={{
            width: '70%',
            height: 4,
            borderRadius: 2,
            background: `${color}30`,
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: '60%',
              height: '100%',
              borderRadius: 2,
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 24,
                height: 16,
                borderRadius: 4,
                background: `${color}15`,
                border: `1px solid ${color}20`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

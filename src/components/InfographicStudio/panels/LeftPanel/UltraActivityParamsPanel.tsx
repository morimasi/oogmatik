/**
 * @file src/components/InfographicStudio/panels/LeftPanel/UltraActivityParamsPanel.tsx
 * @description Seçili aktivitenin customizationSchema'sından dinamik form oluşturan
 * Ultra Premium Özelleştirme Paneli.
 *
 * Elif Yıldız: Her aktiviteye özel pedagojik parametreler.
 * Bora Demir: any yasak, her kontrol tip güvenli.
 */

import React from 'react';
import { ActivityType } from '../../../../types/activity';
import { CustomizationSchemaParameter } from '../../../../types/infographic';
import { getActivityCustomizationSchema } from '../../../../services/generators/infographic/infographicRegistry';
import { cn } from '../../../../utils/tailwindUtils';
import { Settings2 } from 'lucide-react';

export type ActivityParamsState = Record<string, string | number | boolean>;

interface UltraActivityParamsPanelProps {
  activityType: ActivityType;
  params: ActivityParamsState;
  onChange: (params: ActivityParamsState) => void;
}

function buildDefaultParams(
  parameters: CustomizationSchemaParameter[]
): ActivityParamsState {
  const defaults: ActivityParamsState = {};
  for (const p of parameters) {
    const v = p.defaultValue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      defaults[p.name] = v;
    } else if (v !== undefined && v !== null) {
      defaults[p.name] = String(v);
    }
  }
  return defaults;
}

// Dışarıya: seçili aktivite değiştiğinde başlangıç değerlerini hesapla
export function getDefaultActivityParams(
  activityType: ActivityType
): ActivityParamsState {
  const schema = getActivityCustomizationSchema(activityType);
  return buildDefaultParams(schema.parameters);
}

const labelClass =
  'block text-[11px] font-medium text-white/60 mb-1 ml-0.5 tracking-wide';
const baseInputClass =
  'w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white ' +
  'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent';

export const UltraActivityParamsPanel: React.FC<UltraActivityParamsPanelProps> = ({
  activityType,
  params,
  onChange,
}) => {
  const schema = getActivityCustomizationSchema(activityType);

  if (schema.parameters.length === 0) return null;

  const update = (name: string, value: string | number | boolean) => {
    onChange({ ...params, [name]: value });
  };

  return (
    <div className="mt-4 mb-2">
      {/* Başlık */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Settings2 className="w-3.5 h-3.5 text-accent/60" />
        <span className="text-[11px] font-semibold text-accent/70 uppercase tracking-widest">
          Ultra Özelleştirme
        </span>
      </div>

      <div className="space-y-3">
        {schema.parameters.map((param) => (
          <div key={param.name}>
            <label className={labelClass} title={param.description}>
              {param.label}
            </label>

            {/* Sayı */}
            {param.type === 'number' && (
              <input
                type="number"
                value={
                  typeof params[param.name] === 'number'
                    ? (params[param.name] as number)
                    : (param.defaultValue as number) ?? 0
                }
                onChange={(e) => update(param.name, parseInt(e.target.value, 10) || 0)}
                className={cn(baseInputClass, 'appearance-none')}
                min={0}
              />
            )}

            {/* Boolean toggle */}
            {param.type === 'boolean' && (
              <button
                type="button"
                onClick={() =>
                  update(
                    param.name,
                    !(typeof params[param.name] === 'boolean'
                      ? params[param.name]
                      : param.defaultValue)
                  )
                }
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                  params[param.name] ?? param.defaultValue
                    ? 'bg-accent/70'
                    : 'bg-white/15'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200',
                    params[param.name] ?? param.defaultValue ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            )}

            {/* Enum seçici */}
            {param.type === 'enum' && Array.isArray(param.options) && (
              <select
                value={
                  typeof params[param.name] === 'string'
                    ? (params[param.name] as string)
                    : String(param.defaultValue ?? '')
                }
                onChange={(e) => update(param.name, e.target.value)}
                className={cn(baseInputClass, 'appearance-none')}
              >
                {param.options.map((opt) => (
                  <option key={String(opt)} value={String(opt)}>
                    {String(opt)}
                  </option>
                ))}
              </select>
            )}

            {/* Serbest metin */}
            {param.type === 'string' && (
              <input
                type="text"
                value={
                  typeof params[param.name] === 'string'
                    ? (params[param.name] as string)
                    : String(param.defaultValue ?? '')
                }
                onChange={(e) => update(param.name, e.target.value)}
                className={baseInputClass}
                placeholder={param.description}
              />
            )}

            {/* Açıklama ipucu */}
            <p className="text-[10px] text-white/30 mt-0.5 ml-0.5">{param.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

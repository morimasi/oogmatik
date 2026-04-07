import { generateCreativeMultimodal } from '../geminiClient';
import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { WorksheetData } from '../../types/core';
import { BaseGenerator } from './core/BaseGenerator';

export class KavramHaritasiGenerator extends BaseGenerator<WorksheetData> {
  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const opts = options as Record<string, unknown>;
    const concept = (opts.concept as string) || (options.topic as string) || 'Su Döngüsü';
    const difficulty = options.difficulty || 'Orta';
    const depth = (opts.depth as number) || 2;
    const branchCount = (opts.branchCount as number) || 4;
    const fillRatio = (opts.fillRatio as number) ?? 0.4;
    const layout = (opts.layout as string) || 'radial';

    const prompt = `Sen eğitim materyali uzmanısın. "${concept}" kavramı için Türkçe bir kavram haritası üret.

PARAMETRELERİ:
- Kavram: "${concept}"
- Derinlik: ${depth} seviye (1=sadece ana dallar, 2=ana+alt dallar)
- Ana Dal Sayısı: ${branchCount}
- Zorluk: ${difficulty}
- Doluluk: Toplam düğümlerin %${Math.round((1 - fillRatio) * 100)}'i dolu, %${Math.round(fillRatio * 100)}'i öğrencinin dolduracağı boş alan
- Yerleşim: ${layout}

ZORUNLU JSON ÇIKTISI:
{
  "id": "km_uuid",
  "activityType": "KAVRAM_HARITASI",
  "title": "${concept} Kavram Haritası",
  "instruction": "Boş kutulara uygun kavramları yazarak haritayı tamamla.",
  "pedagogicalNote": "Bu etkinlik öğrencinin kavramlar arası ilişkileri görsel-mekansal olarak organize etme becerisini geliştirir. ${concept} konusundaki şema bilgisi ve uzun süreli bellek kodlaması hedeflenir.",
  "nodes": [
    {"id": "center", "label": "${concept}", "isEmpty": false, "level": 0},
    {"id": "n1", "label": "Ana Kavram 1", "isEmpty": false, "level": 1},
    {"id": "n1_1", "label": "Alt Kavram", "isEmpty": true, "level": 2}
  ],
  "edges": [
    {"from": "center", "to": "n1", "label": "içerir"},
    {"from": "n1", "to": "n1_1"}
  ],
  "examples": ["Örnek 1", "Örnek 2"],
  "settings": {
    "concept": "${concept}",
    "depth": ${depth},
    "branchCount": ${branchCount},
    "fillRatio": ${fillRatio},
    "layout": "${layout}"
  }
}

KURALLAR:
1. Merkez düğüm (id: "center", level: 0) her zaman dolu (isEmpty: false)
2. Ana dallar (level: 1): ${branchCount} tane, kavramın temel boyutları
3. Alt dallar (level: 2): her ana daldan 2-3 tane (depth >= 2 ise)
4. isEmpty: true olan düğüm sayısı toplam düğümlerin ~%${Math.round(fillRatio * 100)}'i olmalı
5. edges'de label opsiyonel ama açıklayıcı olursa daha iyi
6. Tüm metinler Türkçe`;

    const parsedData = await generateCreativeMultimodal({ prompt, temperature: 0.6 });

    return {
      ...parsedData,
      id: (parsedData as Record<string, unknown>).id || crypto.randomUUID(),
      activityType: ActivityType.KAVRAM_HARITASI,
    } as unknown as WorksheetData;
  }
}

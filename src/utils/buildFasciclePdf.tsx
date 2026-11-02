import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf, 
  Image,
  Font
} from '@react-pdf/renderer';
import { FascicleDocument, WatermarkSettings } from '../types/fascicle';
import { logError } from '../utils/logger.js';
import { normalizeFascicleContent } from './fascicleContentNormalizer';

// Disleksi dostu Lexend fontunu yükleme
Font.register({
  family: 'Lexend',
  src: 'https://fonts.gstatic.com/s/lexend/v17/wlpExwSDBrG-Xf6V63B7.ttf',
});

// A4 tasarımı stilleri
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 35,
    fontFamily: 'Lexend',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  watermarkText: {
    fontSize: 48,
    color: '#f8fafc',
    opacity: 0.06,
    transform: 'rotate(-45deg)',
    fontFamily: 'Lexend',
    fontWeight: 'bold',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 15,
  },
  coverMeta: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginTop: 20,
  },
  sectionHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#4f46e5',
    paddingBottom: 8,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionBadge: {
    fontSize: 9,
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  instructionBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
    padding: 10,
    marginBottom: 16,
    borderRadius: 4,
  },
  instructionText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.4,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 6,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemBody: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.4,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  teacherNote: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f5f3ff',
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
    borderRadius: 4,
  },
  teacherNoteTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#5b21b6',
    marginBottom: 3,
  },
  teacherNoteText: {
    fontSize: 9,
    color: '#6d28d9',
  }
});

interface BuildPdfOptions {
  fascicle: FascicleDocument;
  watermarkText?: string;
  watermarkSettings?: WatermarkSettings;
  qrUrl?: string;
}

const FasciclePdfDoc: React.FC<BuildPdfOptions> = ({ fascicle, watermarkText, watermarkSettings, qrUrl }) => {
  const ws = watermarkSettings || (watermarkText ? { enabled: true, type: 'text' as const, text: watermarkText, opacity: 6, color: '#f8fafc', fontSize: 48, rotation: -45 } : undefined);
  const showWatermark = ws?.enabled;
  const meta = fascicle.metadata;
  
  const qrImageSrc = qrUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`
    : null;

  return (
    <Document title={meta.title || 'bdmind Özel Eğitim Fasikülü'}>
      {/* 1. Kapak Sayfası */}
      <Page size="A4" style={styles.page}>
         {showWatermark && (
            <View style={{ ...styles.watermarkContainer, opacity: (ws?.opacity ?? 6) / 100 }}>
               <Text style={{ ...styles.watermarkText, fontSize: ws?.fontSize ?? 48, color: ws?.color ?? '#f8fafc' }}>{ws?.text || 'bdmind'}</Text>
            </View>
         )}

         <View>
           <Text style={styles.coverTitle}>{meta.title || 'Özel Eğitim Fasikülü'}</Text>
           <Text style={styles.coverMeta}>
              Profil Desteği: {meta.targetProfile === 'all' ? 'Tüm Özel Öğrenme' : meta.targetProfile.toUpperCase()}
           </Text>
           <Text style={styles.coverMeta}>Hedef Yaş Grubu: {meta.targetAgeGroup} Yaş</Text>
           <Text style={styles.coverMeta}>Tahmini Tamamlama Süresi: ~{meta.estimatedDurationMin || 40} Dakika</Text>
         </View>

         {qrImageSrc && meta.qrEnabled && (
           <View style={{ position: 'absolute', bottom: 50, right: 35, alignItems: 'center' }}>
              <Image src={qrImageSrc} style={styles.qrCode} />
              <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>Dijital İnteraktif Çözüm</Text>
           </View>
         )}

         {fascicle.executiveSummary && (
           <View style={{ marginTop: 60, padding: 16, backgroundColor: '#f8fafc', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#3b82f6' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 }}>Öğretmen & Veli Özeti</Text>
              <Text style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>{fascicle.executiveSummary}</Text>
           </View>
         )}

         <View style={styles.pageNumber}>
            <Text>bdmind EdTech Platformu</Text>
            <Text>Kapak</Text>
         </View>
      </Page>

      {/* 2. İçerik Sayfaları (Gerçek Veri Rendering - Normalizer Destekli) */}
      {fascicle.items.map((item, idx) => {
        const normalized = normalizeFascicleContent(item as any, 1);
        const normData = (normalized.data || {}) as Record<string, any>;
        const rawContent = (item.content as Record<string, any>) || {};

        const contentTitle = normData.title || rawContent.title || rawContent.pageConfig?.title || `Bölüm ${idx + 1}: ${item.type.replace(/_/g, ' ')}`;
        const contentInstruction = normData.instruction || rawContent.instruction || rawContent.description || 'Aşağıdaki yönergeleri takip ederek etkinliği tamamlayınız.';
        const dataItems = Array.isArray(normData.sorular)
          ? normData.sorular
          : Array.isArray(normData.items)
          ? normData.items
          : Array.isArray(rawContent.data)
          ? rawContent.data
          : [];
        const pedagogicalNote = normData.pedagogicalNote || rawContent.pedagogicalNote;

        return (
          <Page key={item.id} size="A4" style={styles.page}>
            {showWatermark && (
              <View style={{ ...styles.watermarkContainer, opacity: (ws?.opacity ?? 6) / 100 }}>
                <Text style={{ ...styles.watermarkText, fontSize: ws?.fontSize ?? 48, color: ws?.color ?? '#f8fafc' }}>{ws?.text || 'bdmind'}</Text>
              </View>
            )}

            {/* Bölüm Başlığı & Zorluk Rozeti */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{contentTitle}</Text>
              <Text style={styles.sectionBadge}>{item.difficulty} Seviye</Text>
            </View>

            {/* Yönerge Kutusu */}
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>Yönerge: {contentInstruction}</Text>
            </View>
            
            {/* Aktivite İçeriği */}
            <View style={styles.contentContainer}>
              {dataItems.length > 0 ? (
                dataItems.slice(0, 5).map((d: any, dIdx: number) => (
                  <View key={dIdx} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>
                      {d.title || d.question || d.soruMetni || d.sentence || `Soru / Görev ${dIdx + 1}`}
                    </Text>
                    {d.instruction && <Text style={styles.itemBody}>{d.instruction}</Text>}
                    {d.options && Array.isArray(d.options) && (
                      <View style={{ marginTop: 4 }}>
                        {d.options.map((opt: string, oIdx: number) => (
                          <Text key={oIdx} style={{ fontSize: 9, color: '#64748b', marginVertical: 1 }}>
                            {String.fromCharCode(65 + oIdx)}) {opt}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.itemCard}>
                  <Text style={styles.itemTitle}>Bireysel Öğrenme & Etkinlik Alanı</Text>
                  <Text style={styles.itemBody}>
                    Bu sayfadaki alıştırmaları öğrencinin kendi hızında, somut materyaller ve bireysel rehberlikle tamamlaması önerilir.
                  </Text>
                </View>
              )}

              {/* Pedagojik Öğretmen Notu */}
              {pedagogicalNote && (
                <View style={styles.teacherNote}>
                  <Text style={styles.teacherNoteTitle}>Öğretmene Nöro-Pedagojik Not</Text>
                  <Text style={styles.teacherNoteText}>{pedagogicalNote}</Text>
                </View>
              )}
            </View>

            {/* Sayfa Alt Bilgisi */}
            <View style={styles.pageNumber}>
              <Text>{meta.title || 'bdmind Özel Eğitim'}</Text>
              <Text>Sayfa {idx + 1}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export const buildFasciclePdfBlob = async (options: BuildPdfOptions): Promise<Blob> => {
  try {
     const doc = <FasciclePdfDoc {...options} />;
     const pdfStream = await pdf(doc as any).toBlob();
     return pdfStream;
   } catch (error) {
      logError("PDF Generate Error: " + String(error));
      throw error;
   }
};

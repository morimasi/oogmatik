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
import { FascicleDocument, FascicleItem } from '../types/fascicle';

// Disleksi dostu Lexend fontunu yükleme (Vercel'deki static klasörde varsayılarak veya Google API'den)
Font.register({
  family: 'Lexend',
  src: 'https://fonts.gstatic.com/s/lexend/v17/wlpExwSDBrG-Xf6V63B7.ttf',
});

// A4 tasarımı stilleri
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
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
    fontSize: 60,
    color: '#e2e8f0',
    opacity: 0.3,
    transform: 'rotate(-45deg)',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 150,
    marginBottom: 20,
  },
  coverMeta: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 10,
  },
  qrCode: {
    width: 60,
    height: 60,
    marginTop: 20,
  },
  sectionHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
  },
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  teacherNote: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eef2ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  teacherNoteTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3730a3',
    marginBottom: 5,
  },
  teacherNoteText: {
    fontSize: 11,
    color: '#4338ca',
  }
});

interface BuildPdfOptions {
  fascicle: FascicleDocument;
  watermarkText?: string;
  qrUrl?: string; // Tıklanınca açılacak url, buna göre QR üretilecek
}

const FasciclePdfDoc: React.FC<BuildPdfOptions> = ({ fascicle, watermarkText, qrUrl }) => {
  const meta = fascicle.metadata;
  
  // Free QR generator API for digital transformation
  const qrImageSrc = qrUrl 
    ? \`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(qrUrl)}\`
    : null;

  return (
    <Document title={meta.title}>
      {/* Kapak Sayfası */}
      <Page size="A4" style={styles.page}>
         {watermarkText && (
            <View style={styles.watermarkContainer}>
               <Text style={styles.watermarkText}>{watermarkText}</Text>
            </View>
         )}

         <View>
           <Text style={styles.coverTitle}>{meta.title || 'Yeni Fasikül'}</Text>
           <Text style={styles.coverMeta}>
              Profil: {meta.targetProfile === 'all' ? 'Genel Eğitim' : meta.targetProfile.toUpperCase()}
           </Text>
           <Text style={styles.coverMeta}>Hedef Yaş: {meta.targetAgeGroup}</Text>
           <Text style={styles.coverMeta}>Süre: {meta.estimatedDurationMin} Dk</Text>
         </View>

         {qrImageSrc && meta.qrEnabled && (
           <View style={{ position: 'absolute', bottom: 50, right: 50, alignItems: 'center' }}>
              <Image src={qrImageSrc} style={styles.qrCode} />
              <Text style={{ fontSize: 8, color: '#64748b', marginTop: 5 }}>Dijital Çözüm</Text>
           </View>
         )}

         {fascicle.executiveSummary && (
           <View style={{ marginTop: 100, padding: 20, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 }}>Özet</Text>
              <Text style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>{fascicle.executiveSummary}</Text>
           </View>
         )}
      </Page>

      {/* İçerik Sayfaları */}
      {fascicle.items.map((item, idx) => (
        <Page key={item.id} size="A4" style={styles.page}>
           {watermarkText && (
            <View style={styles.watermarkContainer}>
               <Text style={styles.watermarkText}>{watermarkText}</Text>
            </View>
           )}

           <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Bölüm {idx + 1}: {item.type}</Text>
           </View>
           
           <View style={styles.contentPlaceholder}>
              <Text style={{ fontSize: 16, color: '#94a3b8' }}>İçerik Render Ediliyor...</Text>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 5 }}>({item.difficulty} Seviyesi)</Text>
           </View>

           {item.pedagogicalNote && (
              <View style={styles.teacherNote}>
                 <Text style={styles.teacherNoteTitle}>Pedagojik Not</Text>
                 <Text style={styles.teacherNoteText}>{item.pedagogicalNote}</Text>
              </View>
           )}

           <Text style={styles.pageNumber} render={({ pageNumber }) => \`Sayfa \${pageNumber}\`} fixed />
        </Page>
      ))}
    </Document>
  );
};

/**
 * Bu fonksiyon, bir fasikülü arka planda blob (ya da base64) pdf dosyasına dönüştürür.
 */
export const buildFasciclePdfBlob = async (options: BuildPdfOptions): Promise<Blob> => {
  try {
     const doc = React.createElement(FasciclePdfDoc, options);
     const pdfStream = await pdf(doc).toBlob();
     return pdfStream;
  } catch (error) {
     console.error("PDF Generate Error", error);
     throw error;
  }
};

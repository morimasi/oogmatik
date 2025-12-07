
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path, Rect, Circle, Polygon, Line } from '@react-pdf/renderer';
import { ActivityType, WorkbookSettings, CollectionItem, SavedAssessment, AssessmentReport, StyleSettings } from '../../types';
import { ACTIVITIES } from '../../constants';

// --- FONT REGISTRATION ---
// Using standard fonts for reliability in browser build.
// In a real production build, we would import .ttf files.
Font.register({
  family: 'OpenDyslexic',
  src: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.woff'
});

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40, // ~10mm +
    fontFamily: 'Roboto'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000'
  },
  instruction: {
    fontSize: 12,
    color: '#444',
    marginTop: 5,
    fontStyle: 'italic'
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    fontSize: 10,
    color: '#666',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 2
  },
  contentContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  // Specific Activity Styles
  textBlock: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 10
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  gridCell: {
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  questionBlock: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5
  }
});

// --- HELPER COMPONENTS ---

const Header = ({ title, instruction }: { title: string, instruction?: string }) => (
  <View style={styles.header}>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}
    </View>
  </View>
);

const StudentStrip = ({ settings }: { settings: any }) => (
  <View style={styles.studentInfo}>
    <Text>Ad Soyad: _______________________</Text>
    <Text>Tarih: ________________</Text>
  </View>
);

const Footer = ({ pageNumber, text = "Bursa Disleksi AI" }: { pageNumber: number, text?: string }) => (
  <View style={styles.footer}>
    <Text>{text}</Text>
    <Text>{pageNumber}</Text>
  </View>
);

// --- ACTIVITY RENDERERS ---

const StoryRenderer = ({ data }: { data: any }) => (
  <View>
    <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
      <Text style={[styles.textBlock, { fontSize: 14 }]}>{data.story}</Text>
    </View>
    
    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>SORULAR</Text>
    {data.questions?.map((q: any, i: number) => (
      <View key={i} style={styles.questionBlock}>
        <Text style={{ fontSize: 11, marginBottom: 5 }}>{i + 1}. {q.question || q.text}</Text>
        {q.options && (
          <View style={{ marginLeft: 10 }}>
            {q.options.map((opt: string, j: number) => (
              <Text key={j} style={{ fontSize: 10, color: '#333' }}>
                {String.fromCharCode(65 + j)}) {opt}
              </Text>
            ))}
          </View>
        )}
        {q.type === 'open-ended' && (
           <View style={{ marginTop: 5, borderBottomWidth: 1, borderBottomColor: '#ccc', height: 20 }}></View>
        )}
      </View>
    ))}
  </View>
);

const GridRenderer = ({ data, type }: { data: any, type: string }) => {
  // Logic for Word Search, Sudoku, etc.
  const grid = data.grid;
  if (!grid || !Array.isArray(grid)) return <Text>Grid verisi bulunamadı.</Text>;

  const rows = grid.length;
  const cols = grid[0]?.length || 1;
  const cellSize = Math.min(30, 500 / cols);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#000' }}>
        {grid.map((row: any[], r: number) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((cell: any, c: number) => (
              <View key={c} style={{ 
                width: cellSize, 
                height: cellSize, 
                borderRightWidth: 1, 
                borderBottomWidth: 1, 
                borderColor: '#000',
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Text style={{ fontSize: cellSize * 0.6 }}>{cell || ''}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      
      {data.words && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 10 }}>
          {data.words.map((w: string, i: number) => (
            <Text key={i} style={{ fontSize: 10, padding: 3, backgroundColor: '#eee' }}>{w}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const MathListRenderer = ({ data }: { data: any }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
    {(data.operations || data.problems || []).map((op: any, i: number) => (
      <View key={i} style={{ width: '45%', marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
          {op.text || `${op.num1} ${op.operator} ${op.num2} = ?`}
        </Text>
        <View style={{ marginTop: 15, borderBottomWidth: 1, borderBottomColor: '#000', width: '50%', alignSelf: 'center' }}></View>
      </View>
    ))}
  </View>
);

const UniversalActivityRenderer = ({ item }: { item: CollectionItem }) => {
  const { activityType, data } = item;
  
  // Choose renderer based on data shape or activity type
  if (data.story) return <StoryRenderer data={data} />;
  if (data.grid) return <GridRenderer data={data} type={activityType} />;
  if (data.operations || data.problems) return <MathListRenderer data={data} />;
  
  // Fallback: Dump key text fields
  return (
    <View>
      {Object.entries(data).map(([k, v]) => {
        if (typeof v === 'string' && v.length > 0 && k !== 'imageBase64') {
           return <Text key={k} style={{ fontSize: 10, marginBottom: 5 }}>{v}</Text>
        }
        return null;
      })}
      <Text style={{ color: '#999', fontSize: 10, marginTop: 20 }}>
        * Bu etkinlik PDF motoru ile otomatik oluşturulmuştur.
      </Text>
    </View>
  );
};

// --- WORKBOOK (MULTI-PAGE) ---

export const PDFWorkbookDocument = ({ items, settings }: { items: CollectionItem[], settings: WorkbookSettings }) => {
  const accentColor = settings.accentColor || '#4F46E5';

  return (
    <Document title={settings.title} author="Bursa Disleksi AI" creator="Bursa Disleksi AI">
      
      {/* COVER PAGE */}
      <Page size="A4" style={[styles.page, { justifyContent: 'center', alignItems: 'center', borderLeftWidth: 20, borderLeftColor: accentColor }]}>
        <Text style={{ fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 2 }}>{settings.year}</Text>
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#000', textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
          {settings.title}
        </Text>
        <Text style={{ fontSize: 24, color: '#333' }}>{settings.studentName}</Text>
        <Text style={{ fontSize: 12, color: '#999', marginTop: 100 }}>{settings.schoolName}</Text>
      </Page>

      {/* CONTENT PAGES */}
      {items.map((item, index) => {
        // Handle Assessment Reports specially
        if (item.activityType === 'ASSESSMENT_REPORT') {
           const report = (item.data as SavedAssessment).report;
           return (
             <Page key={item.id} size="A4" style={styles.page}>
               <Header title="DEĞERLENDİRME RAPORU" instruction={settings.studentName} />
               <View style={{ marginBottom: 20 }}>
                 <Text style={{ fontSize: 12, fontWeight: 'bold', color: accentColor }}>GENEL ÖZET</Text>
                 <Text style={styles.textBlock}>{report.overallSummary}</Text>
               </View>
               
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                 <View style={{ width: '48%' }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'green' }}>GÜÇLÜ YÖNLER</Text>
                    {report.analysis.strengths.map((s, k) => <Text key={k} style={{ fontSize: 10 }}>• {s}</Text>)}
                 </View>
                 <View style={{ width: '48%' }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: 'red' }}>GELİŞİM ALANLARI</Text>
                    {report.analysis.weaknesses.map((s, k) => <Text key={k} style={{ fontSize: 10 }}>• {s}</Text>)}
                 </View>
               </View>
               <Footer pageNumber={index + 2} />
             </Page>
           )
        }

        // Handle Standard Worksheets (Array of data, e.g. multiple pages per activity)
        // Ensure data is array
        const pageDataArray = Array.isArray(item.data) ? item.data : [item.data];
        
        return pageDataArray.map((pageData: any, subIndex: number) => (
          <Page key={`${item.id}-${subIndex}`} size="A4" style={styles.page}>
            <Header title={pageData.title || item.title} instruction={pageData.instruction} />
            <StudentStrip settings={settings} />
            
            <View style={styles.contentContainer}>
               <UniversalActivityRenderer item={{...item, data: pageData}} />
            </View>

            <Footer pageNumber={index + 2 + subIndex} text={settings.schoolName || 'Bursa Disleksi AI'} />
          </Page>
        ));
      })}

      {/* BACK COVER */}
      {settings.showBackCover && (
        <Page size="A4" style={[styles.page, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181b' }]}>
           <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>HARİKA İŞ ÇIKARDIN!</Text>
           <Text style={{ fontSize: 12, color: '#ccc', marginTop: 10 }}>www.bursadisleksi.com</Text>
        </Page>
      )}

    </Document>
  );
};

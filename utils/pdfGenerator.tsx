
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { WorksheetData, StyleSettings, SingleWorksheetData, StudentProfile } from '../types';

// Register fonts
Font.register({
  family: 'OpenDyslexic',
  src: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.woff',
});

Font.register({
    family: 'OpenDyslexicBold',
    src: 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-bold.woff',
});

// Standard styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'OpenDyslexic',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'OpenDyslexicBold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  instruction: {
    fontSize: 12,
    marginBottom: 5,
    color: '#333',
  },
  pedagogicalNote: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    fontSize: 10,
  },
  infoField: {
    flexDirection: 'row',
  },
  infoLabel: {
    fontFamily: 'OpenDyslexicBold',
    marginRight: 5,
  },
  content: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  // Generic List Styles
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  listItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
    width: '48%',
  },
  // Grid Styles
  gridContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
});

// A generic renderer that attempts to visualize data based on its shape
const GenericPDFContent = ({ data }: { data: any }) => {
    // 1. Grid (Word Search, etc.)
    if (data.grid && Array.isArray(data.grid) && Array.isArray(data.grid[0])) {
        return (
            <View style={styles.gridContainer}>
                {data.grid.map((row: any[], r: number) => (
                    <View key={r} style={styles.gridRow}>
                        {row.map((cell: any, c: number) => (
                            <View key={c} style={styles.gridCell}>
                                <Text>{String(cell || '').toUpperCase()}</Text>
                            </View>
                        ))}
                    </View>
                ))}
                
                {data.words && (
                    <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {data.words.map((w: string, i: number) => (
                            <Text key={i} style={{ fontSize: 10, border: '1px solid #ccc', padding: 5, borderRadius: 3 }}>
                                {w}
                            </Text>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // 2. Math Operations
    if (data.operations && Array.isArray(data.operations)) {
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                {data.operations.map((op: any, i: number) => (
                    <View key={i} style={{ width: '22%', marginBottom: 20, alignItems: 'flex-end', fontSize: 16 }}>
                        <Text>{op.num1}</Text>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', width: '100%', justifyContent: 'space-between' }}>
                            <Text>{op.operator}</Text>
                            <Text>{op.num2}</Text>
                        </View>
                        <Text style={{ marginTop: 5, color: '#ccc' }}>{op.answer}</Text>
                    </View>
                ))}
            </View>
        );
    }
    
    // 3. Simple Lists (Anagrams, etc)
    if (data.anagrams) {
         return (
             <View style={styles.listContainer}>
                 {data.anagrams.map((item: any, i: number) => (
                     <View key={i} style={styles.listItem}>
                         <Text style={{fontSize: 14, fontFamily: 'OpenDyslexicBold'}}>{item.scrambled}</Text>
                         <View style={{borderBottomWidth: 1, borderBottomColor: '#000', marginTop: 15, width: '100%'}}></View>
                     </View>
                 ))}
             </View>
         );
    }

    // 4. Questions (Story)
    if (data.story) {
        return (
            <View>
                <Text style={{ fontSize: 10, lineHeight: 1.8, marginBottom: 20, textAlign: 'justify' }}>
                    {data.story}
                </Text>
                {data.questions && data.questions.map((q: any, i: number) => (
                    <View key={i} style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'OpenDyslexicBold', marginBottom: 5 }}>
                            {i+1}. {q.question || q.statement}
                        </Text>
                        {q.type === 'multiple-choice' && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {q.options.map((opt: string, k: number) => (
                                    <Text key={k} style={{ fontSize: 10, border: '1px solid #ccc', padding: 5, borderRadius: 5 }}>
                                        {String.fromCharCode(65+k)}) {opt}
                                    </Text>
                                ))}
                            </View>
                        )}
                        {q.type === 'open-ended' && (
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', height: 20, width: '100%' }}></View>
                        )}
                    </View>
                ))}
            </View>
        );
    }

    // Fallback: Dump text keys if nothing else matches
    return (
        <View>
            <Text style={{fontSize: 10, color: '#666', fontStyle: 'italic'}}>
                Bu etkinlik henüz PDF için optimize edilmemiştir. Genel görünüm:
            </Text>
            {Object.keys(data).filter(k => typeof data[k] === 'string').map(k => (
                <Text key={k} style={{fontSize: 10, marginVertical: 2}}>{k}: {String(data[k])}</Text>
            ))}
        </View>
    );
};

export const PDFWorkbook = ({ data, settings, studentProfile }: { data: WorksheetData, settings: StyleSettings, studentProfile?: StudentProfile }) => (
  <Document title={data.length > 0 ? data[0].title : "Çalışma Sayfası"}>
    {data.map((page, i) => (
      <Page key={i} size={settings.orientation === 'landscape' ? 'A4_LANDSCAPE' : 'A4'} style={styles.page}>
         {/* Student Header */}
         {settings.showStudentInfo && (
             <View style={styles.studentInfo}>
                 <View style={styles.infoField}>
                     <Text style={styles.infoLabel}>Ad Soyad:</Text>
                     <Text>{studentProfile?.name || '................................'}</Text>
                 </View>
                 <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Tarih:</Text>
                    <Text>{studentProfile?.date || '..../..../.......'}</Text>
                 </View>
             </View>
         )}

         {/* Activity Header */}
         <View style={styles.header}>
             {settings.showTitle && <Text style={styles.title}>{page.title}</Text>}
             {settings.showInstruction && page.instruction && <Text style={styles.instruction}>{page.instruction}</Text>}
         </View>

         {/* Main Content */}
         <View style={styles.content}>
             <GenericPDFContent data={page} />
         </View>
         
         {/* Footer */}
         {settings.showFooter && (
             <View style={styles.footer}>
                 <Text>Bursa Disleksi AI - Özel Eğitim Materyali - Sayfa {i+1}</Text>
                 {settings.showPedagogicalNote && page.pedagogicalNote && (
                     <Text style={{marginTop: 5, fontStyle: 'italic'}}>{page.pedagogicalNote}</Text>
                 )}
             </View>
         )}
      </Page>
    ))}
  </Document>
);

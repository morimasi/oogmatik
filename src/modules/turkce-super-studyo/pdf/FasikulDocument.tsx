import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { TextPassage, Question } from '../types/schemas';

// Disleksi dostu PDF stilleri
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAFAFA', // Kırık beyaz (Göz yormaz)
    padding: 40,
    fontFamily: 'Helvetica', // Demo için standart font. Gerçekte OpenDyslexic register edilmeli.
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#4F46E5', // Indigo-600
  },
  subLogoText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  studentInfo: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  passageBox: {
    backgroundColor: '#FFFDF0', // Krem/Pastel sarı arka plan metin için
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF08A',
    marginBottom: 30,
  },
  passageText: {
    fontSize: 14,
    lineHeight: 1.8, // Disleksi dostu geniş satır aralığı
    color: '#1F2937',
    textAlign: 'left',
  },
  questionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionInstruction: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  mcqOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
  },
  mcqCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    marginRight: 10,
  },
  mcqText: {
    fontSize: 12,
    color: '#374151',
  },
  fillBlankText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 5,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface FasikulDocumentProps {
  studentName?: string;
  passage: TextPassage;
  questions: Question[];
  date?: string;
}

export const FasikulDocument: React.FC<FasikulDocumentProps> = ({
  studentName = '.........................',
  passage,
  questions,
  date = new Date().toLocaleDateString('tr-TR'),
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoText}>Oogmatik</Text>
            <Text style={styles.subLogoText}>Türkçe Süper Stüdyo - Premium Fasikül</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.studentInfo}>Ad Soyad: {studentName}</Text>
            <Text style={styles.studentInfo}>Tarih: {date}</Text>
          </View>
        </View>

        {/* Title & Passage */}
        <Text style={styles.title}>{passage.title}</Text>
        <View style={styles.passageBox}>
          <Text style={styles.passageText}>{passage.content}</Text>
        </View>

        {/* Questions */}
        {questions.map((q, index) => (
          <View key={q.id} style={styles.questionContainer} wrap={false}>
            <Text style={styles.questionInstruction}>
              Soru {index + 1}: {q.instruction}
            </Text>

            {q.type === 'MCQ' &&
              (q as any).options.map((opt: any, oIdx: number) => (
                <View key={opt.id} style={styles.mcqOption}>
                  <View style={styles.mcqCircle}></View>
                  <Text style={styles.mcqText}>
                    {String.fromCharCode(65 + oIdx)}) {opt.text}
                  </Text>
                </View>
              ))}

            {q.type === 'FILL_BLANK' && (
              <Text style={styles.fillBlankText}>
                {(q as any).template.replace(/\{blank_\d+\}/g, '.........................')}
              </Text>
            )}

            {q.type === 'DRAG_DROP' && (
              <Text style={styles.fillBlankText}>
                (Bu soruyu çözerken sıralamayı yanındaki kutulara numaralandırarak yapınız.)
                {'\n\n'}
                {(q as any).items.map((item: any) => `[  ] ${item.content}`).join('\n')}
              </Text>
            )}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Oogmatik Yapay Zeka ile Disleksi Dostu Olarak Üretilmiştir.</Text>
          <Text render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

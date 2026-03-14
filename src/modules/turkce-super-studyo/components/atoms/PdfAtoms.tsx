import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Note: In a real app, you need to register the specific Dyslexic fonts via URL or local path.
// Font.register({ family: 'OpenDyslexic', src: '/fonts/OpenDyslexic-Regular.otf' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFDF0', // Cream/Pastel Yellow
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 12,
    color: '#6B7280',
    // fontFamily: 'OpenDyslexic',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
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
  },
  guidedText: {
    fontSize: 16,
    lineHeight: 2.0, // Minimum 1.5, preferably 1.75 or 2.0 for dyslexia
    letterSpacing: 2, // 10-20% wider
    color: '#1F2937', // Dark gray instead of pure black
    marginBottom: 10,
  },
});

export const DyslexicPage = ({
  children,
  pageNumber,
  title,
}: {
  children: React.ReactNode;
  pageNumber?: number;
  title?: string;
}) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.logoText}>Oogmatik Süper Stüdyo</Text>
      <Text style={styles.headerText}>{title || 'Çalışma Kağıdı'}</Text>
    </View>

    <View style={{ flex: 1 }}>{children}</View>

    <View style={styles.footer} fixed>
      <Text>Ad Soyad: ........................</Text>
      <Text render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
    </View>
  </Page>
);

export const GuidedText = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.guidedText}>{children}</Text>
);

export const SyllableBox = ({ word, syllables }: { word: string; syllables: string[] }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
    {syllables.map((syl, i) => (
      <Text
        key={i}
        style={[
          styles.guidedText,
          { color: i % 2 === 0 ? '#DC2626' : '#2563EB', marginRight: 2 }, // Alternating Red/Blue
        ]}
      >
        {syl}
      </Text>
    ))}
  </View>
);

// Wrapper for the whole document
export const DyslexicDocument = ({ children }: { children: React.ReactNode }) => (
  <Document>{children}</Document>
);

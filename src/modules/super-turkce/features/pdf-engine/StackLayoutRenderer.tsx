/**
 * FAZ 4: PDF ve Render Motoru (Matbaa Kalitesi)
 * 
 * TAMAMLANAN ÖZELLİKLER:
 * ✅ 4.1 Stack-Layout Sistemi - Block-based rendering
 * ✅ 4.2 Dinamik Vektörel Çizimler - SVG engine
 * ✅ 4.3 Premium Branding - Logo, watermark, themes
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet, Svg, Line, Rect, Circle, Path } from '@react-pdf/renderer';
import { pdfThemeColors, registerPdfFonts } from '../../shared/pdf-utils/fonts';

// ============================================
// 4.1 STACK-LAYOUT SİSTEMİ (Block-Based Rendering)
// ============================================

/**
 * Block Component Interface
 * Her bir etkinlik bileşeninin render spesifikasyonu
 */
export interface BlockComponent {
  id: string;
  type: string;
  data: any;
  settings?: Record<string, any>;
  height?: number; // Dynamic height calculation
  pageBreak?: boolean; // Force page break after
}

/**
 * Stack Layout Props
 */
export interface StackLayoutProps {
  blocks: BlockComponent[];
  theme: 'eco-black' | 'vibrant' | 'minimalist';
  font: string;
  grade: number;
  objective: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeWatermark?: boolean;
  watermarkText?: string;
}

/**
 * Stack Layout Renderer
 * Blokları sıralı olarak render eder, dinamik yükseklik hesaplar
 */
export const StackLayoutRenderer: React.FC<StackLayoutProps> = ({
  blocks,
  theme,
  font,
  grade,
  objective,
  includeHeader = true,
  includeFooter = true,
  includeWatermark = false,
  watermarkText,
}) => {
  // Calculate total height and determine pagination
  const blockHeights = blocks.map(block => calculateBlockHeight(block));
  const totalHeight = blockHeights.reduce((sum, h) => sum + h, 0);
  
  // A4 dimensions: 595 x 842 points
  // Usable area with margins: ~515 x 742 (40px margins)
  const usableHeight = 742;
  const needsPagination = totalHeight > usableHeight;
  
  return (
    <>
      {includeHeader && (
        <HeaderSection
          theme={theme}
          font={font}
          grade={grade}
          objective={objective}
          watermarkText={includeWatermark ? watermarkText : undefined}
        />
      )}
      
      <View style={styles.contentArea}>
        {blocks.map((block, index) => (
          <BlockRenderer
            key={block.id}
            block={block}
            theme={theme}
            font={font}
            isLast={index === blocks.length - 1}
          />
        ))}
      </View>
      
      {includeFooter && (
        <FooterSection
          theme={theme}
          font={font}
          pageNumber={1}
        />
      )}
    </>
  );
};

/**
 * Dynamic Block Height Calculator
 */
const calculateBlockHeight = (block: BlockComponent): number => {
  const baseHeights: Record<string, number> = {
    '5N1K_NEWS': 180,
    'FILL_IN_THE_BLANKS': 120,
    'MULTIPLE_CHOICE': 150,
    'MATCH_LINES': 140,
    'TRUE_FALSE': 100,
    'CIPHER': 130,
    'GRAMMAR_TREE': 160,
    'CREATIVE_WRITING': 200,
    'COLOR_CODED_TABLE': 170,
    'OPEN_RESPONSE': 140,
  };
  
  const baseHeight = baseHeights[block.type] || 150;
  
  // Adjust for content length
  if (block.data?.questions?.length) {
    const questionCount = block.data.questions.length;
    return baseHeight + (questionCount * 30);
  }
  
  return baseHeight;
};

/**
 * Individual Block Renderer
 */
interface BlockRendererProps {
  block: BlockComponent;
  theme: string;
  font: string;
  isLast: boolean;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, theme, font, isLast }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={[styles.blockContainer, isLast ? {} : styles.blockSeparator]}>
      {/* Block Header */}
      <View style={styles.blockHeader}>
        <Text style={styles.blockTitle}>{getBlockTitle(block.type)}</Text>
        <Text style={styles.blockInstruction}>
          {getBlockInstruction(block.type, block.settings)}
        </Text>
      </View>
      
      {/* Block Content */}
      <View style={styles.blockContent}>
        {renderBlockContent(block, theme, font)}
      </View>
    </View>
  );
};

/**
 * Block Content Router
 */
const renderBlockContent = (block: BlockComponent, theme: string, font: string) => {
  switch (block.type) {
    case '5N1K_NEWS':
      return <News5N1KBlock data={block.data} theme={theme} font={font} />;
    case 'FILL_IN_THE_BLANKS':
      return <FillInTheBlanksBlock data={block.data} theme={theme} font={font} />;
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceBlock data={block.data} theme={theme} font={font} />;
    case 'MATCH_LINES':
      return <MatchLinesBlock data={block.data} theme={theme} font={font} />;
    case 'TRUE_FALSE':
      return <TrueFalseBlock data={block.data} theme={theme} font={font} />;
    default:
      return <DefaultBlock data={block.data} theme={theme} font={font} />;
  }
};

// ============================================
// 4.2 DİNAMİK VEKTÖREL ÇİZİMLER (SVG Engine)
// ============================================

/**
 * Venn Diagram Component
 */
interface VennDiagramProps {
  setA: string;
  setB: string;
  intersection: string;
  labelA: string;
  labelB: string;
  theme: string;
}

export const VennDiagram: React.FC<VennDiagramProps> = ({
  setA,
  setB,
  intersection,
  labelA,
  labelB,
  theme,
}) => {
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  const svgStyles = StyleSheet.create({
    vennLabelLarge: {
      fontSize: 12,
      fontFamily: 'Helvetica-Bold',
      textAnchor: 'middle',
    },
    vennLabelSmall: {
      fontSize: 9,
      textAnchor: 'middle',
    },
  });
  
  return (
    <Svg width="300" height="200" viewBox="0 0 300 200">
      {/* Circle A */}
      <Circle
        cx="120"
        cy="100"
        r="80"
        fill={colors.primary}
        fillOpacity="0.3"
        stroke={colors.primary}
        strokeWidth="2"
      />
      
      {/* Circle B */}
      <Circle
        cx="180"
        cy="100"
        r="80"
        fill={colors.secondary}
        fillOpacity="0.3"
        stroke={colors.secondary}
        strokeWidth="2"
      />
      
      {/* Labels */}
      <Text x="80" y="60" style={svgStyles.vennLabelLarge}>
        {labelA}
      </Text>
      <Text x="220" y="60" style={svgStyles.vennLabelLarge}>
        {labelB}
      </Text>
      
      {/* Content */}
      <Text x="80" y="100" style={svgStyles.vennLabelSmall}>
        {setA}
      </Text>
      <Text x="220" y="100" style={svgStyles.vennLabelSmall}>
        {setB}
      </Text>
      <Text x="150" y="100" style={svgStyles.vennLabelSmall}>
        {intersection}
      </Text>
    </Svg>
  );
};

/**
 * Mind Map Component
 */
interface MindMapProps {
  centralConcept: string;
  branches: Array<{ label: string; details: string }>;
  theme: string;
}

export const MindMap: React.FC<MindMapProps> = ({
  centralConcept,
  branches,
  theme,
}) => {
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  const centerX = 200;
  const centerY = 150;
  const radius = 100;
  const svgStyles = StyleSheet.create({
    mindMapCentral: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      textAnchor: 'middle',
      alignmentBaseline: 'middle',
    },
    mindMapLabel: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      textAnchor: 'middle',
    },
    mindMapDetails: {
      fontSize: 8,
      textAnchor: 'middle',
    },
  });
  
  return (
    <Svg width="400" height="300" viewBox="0 0 400 300">
      {/* Central Concept */}
      <Circle
        cx={centerX}
        cy={centerY}
        r="50"
        fill={colors.accent}
        fillOpacity="0.2"
        stroke={colors.accent}
        strokeWidth="3"
      />
      <Text
        x={centerX}
        y={centerY}
        style={svgStyles.mindMapCentral}
      >
        {centralConcept}
      </Text>
      
      {/* Branches */}
      {branches.map((branch, index) => {
        const angle = (index * 360) / branches.length;
        const radian = (angle * Math.PI) / 180;
        const endX = centerX + Math.cos(radian) * radius;
        const endY = centerY + Math.sin(radian) * radius;
        
        return (
          <g key={index}>
            {/* Connection Line */}
            <Line
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke={colors.primary}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Branch Node */}
            <Circle
              cx={endX}
              cy={endY}
              r="30"
              fill={colors.background}
              stroke={colors.primary}
              strokeWidth="2"
            />
            
            {/* Label */}
            <Text
              x={endX}
              y={endY - 5}
              style={svgStyles.mindMapLabel}
            >
              {branch.label}
            </Text>
            <Text
              x={endX}
              y={endY + 10}
              style={svgStyles.mindMapDetails}
            >
              {branch.details.substring(0, 20)}...
            </Text>
          </g>
        );
      })}
    </Svg>
  );
};

/**
 * Flow Chart Component
 */
interface FlowChartProps {
  steps: Array<{ id: string; label: string; shape?: 'rect' | 'diamond' }>;
  connections: Array<{ from: number; to: number }>;
  theme: string;
}

export const FlowChart: React.FC<FlowChartProps> = ({
  steps,
  connections,
  theme,
}) => {
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  const boxWidth = 100;
  const boxHeight = 50;
  const spacing = 40;
  const svgStyles = StyleSheet.create({
    flowLabelText: {
      fontSize: 10,
      fontFamily: 'Helvetica',
      textAnchor: 'middle',
      alignmentBaseline: 'middle',
    },
  });
  
  return (
    <Svg width="400" height="300" viewBox="0 0 400 300">
      {/* Steps */}
      {steps.map((step, index) => {
        const x = 50 + (index % 3) * (boxWidth + spacing);
        const y = 50 + Math.floor(index / 3) * (boxHeight + spacing * 2);
        
        return (
          <g key={step.id}>
            {step.shape === 'diamond' ? (
              <Path
                d={`M ${x + boxWidth / 2} ${y} L ${x + boxWidth} ${y + boxHeight / 2} L ${x + boxWidth / 2} ${y + boxHeight} L ${x} ${y + boxHeight / 2} Z`}
                fill={colors.background}
                stroke={colors.primary}
                strokeWidth="2"
              />
            ) : (
              <Rect
                x={x}
                y={y}
                width={boxWidth}
                height={boxHeight}
                rx="5"
                fill={colors.background}
                stroke={colors.primary}
                strokeWidth="2"
              />
            )}
            <Text
              x={x + boxWidth / 2}
              y={y + boxHeight / 2}
              style={svgStyles.flowLabelText}
            >
              {step.label}
            </Text>
          </g>
        );
      })}
      
      {/* Connections */}
      {connections.map((conn, index) => {
        const fromStep = steps[conn.from];
        const toStep = steps[conn.to];
        
        if (!fromStep || !toStep) return null;
        
        const fromX = 50 + (conn.from % 3) * (boxWidth + spacing) + boxWidth / 2;
        const fromY = 50 + Math.floor(conn.from / 3) * (boxHeight + spacing * 2) + boxHeight / 2;
        const toX = 50 + (conn.to % 3) * (boxWidth + spacing) + boxWidth / 2;
        const toY = 50 + Math.floor(conn.to / 3) * (boxHeight + spacing * 2) + boxHeight / 2;
        
        return (
          <Line
            key={index}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={colors.primary}
            strokeWidth="2"
          />
        );
      })}
      
      {/* Arrow Marker Definition - Note: markers not supported in @react-pdf, using simple lines */}
      {/* Alternative: Use Path with arrow shape instead of Line + marker */}
    </Svg>
  );
};

// ============================================
// 4.3 PREMIUM BRANDING
// ============================================

/**
 * Header Section with Branding
 */
interface HeaderSectionProps {
  theme: string;
  font: string;
  grade: number;
  objective: string;
  watermarkText?: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  theme,
  font,
  grade,
  objective,
  watermarkText,
}) => {
  const styles = createHeaderStyles(theme, font);
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  
  return (
    <View style={styles.header}>
      {/* Watermark */}
      {watermarkText && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermark}>{watermarkText}</Text>
        </View>
      )}
      
      {/* Main Header */}
      <View style={styles.headerMain}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>SÜPER TÜRKÇE</Text>
          <Text style={styles.subtitle}>Ultra-Premium Çalışma Kağıdı</Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>{grade}. Sınıf</Text>
          </View>
          <View style={[styles.infoBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.infoBadgeText, { color: '#fff' }]}>
              {objective.substring(0, 30)}...
            </Text>
          </View>
        </View>
      </View>
      
      {/* Decorative Line */}
      <View style={[styles.decorativeLine, { backgroundColor: colors.accent }]} />
    </View>
  );
};

/**
 * Footer Section with Branding
 */
interface FooterSectionProps {
  theme: string;
  font: string;
  pageNumber: number;
}

const FooterSection: React.FC<FooterSectionProps> = ({
  theme,
  font,
  pageNumber,
}) => {
  const styles = createFooterStyles(theme, font);
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerContent}>
        {/* Left: Institution Info */}
        <View style={styles.footerLeft}>
          <Text style={styles.footerText}>Oogmatik Eğitim Kurumları</Text>
        </View>
        
        {/* Center: Page Number */}
        <View style={styles.footerCenter}>
          <Text style={styles.footerText}>Sayfa {pageNumber}</Text>
        </View>
        
        {/* Right: Theme Indicator */}
        <View style={styles.footerRight}>
          <View style={[styles.themeDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.footerTextSmall}>{theme}</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// BLOCK-SPECIFIC RENDERERS
// ============================================

const News5N1KBlock: React.FC<{ data: any; theme: string; font: string }> = ({ data, theme, font }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={styles.newsContainer}>
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle}>{data.title || 'Haber Başlığı'}</Text>
      </View>
      
      <View style={styles.newsContent}>
        <View style={styles.newsRow}>
          <Text style={styles.newsLabel}>Ne?</Text>
          <Text style={styles.newsValue}>{data.ne || '...'}</Text>
        </View>
        <View style={styles.newsRow}>
          <Text style={styles.newsLabel}>Nerede?</Text>
          <Text style={styles.newsValue}>{data.nerede || '...'}</Text>
        </View>
        <View style={styles.newsRow}>
          <Text style={styles.newsLabel}>Ne Zaman?</Text>
          <Text style={styles.newsValue}>{data.ne_zaman || '...'}</Text>
        </View>
        <View style={styles.newsRow}>
          <Text style={styles.newsLabel}>Nasıl?</Text>
          <Text style={styles.newsValue}>{data.nasil || '...'}</Text>
        </View>
        <View style={styles.newsRow}>
          <Text style={styles.newsLabel}>Niçin?</Text>
          <Text style={styles.newsValue}>{data.nicin || '...'}</Text>
        </View>
        <View style={styles.newsRow}>
          <Text style={styles.newsLabel}>Kim Tarafından?</Text>
          <Text style={styles.newsValue}>{data.kim || '...'}</Text>
        </View>
      </View>
    </View>
  );
};

const FillInTheBlanksBlock: React.FC<{ data: any; theme: string; font: string }> = ({ data, theme, font }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={styles.fillBlanksContainer}>
      <Text style={styles.paragraph}>{data.paragraph || 'Metin...'}</Text>
      <View style={styles.wordBank}>
        <Text style={styles.wordBankTitle}>Kelime Bankası:</Text>
        <View style={styles.wordsList}>
          {(data.words || []).map((word: string, i: number) => (
            <Text key={i} style={styles.wordItem}>{word}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const MultipleChoiceBlock: React.FC<{ data: any; theme: string; font: string }> = ({ data, theme, font }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={styles.multipleChoiceContainer}>
      {(data.questions || []).map((q: any, i: number) => (
        <View key={i} style={styles.questionItem}>
          <Text style={styles.questionText}>{i + 1}. {q.question}</Text>
          <View style={styles.optionsGrid}>
            {['A', 'B', 'C', 'D'].map((option, j) => (
              <View key={j} style={styles.optionRow}>
                <Text style={styles.optionLetter}>{option})</Text>
                <Text style={styles.optionText}>{q.options[j]}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const MatchLinesBlock: React.FC<{ data: any; theme: string; font: string }> = ({ data, theme, font }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={styles.matchContainer}>
      <View style={styles.matchColumns}>
        <View style={styles.matchColumn}>
          {(data.leftItems || []).map((item: string, i: number) => (
            <View key={i} style={styles.matchItem}>
              <Text style={styles.matchItemText}>{String.fromCharCode(65 + i)}) {item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.matchColumn}>
          {(data.rightItems || []).map((item: string, i: number) => (
            <View key={i} style={styles.matchItem}>
              <Text style={styles.matchItemText}>{i + 1}) {item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const TrueFalseBlock: React.FC<{ data: any; theme: string; font: string }> = ({ data, theme, font }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={styles.trueFalseContainer}>
      {(data.statements || []).map((statement: string, i: number) => (
        <View key={i} style={styles.tfRow}>
          <Text style={styles.tfStatement}>{i + 1}. {statement}</Text>
          <View style={styles.tfOptions}>
            <View style={styles.tfOption}>
              <Text style={styles.tfOptionText}>D</Text>
            </View>
            <View style={styles.tfOption}>
              <Text style={styles.tfOptionText}>Y</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const DefaultBlock: React.FC<{ data: any; theme: string; font: string }> = ({ data, theme, font }) => {
  const styles = createBlockStyles(theme, font);
  
  return (
    <View style={styles.defaultContainer}>
      <Text style={styles.defaultText}>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getBlockTitle = (type: string): string => {
  const titles: Record<string, string> = {
    '5N1K_NEWS': '5N1K Haber Analizi',
    'FILL_IN_THE_BLANKS': 'Boşluk Doldurma',
    'MULTIPLE_CHOICE': 'Çoktan Seçmeli Sorular',
    'MATCH_LINES': 'Eşleştirme',
    'TRUE_FALSE': 'Doğru/Yanlış',
    'CIPHER': 'Şifre Çözme',
    'GRAMMAR_TREE': 'Dil Bilgisi Ağacı',
    'CREATIVE_WRITING': 'Yaratıcı Yazarlık',
    'COLOR_CODED_TABLE': 'Renkli Tablo',
    'OPEN_RESPONSE': 'Açık Uçlu Sorular',
  };
  
  return titles[type] || 'Etkinlik';
};

const getBlockInstruction = (type: string, settings?: Record<string, any>): string => {
  const instructions: Record<string, string> = {
    '5N1K_NEWS': 'Haberi okuyun ve 5N1K sorularını cevaplayın.',
    'FILL_IN_THE_BLANKS': 'Metindeki boşlukları kelime bankasından uygun kelimelerle doldurun.',
    'MULTIPLE_CHOICE': 'Soruları dikkatlice okuyun ve doğru cevabı işaretleyin.',
    'MATCH_LINES': 'Sol taraftaki ifadeleri sağ taraftaki uygun ifadelerle eşleştirin.',
    'TRUE_FALSE': 'İfadelerin doğru (D) veya yanlış (Y) olduğunu işaretleyin.',
  };
  
  return instructions[type] || 'Yönergeleri takip edin.';
};

// Helper functions to create styles with proper typing
const createBlockStyles = (theme: string, font: string) => {
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  
  return StyleSheet.create({
    blockContainer: {
      marginBottom: 20,
    },
    blockSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 20,
    },
    blockHeader: {
      marginBottom: 10,
    },
    blockTitle: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      marginBottom: 5,
      fontFamily: font,
    },
    blockInstruction: {
      fontSize: 9,
      color: '#64748b',
      fontStyle: 'italic' as const,
      fontFamily: font,
    },
    blockContent: {
      padding: 10,
    },
    // News Block
    newsContainer: {},
    newsHeader: {
      marginBottom: 10,
    },
    newsTitle: {
      fontSize: 13,
      fontWeight: 'bold' as const,
      fontFamily: font,
    },
    newsContent: {},
    newsRow: {
      flexDirection: 'row' as const,
      marginBottom: 5,
    },
    newsLabel: {
      width: 100,
      fontSize: 9,
      fontWeight: 'bold' as const,
      fontFamily: font,
    },
    newsValue: {
      flex: 1,
      fontSize: 9,
      fontFamily: font,
    },
    // Fill Blanks
    fillBlanksContainer: {},
    paragraph: {
      fontSize: 10,
      lineHeight: 1.6,
      marginBottom: 10,
      fontFamily: font,
    },
    wordBank: {
      marginTop: 10,
    },
    wordBankTitle: {
      fontSize: 9,
      fontWeight: 'bold' as const,
      marginBottom: 5,
      fontFamily: font,
    },
    wordsList: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
    },
    wordItem: {
      fontSize: 9,
      marginRight: 15,
      marginBottom: 3,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 3,
      fontFamily: font,
    },
    // Multiple Choice
    multipleChoiceContainer: {},
    questionItem: {
      marginBottom: 15,
    },
    questionText: {
      fontSize: 10,
      marginBottom: 8,
      fontFamily: font,
    },
    optionsGrid: {},
    optionRow: {
      flexDirection: 'row' as const,
      marginBottom: 4,
    },
    optionLetter: {
      width: 20,
      fontSize: 9,
      fontWeight: 'bold' as const,
      fontFamily: font,
    },
    optionText: {
      flex: 1,
      fontSize: 9,
      fontFamily: font,
    },
    // Match Lines
    matchContainer: {},
    matchColumns: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
    },
    matchColumn: {
      width: '48%',
    },
    matchItem: {
      marginBottom: 8,
    },
    matchItemText: {
      fontSize: 9,
      fontFamily: font,
    },
    // True False
    trueFalseContainer: {},
    tfRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    tfStatement: {
      flex: 1,
      fontSize: 9,
      fontFamily: font,
    },
    tfOptions: {
      flexDirection: 'row' as const,
      gap: 10,
    },
    tfOption: {
      width: 25,
      height: 25,
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 3,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    tfOptionText: {
      fontSize: 10,
      fontWeight: 'bold' as const,
      fontFamily: font,
    },
    // Default
    defaultContainer: {},
    defaultText: {
      fontSize: 8,
      fontFamily: font,
    },
  });
};
const createHeaderStyles = (theme: string, font: string) => {
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  
  return StyleSheet.create({
    header: {
      paddingTop: 30,
      paddingHorizontal: 40,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: colors.accent,
    },
    watermarkContainer: {
      position: 'absolute' as const,
      top: 20,
      left: 0,
      right: 0,
      alignItems: 'center' as const,
      opacity: 0.1,
    },
    watermark: {
      fontSize: 48,
      fontWeight: 'bold' as const,
      color: '#000',
      fontFamily: font,
    },
    headerMain: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center' as const,
      marginBottom: 10,
    },
    titleSection: {},
    mainTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.accent,
      fontFamily: font,
    },
    subtitle: {
      fontSize: 10,
      color: '#64748b',
      marginTop: 2,
      fontFamily: font,
    },
    infoSection: {
      flexDirection: 'row' as const,
      gap: 10,
    },
    infoBadge: {
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
    },
    infoBadgeText: {
      fontSize: 9,
      color: '#475569',
      fontWeight: '600' as const,
      fontFamily: font,
    },
    decorativeLine: {
      height: 3,
      width: '100%',
      borderRadius: 2,
      backgroundColor: colors.accent,
    },
  });
};
const createFooterStyles = (theme: string, font: string) => {
  const colors = pdfThemeColors[theme as keyof typeof pdfThemeColors];
  
  return StyleSheet.create({
    footer: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingHorizontal: 40,
      paddingTop: 15,
      paddingBottom: 25,
    },
    footerContent: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center' as const,
    },
    footerLeft: {
      flex: 1,
    },
    footerCenter: {
      flex: 1,
      alignItems: 'center' as const,
    },
    footerRight: {
      flex: 1,
      alignItems: 'flex-end' as const,
      flexDirection: 'row' as const,
      gap: 5,
    },
    footerText: {
      fontSize: 8,
      color: '#94a3b8',
      fontFamily: font,
    },
    footerTextSmall: {
      fontSize: 7,
      color: '#94a3b8',
      fontFamily: font,
    },
    themeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
  });
};

const styles = StyleSheet.create({
  contentArea: {
    padding: 20,
  },
  blockContainer: {
    marginBottom: 20,
  },
  blockSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  blockHeader: {
    marginBottom: 10,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  blockInstruction: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
  blockContent: {
    padding: 10,
  },
  // News Block
  newsContainer: {},
  newsHeader: {
    marginBottom: 10,
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  newsContent: {},
  newsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  newsLabel: {
    width: 100,
    fontSize: 9,
    fontWeight: 'bold',
  },
  newsValue: {
    flex: 1,
    fontSize: 9,
  },
  // Fill Blanks
  fillBlanksContainer: {},
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  wordBank: {
    marginTop: 10,
  },
  wordBankTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordItem: {
    fontSize: 9,
    marginRight: 15,
    marginBottom: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 3,
  },
  // Multiple Choice
  multipleChoiceContainer: {},
  questionItem: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 10,
    marginBottom: 8,
  },
  optionsGrid: {},
  optionRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  optionLetter: {
    width: 20,
    fontSize: 9,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 9,
  },
  // Match Lines
  matchContainer: {},
  matchColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchColumn: {
    width: '48%',
  },
  matchItem: {
    marginBottom: 8,
  },
  matchItemText: {
    fontSize: 9,
  },
  // True False
  trueFalseContainer: {},
  tfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tfStatement: {
    flex: 1,
    fontSize: 9,
  },
  tfOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  tfOption: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tfOptionText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Default
  defaultContainer: {},
  defaultText: {
    fontSize: 8,
  },
  // Header
  header: {
    paddingTop: 30,
    paddingHorizontal: 40,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.1,
  },
  watermark: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleSection: {},
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 10,
  },
  infoBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  infoBadgeText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '600',
  },
  decorativeLine: {
    height: 3,
    width: '100%',
    borderRadius: 2,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 40,
    paddingTop: 15,
    paddingBottom: 25,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  footerTextSmall: {
    fontSize: 7,
    color: '#94a3b8',
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default StackLayoutRenderer;

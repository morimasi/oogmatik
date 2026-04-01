/**
 * WorksheetActivityRenderer.tsx
 * Etkinlik Oluşturucu Stüdyosu — A4 yazdırılabilir etkinlik render motoru
 *
 * Bora Demir: TypeScript strict, any yasak
 * Elif Yıldız: Lexend font, disleksi uyumlu, geniş satır aralığı
 */

import React from 'react';
import type { WorksheetActivityData, WorksheetSection } from '../../types/worksheetActivity';

interface Props {
  data: WorksheetActivityData;
  showAnswerKey?: boolean;
}

// ── Stiller ──────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  fontFamily: "'Lexend', 'Inter', sans-serif",
  color: '#1e293b',
  backgroundColor: '#ffffff',
  padding: '32px',
  maxWidth: '210mm',
  margin: '0 auto',
  lineHeight: 1.8,
};

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '4px',
  color: '#1e293b',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '12px',
  textAlign: 'center',
  color: '#64748b',
  marginBottom: '16px',
};

const instructionStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '8px',
  padding: '8px 12px',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  borderLeft: '4px solid #6366f1',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '20px',
  pageBreakInside: 'avoid',
};

const blankLineStyle: React.CSSProperties = {
  borderBottom: '2px dotted #94a3b8',
  minHeight: '28px',
  marginTop: '6px',
  marginBottom: '6px',
};

const blankBoxStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #6366f1',
  borderRadius: '8px',
  minWidth: '40px',
  minHeight: '36px',
  margin: '0 4px',
  fontSize: '16px',
  fontWeight: 600,
  backgroundColor: '#f8fafc',
};

const gridCellStyle: React.CSSProperties = {
  border: '1.5px solid #cbd5e1',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 500,
};

const gridCellFilledStyle: React.CSSProperties = {
  ...gridCellStyle,
  backgroundColor: '#f1f5f9',
  fontWeight: 700,
};

const gridCellEmptyStyle: React.CSSProperties = {
  ...gridCellStyle,
  backgroundColor: '#ffffff',
};

const matchColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '8px',
};

const matchItemStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '2px solid #e2e8f0',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 500,
  backgroundColor: '#f8fafc',
  textAlign: 'center',
};

// ── Ana Bileşen ──────────────────────────────────────────────────────────────

export const WorksheetActivityRenderer: React.FC<Props> = ({ data, showAnswerKey = false }) => {
  return (
    <div style={containerStyle}>
      {/* Başlık */}
      <div style={titleStyle}>{data.title}</div>
      <div style={subtitleStyle}>
        {data.difficultyLevel} • {data.ageGroup} yaş • Tahmini süre: {data.estimatedDuration} dk
      </div>

      {/* Öğrenci Bilgi Alanı */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
        <div style={{ flex: 1 }}>
          Ad Soyad:{' '}
          <span style={blankLineStyle as React.CSSProperties}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
        <div>
          Tarih:{' '}
          <span style={blankLineStyle as React.CSSProperties}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Genel Yönerge */}
      {data.generalInstruction && <div style={instructionStyle}>📝 {data.generalInstruction}</div>}

      {/* Bölümler */}
      {data.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} showAnswer={showAnswerKey} />
      ))}

      {/* Cevap Anahtarı */}
      {showAnswerKey && data.hasAnswerKey && (
        <div style={{ marginTop: '32px', borderTop: '2px dashed #94a3b8', paddingTop: '16px' }}>
          <div
            style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#6366f1' }}
          >
            🔑 Cevap Anahtarı
          </div>
          {data.sections
            .filter((s) => s.correctAnswer)
            .map((s) => (
              <div key={s.id} style={{ fontSize: '13px', marginBottom: '4px', color: '#334155' }}>
                <strong>{s.order}.</strong>{' '}
                {Array.isArray(s.correctAnswer) ? s.correctAnswer.join(', ') : s.correctAnswer}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ── Bölüm Render'ı ──────────────────────────────────────────────────────────

const SectionRenderer: React.FC<{ section: WorksheetSection; showAnswer: boolean }> = ({
  section,
  showAnswer,
}) => {
  return (
    <div style={sectionStyle}>
      {/* Soru Numarası + Yönerge */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
        <span style={{ color: '#6366f1', fontWeight: 700, marginRight: '8px' }}>
          {section.order}.
        </span>
        {section.instruction}
      </div>

      {/* İçerik */}
      {section.content && (
        <div
          style={{
            fontSize: '14px',
            color: '#334155',
            marginBottom: '8px',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
          }}
        >
          {section.content}
        </div>
      )}

      {/* Ekstra Seçenek Listesi (Sıralama vb. için) */}
      {section.options &&
        section.options.length > 0 &&
        section.answerArea.type !== 'multiple-choice' &&
        section.answerArea.type !== 'classification-table' && (
          <ul
            style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              fontSize: '14px',
              color: '#334155',
              marginBottom: '12px',
            }}
          >
            {section.options.map((opt, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {opt}
              </li>
            ))}
          </ul>
        )}

      {/* Cevap Alanı */}
      <AnswerAreaRenderer section={section} showAnswer={showAnswer} />
    </div>
  );
};

// ── Cevap Alanı Render'ları ──────────────────────────────────────────────────

const AnswerAreaRenderer: React.FC<{ section: WorksheetSection; showAnswer: boolean }> = ({
  section,
  showAnswer,
}) => {
  const { answerArea } = section;

  switch (answerArea.type) {
    case 'blank-line':
      return (
        <BlankLineRenderer
          lines={answerArea.lines ?? 2}
          answer={showAnswer ? section.correctAnswer : undefined}
        />
      );

    case 'blank-box':
      return <BlankBoxRenderer answer={showAnswer ? section.correctAnswer : undefined} />;

    case 'grid':
      return <GridRenderer gridData={section.gridData} gridSize={answerArea.gridSize} />;

    case 'matching-lines':
      return <MatchingRenderer pairs={section.matchingPairs} />;

    case 'true-false-check':
      return <TrueFalseRenderer answer={showAnswer ? section.correctAnswer : undefined} />;

    case 'classification-table':
      return <ClassificationRenderer categories={section.options} />;

    case 'circle-mark':
      return <CircleMarkRenderer gridData={section.gridData} />;

    case 'drawing-area':
      return <DrawingAreaRenderer gridData={section.gridData} />;

    case 'multiple-choice':
      return (
        <MultipleChoiceRenderer
          options={section.options}
          answer={showAnswer ? section.correctAnswer : undefined}
        />
      );

    case 'numbering':
      return <NumberingRenderer count={section.options?.length ?? 5} />;

    default:
      return <BlankLineRenderer lines={2} />;
  }
};

// ── Alt Render Bileşenleri ───────────────────────────────────────────────────

const BlankLineRenderer: React.FC<{ lines: number; answer?: string | string[] }> = ({
  lines,
  answer,
}) => (
  <div>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} style={{ ...blankLineStyle, position: 'relative' }}>
        {answer && i === 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: 4,
              color: '#16a34a',
              fontSize: '12px',
              fontStyle: 'italic',
            }}
          >
            ✓ {Array.isArray(answer) ? answer.join(', ') : answer}
          </span>
        )}
      </div>
    ))}
  </div>
);

const BlankBoxRenderer: React.FC<{ answer?: string | string[] }> = ({ answer }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flexWrap: 'wrap',
      marginTop: '4px',
    }}
  >
    <span style={{ fontSize: '13px', color: '#64748b' }}>Cevap: </span>
    <span style={blankBoxStyle}>
      {answer ? (
        <span style={{ color: '#16a34a' }}>
          {Array.isArray(answer) ? answer.join(', ') : answer}
        </span>
      ) : (
        ''
      )}
    </span>
  </div>
);

const GridRenderer: React.FC<{
  gridData?: string[][];
  gridSize?: { rows: number; cols: number };
}> = ({ gridData, gridSize }) => {
  const rows =
    gridData ??
    Array.from({ length: gridSize?.rows ?? 4 }, () =>
      Array.from({ length: gridSize?.cols ?? 4 }, () => '')
    );
  return (
    <div
      style={{
        display: 'inline-block',
        border: '2px solid #94a3b8',
        borderRadius: '4px',
        overflow: 'hidden',
        margin: '8px 0',
      }}
    >
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex' }}>
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={cell && cell !== '' && cell !== '□' ? gridCellFilledStyle : gridCellEmptyStyle}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const MatchingRenderer: React.FC<{
  pairs?: Array<{ left: string; right: string }>;
}> = ({ pairs }) => {
  if (!pairs || pairs.length === 0) return null;
  const shuffledRight = [...pairs].sort(() => Math.random() - 0.5);
  return (
    <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', margin: '12px 0' }}>
      <div style={matchColumnStyle}>
        {pairs.map((p, i) => (
          <div key={i} style={{ ...matchItemStyle, borderColor: '#6366f1' }}>
            {p.left}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '24px',
          color: '#94a3b8',
          paddingTop: '16px',
        }}
      >
        ⟷
      </div>
      <div style={matchColumnStyle}>
        {shuffledRight.map((p, i) => (
          <div key={i} style={{ ...matchItemStyle, borderColor: '#f59e0b' }}>
            {p.right}
          </div>
        ))}
      </div>
    </div>
  );
};

const TrueFalseRenderer: React.FC<{ answer?: string | string[] }> = ({ answer }) => (
  <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
    <div
      style={{
        ...blankBoxStyle,
        borderColor: answer === 'D' ? '#16a34a' : '#cbd5e1',
        backgroundColor: answer === 'D' ? '#dcfce7' : '#f8fafc',
        padding: '4px 16px',
      }}
    >
      D
    </div>
    <div
      style={{
        ...blankBoxStyle,
        borderColor: answer === 'Y' ? '#dc2626' : '#cbd5e1',
        backgroundColor: answer === 'Y' ? '#fef2f2' : '#f8fafc',
        padding: '4px 16px',
      }}
    >
      Y
    </div>
  </div>
);

const ClassificationRenderer: React.FC<{ categories?: string[] }> = ({ categories }) => {
  const cols = categories ?? ['Kategori 1', 'Kategori 2', 'Kategori 3'];
  return (
    <div style={{ margin: '12px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th
                key={i}
                style={{
                  border: '2px solid #6366f1',
                  padding: '10px 8px',
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, ri) => (
            <tr key={ri}>
              {cols.map((_, ci) => (
                <td
                  key={ci}
                  style={{
                    border: '1.5px solid #e2e8f0',
                    padding: '14px 8px',
                    minHeight: '36px',
                  }}
                >
                  &nbsp;
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CircleMarkRenderer: React.FC<{ gridData?: string[][] }> = ({ gridData }) => {
  if (gridData) return <GridRenderer gridData={gridData} />;
  return <div style={{ ...blankLineStyle, marginTop: '8px' }} />;
};

const DrawingAreaRenderer: React.FC<{ gridData?: string[][] }> = ({ gridData }) => {
  if (gridData) return <GridRenderer gridData={gridData} />;
  return (
    <div
      style={{
        border: '2px dashed #94a3b8',
        borderRadius: '8px',
        minHeight: '120px',
        margin: '8px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '13px',
      }}
    >
      ✏️ Çizim Alanı
    </div>
  );
};

const MultipleChoiceRenderer: React.FC<{
  options?: string[];
  answer?: string | string[];
}> = ({ options, answer }) => {
  const labels = ['A', 'B', 'C', 'D'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
      {(options ?? []).map((opt, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: answer === labels[i] ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
            backgroundColor: answer === labels[i] ? '#f0fdf4' : '#ffffff',
          }}
        >
          <span style={{ fontWeight: 700, color: '#6366f1', minWidth: '20px' }}>{labels[i]})</span>
          {opt}
        </div>
      ))}
    </div>
  );
};

const NumberingRenderer: React.FC<{ count: number }> = ({ count }) => (
  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <span key={i} style={blankBoxStyle}>
        &nbsp;
      </span>
    ))}
  </div>
);

export default WorksheetActivityRenderer;

/**
 * Akıllı baskı/PDF mizanpajı + Türkçe ajan koordinasyonu testleri
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  MIN_SPLIT_HEAD_HEIGHT,
  chunkByHeights,
  planRowSplit,
  resolvePageBox,
  buildExportPages,
} from '../src/utils/print/SmartLayout';
import { PRINT_SAFETY_CSS } from '../src/utils/print/PrintSafetyCSS';
import {
  BDMIND_AGENTS,
  activateAllAgents,
  agentService,
  bdmindAgentRoster,
} from '../src/services/agentService';

describe('planRowSplit — kalan alanı akıllı doldurma', () => {
  it('kalan alana sığan en fazla satırı alır, kalanını sonraki sayfaya bırakır', () => {
    expect(planRowSplit([100, 100, 100, 100], 250)).toBe(2);
  });

  it('tüm satırlar sığıyorsa bölmez (null)', () => {
    expect(planRowSplit([100, 100], 500)).toBeNull();
  });

  it('tek satırlık okunamaz artık üretmez', () => {
    expect(planRowSplit([30, 30, 30], 50)).toBeNull();
  });

  it('tek satırlık ızgarayı bölmez', () => {
    expect(planRowSplit([400], 900)).toBeNull();
  });

  it('en az bir satırın sonraki sayfada kalmasını garanti eder', () => {
    const take = planRowSplit([120, 120, 120], 360);
    expect(take).toBeNull();
  });

  it('minimum başlık yüksekliği sabittir ve pozitiftir', () => {
    expect(MIN_SPLIT_HEAD_HEIGHT).toBeGreaterThan(0);
  });

  it('boş veya geçersiz girdide güvenli döner', () => {
    expect(planRowSplit([], 500)).toBeNull();
    expect(planRowSplit([100, 100], 0)).toBeNull();
    expect(planRowSplit([100, 100], Number.NaN)).toBeNull();
  });
});

describe('Mizanpaj çekirdeği — sayfa sınırları', () => {
  it('A4 yazdırılabilir alanı kağıttan küçüktür (marj düşülür)', () => {
    const box = resolvePageBox('A4', 8, false);
    expect(box.contentHeightPx).toBeLessThan(box.heightPx);
    expect(box.contentWidthPx).toBeLessThan(box.widthPx);
  });

  it('sığan blokları tek grupta tutar', () => {
    expect(chunkByHeights([200, 200], 500)).toEqual([[0, 1]]);
  });

  it('layout üretmeyen ortamda içerik kaybolmadan tek sayfa döner', () => {
    document.body.innerHTML =
      '<div class="worksheet-page"><div data-page-content="true"><p>Deneme</p></div></div>';
    const source = document.querySelector('.worksheet-page') as HTMLElement;
    const pages = buildExportPages([source], { paperSize: 'A4' });
    expect(pages).toHaveLength(1);
    expect(pages[0].element.textContent).toContain('Deneme');
    document.body.innerHTML = '';
  });
});

describe('Baskı güvenlik CSS — boşluk ve kırılma koruması', () => {
  it('devasa boşlukları kompaktlaştırır', () => {
    expect(PRINT_SAFETY_CSS).toContain('row-gap: 3mm');
    expect(PRINT_SAFETY_CSS).toContain('.gap-12');
  });

  it('başlık ve kart bütünlüğünü korur', () => {
    expect(PRINT_SAFETY_CSS).toContain('orphans: 3');
    expect(PRINT_SAFETY_CSS).toContain('break-inside: avoid');
  });

  it('boş yazdırma sarmalayıcısını gizler', () => {
    expect(PRINT_SAFETY_CSS).toContain('.bdmind-print-wrapper:empty');
  });
});

describe('Türkçe ajan koordinasyonu', () => {
  it('13 Ordinaryüs ajanı kayıtlıdır ve kimlikleri benzersizdir', () => {
    expect(BDMIND_AGENTS).toHaveLength(13);
    expect(new Set(BDMIND_AGENTS.map((agent) => agent.id)).size).toBe(13);
    expect(bdmindAgentRoster).toBe(BDMIND_AGENTS);
  });

  it('activateAllAgents tüm kadroyu etkinleştirir', () => {
    const agents = activateAllAgents();
    expect(agents).toHaveLength(13);
    expect(agentService.isActive()).toBe(true);
  });

  it('koordinasyon Türkçe rapor ve uzman mesajları üretir', async () => {
    const result = await agentService.coordinateAgents('Baskı sayfalama denetimi');
    expect(result.direction).toBe('tr');
    expect(result.activeAgentCount).toBe(13);
    expect(result.agents).toHaveLength(13);
    expect(result.agents[0].message).toContain('İnceleme konusu');
    expect(result.summary).toContain('Türkçe koordinasyonla');
    expect(Object.keys(result.insights).length).toBeGreaterThanOrEqual(13);
  });

  it('eski öğrenci analizi anahtarları korunur', async () => {
    const result = await agentService.coordinateAgents('Öğrenci analizi');
    expect(result.insights['ozel-ogrenme-uzmani']).toBeDefined();
    expect(result.insights['ozel-egitim-uzmani']).toBeDefined();
    expect(result.insights['yazilim-muhendisi']).toBeDefined();
    expect(result.insights['ai-muhendisi']).toBeDefined();
  });
});

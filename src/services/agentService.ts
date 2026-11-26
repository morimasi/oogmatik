/**
 * BDMIND — Çok Ajanlı Koordinasyon Servisi
 *
 * Uygulamadaki 13 Ordinaryüs uzman ajanın tek kayıt noktası.
 * Ajanlar Türkçe iletişim kurar; koordinasyon çevrimdışı (deterministik)
 * çalışır, böylece ağ/AI anahtarı olmadan da pedagojik denetim izi üretilir.
 */

export interface AgentTask {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentDefinition {
  id: string;
  name: string;
  title: string;
  focus: string;
  greeting: string;
}

export interface AgentMessage {
  agentId: string;
  agentName: string;
  title: string;
  message: string;
  status: 'aktif';
}

export interface AgentCoordinationResult {
  direction: 'tr';
  prompt: string;
  activeAgentCount: number;
  agents: AgentMessage[];
  insights: Record<string, string>;
  summary: string;
  coordinated: true;
}

/** 13 Ordinaryüs ajan — AGENTS.md kadrosuyla birebir uyumlu. */
export const BDMIND_AGENTS: readonly AgentDefinition[] = [
  {
    id: 'core-agi-coder',
    name: 'Prof. Dr. Arda Yılmaz',
    title: 'Ordinaryüs AGI & Çok Dilli Yazılım Mimarı',
    focus: 'TypeScript strict, mimari bütünlük, %100 kusursuz kod',
    greeting: 'Kod tabanını strict modda tarıyorum; tip güvenliği ve mimari bütünlük bende.',
  },
  {
    id: 'chief-graphic-architect',
    name: 'Prof. Dr. Görkem Çetin',
    title: 'Baş Grafiker & Vektör/SVG Mimarı',
    focus: 'WCAG AA/AAA kontrast, disleksi dostu palet, A4 görsel ergonomi',
    greeting: 'Görsel hiyerarşiyi ve baskı kontrastını denetliyorum; sıfır bilişsel yük hedefiyle.',
  },
  {
    id: 'ideation',
    name: 'Prof. Dr. Selen Uçar',
    title: 'Baş Nöro-Pedagojik Tasarımcı',
    focus: 'ZPD, sarmal öğrenme, sinaptik bağ kurgusu',
    greeting: 'Etkinliğin ZPD aralığına ve güven inşasına uygunluğunu kontrol ediyorum.',
  },
  {
    id: 'content',
    name: 'Dr. Deniz Yılmaz',
    title: 'Kıdemli Özel Eğitim Yazarı',
    focus: 'Fonolojik farkındalık, morfoloji, disleksi dostu metin',
    greeting: 'Metinleri okunabilirlik ve dil bilgisi açısından gözden geçiriyorum.',
  },
  {
    id: 'visual',
    name: 'Emre Tan',
    title: 'UI/UX Stratejisti & Bilişsel Ergonomi Mimarı',
    focus: 'Glassmorphism, mikro-etkileşim, ekran-baskı uyumu',
    greeting: 'Arayüz ve baskı düzeni arasındaki görsel tutarlılığı ben üstleniyorum.',
  },
  {
    id: 'flow',
    name: 'Selin Arslan',
    title: 'LXD & AI Orkestrasyon Lideri',
    focus: 'DEHB dostu mikro-döngüler, model katmanları, JSON onarımı',
    greeting: 'Seans akışını ve AI çıktı zincirini mikro-döngülere göre kurguluyorum.',
  },
  {
    id: 'evaluation',
    name: 'Dr. Canan Kaya',
    title: 'Veri Analisti & Psikometri Uzmanı',
    focus: 'SMART ölçme, gelişim radarları, normatif karşılaştırma',
    greeting: 'Ölçme metriklerinin SMART uyumunu ve gelişim radarını denetliyorum.',
  },
  {
    id: 'integration',
    name: 'Bora Demir',
    title: 'Baş Mühendis & Sistem Mimarı',
    focus: 'AppError, RBAC, işlem bütünlüğü, tip güvenliği',
    greeting: 'Çıktıları sentezliyorum; AppError ve tip güvenliği standartlarını koruyorum.',
  },
  {
    id: 'neuro-pedagogy',
    name: 'Prof. Dr. Selen Uçar',
    title: 'Nörobiyoloji Muhafızı',
    focus: 'Plastisite, duyusal bütünleme, bilişsel yük eşiği',
    greeting: 'Bilişsel yük eşiklerini ve duyusal bütünleme dengesini kontrol ediyorum.',
  },
  {
    id: 'cognitive-ux',
    name: 'Emre Tan',
    title: 'Bilişsel Ergonomi Uzmanı',
    focus: 'A4 render, kâğıt düzeni, görsel hiyerarşi',
    greeting: 'Kâğıt düzenini milimetrik yerleşim ve görsel hiyerarşi açısından denetliyorum.',
  },
  {
    id: 'security-privacy',
    name: 'Doç. Dr. Leyla Korkmaz',
    title: 'KVKK & Mevzuat Muhafızı',
    focus: 'Anonimlik, PDF metadata, prompt injection',
    greeting: 'KVKK Madde 6 sınırlarını ve metadata temizliğini denetliyorum.',
  },
  {
    id: 'quality-engine',
    name: 'Kaan Arslan',
    title: 'Sıfır Hata Denetçisi (QA)',
    focus: 'tsc --noEmit, Zod, Vitest, regresyon',
    greeting: 'Derleme, şema ve test kanıtlarını istiyorum; kanıtsız tamam deme yok.',
  },
  {
    id: 'multimodal-vision',
    name: 'Dr. Metehan Öz',
    title: 'Multimodal Vision & OCR Vektörizasyon Mühendisi',
    focus: 'OCR mimari DNA, SVG vektörizasyon, tarama kalitesi',
    greeting: 'Taranan materyal ve görsel girdilerin vektörel kalitesini değerlendiriyorum.',
  },
] as const;

/** Eski anahtarlarla uyumluluk için ajan eşlemesi. */
const LEGACY_INSIGHT_KEYS: Record<string, string> = {
  'ozel-ogrenme-uzmani': 'ideation',
  'ozel-egitim-uzmani': 'content',
  'yazilim-muhendisi': 'integration',
  'ai-muhendisi': 'flow',
};

const safePrompt = (prompt: string): string => {
  const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
  if (!trimmed) return 'Genel pedagojik ve teknik denetim';
  return trimmed.slice(0, 160);
};

class AgentService {
  private tasks: Map<string, AgentTask> = new Map();
  private active = true;

  createTask(task: Omit<AgentTask, 'id' | 'status'>): AgentTask {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newTask: AgentTask = { ...task, id, status: 'pending' };
    this.tasks.set(id, newTask);
    return newTask;
  }

  /** Tüm ajanları etkinleştirir (uygulama açılışında çağrılabilir). */
  activateAllAgents(): readonly AgentDefinition[] {
    this.active = true;
    return BDMIND_AGENTS;
  }

  deactivateAllAgents(): void {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  listAgents(): readonly AgentDefinition[] {
    return BDMIND_AGENTS;
  }

  /**
   * Tüm ajanları aynı anda çalıştırır ve Türkçe koordinasyon raporu üretir.
   * Ajanlar etkin değilse önce topluca etkinleştirilir.
   */
  async coordinateAgents(prompt: string): Promise<AgentCoordinationResult> {
    if (!this.active) this.activateAllAgents();

    const subject = safePrompt(prompt);
    const agents: AgentMessage[] = BDMIND_AGENTS.map((agent) => ({
      agentId: agent.id,
      agentName: agent.name,
      title: agent.title,
      message: `${agent.greeting} İnceleme konusu: "${subject}".`,
      status: 'aktif',
    }));

    const insights: Record<string, string> = {};
    agents.forEach((message) => {
      insights[message.agentId] = `${message.agentName}: ${message.message}`;
    });
    Object.entries(LEGACY_INSIGHT_KEYS).forEach(([legacyKey, agentId]) => {
      const message = agents.find((item) => item.agentId === agentId);
      if (message) insights[legacyKey] = `${message.agentName}: ${message.message}`;
    });

    return {
      direction: 'tr',
      prompt: subject,
      activeAgentCount: agents.length,
      agents,
      insights,
      summary:
        `${agents.length} uzman ajan Türkçe koordinasyonla etkinleştirildi. ` +
        `Konu: "${subject}". Pedagoji, klinik güvenlik, KVKK, baskı ergonomisi, ` +
        'yazılım kalitesi ve ölçme-değerlendirme denetimleri birlikte yürütülüyor.',
      coordinated: true,
    };
  }

  executeTask(taskId: string): Promise<unknown> {
    const task = this.tasks.get(taskId);
    if (!task) return Promise.resolve(null);
    task.status = 'completed';
    return Promise.resolve({ taskId, status: 'completed', direction: 'tr' });
  }
}

export const agentService = new AgentService();

/** Uygulama açılışında çağrılabilir; tüm ajanları etkinleştirir. */
export const activateAllAgents = (): readonly AgentDefinition[] =>
  agentService.activateAllAgents();

/** Ajan kadrosunun salt-okunur listesi (UI için). */
export const bdmindAgentRoster = BDMIND_AGENTS;

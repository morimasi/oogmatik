# BEP (Bireyselleştirilmiş Eğitim Planı) Modülü Teknik Analiz ve Mimari Raporu

## 1. Yönetici Özeti
Bu belge, öğrenci takip sisteminin BEP modülünün yeni nesil mimarisini ve teknik detaylarını içerir. Sistem, yapay zeka destekli analizler, mikro servis mimarisi ve yüksek performanslı veri işleme prensipleri üzerine kurulmuştur.

## 2. Mimari Tasarım (Micro-services)

Sistem, aşağıdaki bağımsız servislerden oluşur ve Docker konteynerleri içinde orkestre edilir:

### Servisler
1.  **Core Student Service (Node.js/NestJS)**:
    *   Öğrenci temel verileri, kimlik doğrulama ve yetkilendirme (RBAC).
    *   PostgreSQL veritabanı.
2.  **IEP Management Service (Go)**:
    *   BEP hedefleri, ilerleme takibi ve değerlendirme süreçleri.
    *   Yüksek performanslı CRUD işlemleri.
3.  **AI Analysis Engine (Python/FastAPI)**:
    *   **NLP Service**: Öğrenci metin/ses verilerinin duygu ve içerik analizi (Hugging Face Transformers).
    *   **Prediction Service**: Başarı ve risk tahmini (Scikit-learn/XGBoost).
    *   **Recommendation Engine**: İçerik öneri sistemi (Collaborative Filtering).
4.  **Reporting Service (Node.js)**:
    *   PDF ve Excel rapor üretimi.
    *   Asenkron kuyruk yapısı (RabbitMQ/Redis).

### Altyapı
*   **Containerization**: Docker & Docker Compose.
*   **Orchestration**: Kubernetes (K8s).
*   **CI/CD**: GitHub Actions / GitLab CI.
*   **Gateway**: Nginx / Kong API Gateway.

## 3. Veri Modeli ve API Spesifikasyonları

### Veri Modeli (Özet)

#### `Student`
*   `id`: UUID
*   `cognitiveProfile`: JSON (WISC-R, CAS skorları)
*   `learningStyle`: Enum (Visual, Auditory, Kinesthetic)

#### `IEPGoal`
*   `id`: UUID
*   `studentId`: UUID
*   `category`: Enum (Academic, Behavioral, Social)
*   `smartCriteria`: JSON (Specific, Measurable, Achievable, Relevant, Time-bound)
*   `aiInsights`: JSON (AI tarafından üretilen strateji önerileri)

#### `Anomaly`
*   `id`: UUID
*   `studentId`: UUID
*   `type`: Enum (PerformanceDrop, Attendance, Mood)
*   `severity`: 1-10
*   `detectedAt`: Timestamp

### API Endpoints (Örnek)

*   `GET /api/v1/students/{id}/iep/dashboard`: Dashboard özeti ve kritik uyarılar.
*   `POST /api/v1/ai/analyze-goal`: Girilen hedef metnini analiz eder ve SMART kriterlerine uygunluk skoru döner.
*   `GET /api/v1/recommendations?studentId={id}`: Öğrenci profiline uygun aktivite önerileri.

## 4. Güvenlik ve Performans
*   **OWASP**: Tüm girişler sanitize edilir, SQL Injection ve XSS koruması mevcuttur.
*   **GDPR/KVKK**: Hassas veriler (sağlık, tanı) AES-256 ile şifrelenerek saklanır.
*   **Performans**: Redis önbellekleme ile ortalama yanıt süresi < 200ms hedeflenmiştir.

## 5. Yapay Zeka Entegrasyonu
*   **Anomali Tespiti**: Isolation Forest algoritması ile öğrencinin normal davranış örüntüsünden sapmalar (not düşüşü, devamsızlık artışı) tespit edilir.
*   **NLP**: Öğretmen notları ve öğrenci geri bildirimleri üzerinden duygu analizi yapılır.

---
*Rapor Tarihi: 11.03.2026*
*Versiyon: 2.0.0*

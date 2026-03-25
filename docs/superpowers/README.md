# Superpowers Integration — Oogmatik

Bu dizin, `obra/superpowers` geliştirme iş akışı entegrasyonunun belgelerini içerir.

## Superpowers Nedir?

[obra/superpowers](https://github.com/obra/superpowers), AI kodlama ajansları (Claude Code, Cursor, Gemini CLI vb.) için yapılandırılmış geliştirme iş akışları sağlayan bir "skill" (beceri) sistemidir.

Temel prensipler:
1. **Kod yazmadan önce beyin fırtınası** — Fikri önce tasarıma dönüştür
2. **Uygulama planı yaz** — Görevlere ayır, bite-sized steps
3. **Test-Driven Development** — Önce test yaz, sonra kod
4. **Subagent-Driven Development** — Her görev için taze subagent
5. **Code Review** — Her görev sonrası
6. **Doğrulama** — Tamamlandığını iddia etmeden önce kanıtla

## Oogmatik'e Entegrasyon

Superpowers becerileri `.claude/skills/` dizininde bulunur ve Claude Code'un `Skill` aracı tarafından kullanılır.

### Beceriler

| Beceri | Ne Zaman Kullanılır |
|--------|---------------------|
| `using-superpowers` | Her oturum başında (otomatik) |
| `brainstorming` | Kod yazmadan önce — özellikle pedagoji gerektiren işler |
| `writing-plans` | Tasarım onaylandıktan sonra |
| `test-driven-development` | Her özellik/hata düzeltmesinde |
| `subagent-driven-development` | Plan yürütme (tavsiye edilen) |
| `executing-plans` | Plan yürütme (tek oturumda) |
| `systematic-debugging` | Herhangi bir hata bulunduğunda |
| `requesting-code-review` | Görev tamamlandıktan sonra |
| `verification-before-completion` | "Tamamlandı" demeden önce |
| `finishing-a-development-branch` | Uygulama bittiğinde |
| `using-git-worktrees` | Özellik izolasyonu için |

### Oogmatik Kurallarıyla Öncelik

Superpowers skills + Oogmatik kuralları birlikte çalışır:

```
1. CLAUDE.md / Oogmatik kuralları (en yüksek öncelik)
   ↓
2. Superpowers skills (iş akışı)
   ↓  
3. Default AI behavior (en düşük öncelik)
```

**Oogmatik kuralları superpowers becerilerini her zaman geçer. Bunlar mutlaktır:**
- `pedagogicalNote` — her AI aktivite çıktısında zorunlu
- `AppError` standardı — bypass edilemez
- `any` tipi yasak
- Lexend font değiştirilemez
- Tanı koyucu dil yasak

## Dizin Yapısı

```
docs/superpowers/
├── README.md          ← Bu dosya
├── specs/             ← Tasarım dokümanları (brainstorming çıktısı)
│   └── YYYY-MM-DD-feature-design.md
└── plans/             ← Uygulama planları (writing-plans çıktısı)
    └── YYYY-MM-DD-feature-plan.md
```

## Kurulum

Superpowers, bu projede `.claude/skills/` dizininde proje yerel olarak entegre edilmiştir.

Claude Code kullanıcıları için ek olarak global kurulum:
```
/plugin install superpowers@claude-plugins-official
```

Gemini CLI kullanıcıları için:
```
gemini extensions install https://github.com/obra/superpowers
```

## Kaynak

- GitHub: https://github.com/obra/superpowers
- Lisans: MIT
- Yazar: Jesse Vincent

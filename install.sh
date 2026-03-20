#!/bin/bash
# vibecosystem yükleyici
# vibeeval/vibecosystem'i klonlar ve ~/.claude/ dizinine kurar

set -e

VIBECOSYSTEM_REPO="https://github.com/vibeeval/vibecosystem.git"
TMP_DIR="$(mktemp -d)"
CLAUDE_DIR="$HOME/.claude"
FORCE=false
ADDED=0
SKIPPED=0

# Argümanları işle
for arg in "$@"; do
  case $arg in
    --force) FORCE=true ;;
    --help|-h)
      echo "Kullanım: ./install.sh [--force]"
      echo ""
      echo "  --force    Mevcut dosyaların üzerine yazar (varsayılan: atla)"
      echo ""
      echo "--force olmadan sadece YENİ dosyalar eklenir. Mevcut ajan,"
      echo "beceri, hook ve kurallarınız korunur."
      exit 0
      ;;
  esac
done

echo "vibecosystem yükleyici"
echo "======================="
echo ""
echo "Bu işlem ~/.claude/ dizinine aşağıdakileri kuracak:"
echo "  - 119 ajan    -> ~/.claude/agents/"
echo "  - 202 beceri  -> ~/.claude/skills/"
echo "  - 48 hook     -> ~/.claude/hooks/"
echo "  - 16 kural    -> ~/.claude/rules/"
echo ""
if [ "$FORCE" = true ]; then
  echo "Mod: ÜZERİNE YAZ (--force) — mevcut dosyalar değiştirilecek"
else
  echo "Mod: BİRLEŞTİR (varsayılan) — mevcut dosyalar korunacak"
fi
echo ""
read -p "Devam edilsin mi? (y/N) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 0

# vibecosystem reposunu geçici dizine klonla
echo ""
echo "vibecosystem indiriliyor..."
git clone --depth=1 "$VIBECOSYSTEM_REPO" "$TMP_DIR"
REPO_DIR="$TMP_DIR"

# Yedekleme (sadece --force modunda)
if [ "$FORCE" = true ]; then
  if [ -d "$CLAUDE_DIR/agents" ] || [ -d "$CLAUDE_DIR/skills" ]; then
    BACKUP="$CLAUDE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    echo "Mevcut dosyalar yedekleniyor: $BACKUP"
    mkdir -p "$BACKUP"
    [ -d "$CLAUDE_DIR/agents" ] && cp -r "$CLAUDE_DIR/agents" "$BACKUP/"
    [ -d "$CLAUDE_DIR/skills" ] && cp -r "$CLAUDE_DIR/skills" "$BACKUP/"
    [ -d "$CLAUDE_DIR/hooks" ] && cp -r "$CLAUDE_DIR/hooks" "$BACKUP/"
    [ -d "$CLAUDE_DIR/rules" ] && cp -r "$CLAUDE_DIR/rules" "$BACKUP/"
    echo ""
  fi
fi

# Akıllı kopyalama: --force yoksa mevcut dosyaları atla
smart_copy_file() {
  local src="$1"
  local dest="$2"
  if [ "$FORCE" = true ] || [ ! -e "$dest" ]; then
    cp "$src" "$dest"
    ADDED=$((ADDED + 1))
  else
    SKIPPED=$((SKIPPED + 1))
  fi
}

smart_copy_dir() {
  local src="$1"
  local dest="$2"
  if [ "$FORCE" = true ] || [ ! -e "$dest" ]; then
    cp -r "$src" "$dest"
    ADDED=$((ADDED + 1))
  else
    SKIPPED=$((SKIPPED + 1))
  fi
}

# Ajanları kur
echo "Ajanlar kuruluyor..."
mkdir -p "$CLAUDE_DIR/agents"
for f in "$REPO_DIR/agents/"*.md; do
  name=$(basename "$f")
  smart_copy_file "$f" "$CLAUDE_DIR/agents/$name"
done

# Becerileri kur
echo "Beceriler kuruluyor..."
mkdir -p "$CLAUDE_DIR/skills"
for d in "$REPO_DIR/skills/"*/; do
  name=$(basename "$d")
  [ "$name" = "*" ] && continue
  smart_copy_dir "$d" "$CLAUDE_DIR/skills/$name"
done

# Hook'ları kur (önceden derlenmiş dist/ — npm/node gerekmez)
echo "Hook'lar kuruluyor..."
mkdir -p "$CLAUDE_DIR/hooks/dist"
mkdir -p "$CLAUDE_DIR/hooks/src/shared"
for f in "$REPO_DIR/hooks/dist/"*.mjs; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  smart_copy_file "$f" "$CLAUDE_DIR/hooks/dist/$name"
done
for f in "$REPO_DIR/hooks/src/"*.ts; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  smart_copy_file "$f" "$CLAUDE_DIR/hooks/src/$name"
done
for f in "$REPO_DIR/hooks/src/shared/"*.ts; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  smart_copy_file "$f" "$CLAUDE_DIR/hooks/src/shared/$name"
done
[ -f "$REPO_DIR/hooks/package.json" ] && smart_copy_file "$REPO_DIR/hooks/package.json" "$CLAUDE_DIR/hooks/package.json"
[ -f "$REPO_DIR/hooks/tsconfig.json" ] && smart_copy_file "$REPO_DIR/hooks/tsconfig.json" "$CLAUDE_DIR/hooks/tsconfig.json"

# Kuralları kur
echo "Kurallar kuruluyor..."
mkdir -p "$CLAUDE_DIR/rules"
for f in "$REPO_DIR/rules/"*.md; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  smart_copy_file "$f" "$CLAUDE_DIR/rules/$name"
done

# Geçici dizini temizle
rm -rf "$TMP_DIR"

echo ""
echo "Kurulum tamamlandı!"
echo "  Eklendi:  $ADDED dosya"
echo "  Atlandı:  $SKIPPED dosya (zaten mevcut)"
echo ""
echo "  Ajanlar: $(find "$CLAUDE_DIR/agents/" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  Beceriler: $(find "$CLAUDE_DIR/skills/" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
echo "  Hook'lar:  $(find "$CLAUDE_DIR/hooks/dist/" -maxdepth 1 -name "*.mjs" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  Kurallar:  $(find "$CLAUDE_DIR/rules/" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo ""
if [ $SKIPPED -gt 0 ]; then
  echo "İpucu: Mevcut dosyaların üzerine yazmak için ./install.sh --force kullanın."
fi

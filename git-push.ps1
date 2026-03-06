# =============================================
# OOGMATIK - Otomatik GitHub Push Script
# Kullanim: Bu dosyaya sag tikla > "PowerShell ile Calistir"
# =============================================

$ErrorActionPreference = "Stop"

# --- AYARLAR ---
$REPO_DIR = "d:\bbma\bursadisleksi\oogmatik"
$GITHUB_PAT = "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"
$GITHUB_USER = "morimasi"
$REPO_NAME = "oogmatik"
$BRANCH = "main"
# ----------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OOGMATIK - GitHub Push Baslatiliyor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Proje dizinine git
Set-Location $REPO_DIR
Write-Host "[1/5] Dizin: $REPO_DIR" -ForegroundColor Green

# 1.5 Git kimligini ayarla
git config user.email "morimasi@users.noreply.github.com"
git config user.name "morimasi"
Write-Host "[1.5] Git kimligi ayarlandi" -ForegroundColor Green

# 2. Remote URL'yi token ile ayarla
$remoteUrl = "https://${GITHUB_USER}:${GITHUB_PAT}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
git remote set-url origin $remoteUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
}
Write-Host "[2/5] Remote URL ayarlandi" -ForegroundColor Green

# 3. Tum degisiklikleri stage'le
git add -A
Write-Host "[3/5] Degisiklikler stage'lendi" -ForegroundColor Green

# 4. Commit mesaji iste veya otomatik olustur
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$defaultMsg = "guncelleme: $timestamp"

Write-Host ""
$commitMsg = Read-Host "Commit mesaji girin (bos birakirsaniz: '$defaultMsg')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = $defaultMsg
}

# Degisiklik var mi kontrol et
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host ""
    Write-Host "[!] Commit edilecek degisiklik yok. Zaten guncel!" -ForegroundColor Yellow
}
else {
    git commit -m $commitMsg
    Write-Host "[4/5] Commit yapildi: '$commitMsg'" -ForegroundColor Green
}

# 5. Push
Write-Host ""
Write-Host "[5/5] Push yapiliyor..." -ForegroundColor Yellow
git push origin $BRANCH

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  BASARILI! Degisiklikler GitHub'a gonderildi" -ForegroundColor Green
    Write-Host "  https://github.com/$GITHUB_USER/$REPO_NAME" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  HATA! Push basarisiz oldu." -ForegroundColor Red
    Write-Host "  Token'in gecerli oldugundan emin olun." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Kapatmak icin Enter'a basin"

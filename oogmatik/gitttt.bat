@echo off
echo --- Git Islemi Baslatiliyor (Cakisma Cozumu Dahil) ---
git add .
git commit -m "feat(ai): guncel"
git branch -M main
echo --- GitHub'a ZORLAYARAK Gonderiliyor (Force Push) ---
echo NOT: Uzak depodaki eski veriler yerel verilerle degistirilecek.
git push -u origin main --force
echo.
echo Islem tamamlandi. 
echo Hata mesajini gormek icin pencereyi kapatmadan once yukariyi kontrol edin.
pause

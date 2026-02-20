@echo off
cd "c:\Users\Michel Vasquez\Documents\Docs\Monkey Ranch"
git config core.pager ""
git add club.html
git commit -m "Update club.html: Add transparent black backgrounds to success message and info cards"
git push origin main
pause

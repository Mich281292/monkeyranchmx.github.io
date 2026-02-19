@echo off
cd /d "c:\Users\Michel Vasquez\Documents\Docs\Monkey Ranch\monkey-ranch"
git merge --abort
git pull --rebase origin main
git push origin main
pause

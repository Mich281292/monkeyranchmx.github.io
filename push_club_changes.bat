@echo off
setlocal enabledelayedexpansion

cd /d "c:\Users\Michel Vasquez\Documents\Docs\Monkey Ranch"

REM Desactivar pager
git config core.pager ""

REM Main repo
echo Pushing changes to main repo...
git add club.html
git commit -m "Add Join Our Club card with red text below email confirmation"
git push origin main

REM Submodule
cd monkey-ranch
echo Pushing changes to submodule...
git add club.html
git commit -m "Add Join Our Club card with red text below email confirmation"
git push origin main

echo Done!

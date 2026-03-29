@echo off
chcp 65001 >nul
echo.
echo  מתקין תלויות...
pip install flask flask-cors openpyxl --quiet
echo.
echo  מפעיל שרת...
echo  הדפדפן ייפתח אוטומטית
echo.
python "%~dp0app.py"
pause

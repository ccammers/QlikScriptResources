echo %date% - %time%

forfiles /p "C:\ProgramData\Qlik" /m "*.log" /S /D -7 /c "cmd /c if @isdir==FALSE del @file /Q"
forfiles /p "C:\QlikRepository" /m "*.log" /S /D -185 /c "cmd /c if @isdir==FALSE del @file /Q"
forfiles /p "C:\SenseBackup" /m "*.log" /D -7 /c "cmd /c if @isdir==FALSE del @file /Q"
forfiles /p "C:\SenseBackup" /m "*.backup" /D -2 /c "cmd /c if @isdir==TRUE rmdir @file /S /Q"
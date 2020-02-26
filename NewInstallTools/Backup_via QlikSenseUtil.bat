C:\"Program Files"\Qlik\Sense\Repository\Util\QlikSenseUtil\QlikSenseUtil.exe -backup -certificatePassword="SolveTeam!" -databaseHostname="imagine.solve.local" -databasePassword="SolveTeam!" -path="c:\SenseBackup" -rootPath="\\imagine\QlikRepository" -f

forfiles /p "%TEMP%\logs" /m "qliksenseutil_*.log" /c "cmd /c move @file c:\SenseBackup"
@echo off
setlocal

set "SCRIPT_DIR=%~dp0scripts"
set "AUTO_PROMPT=Utilize all Heady MCP services and available tools to deterministically and optimally integrate the following tasks if beneficial to the Heady project and add or modify any content as seen fit and utilize all Heady Logic, and any HeadyNodes to accomplish beneficial and optimized task integration into the intelligently orchistrated and into the dynamically allocated resource ecosystem of the Heady project."

if /i "%~1"=="-a" goto :sysmonitor
if /i "%~1"=="sysmonitor" goto :sysmonitor
if /i "%~1"=="realmonitor" goto :realmonitor
if /i "%~1"=="tasks" goto :tasks

echo Usage:
echo   hc realmonitor [prompt]
echo   hc -a
echo   hc tasks list
echo   hc tasks create "Title" "Description"
exit /b 1

:sysmonitor
shift
node "%SCRIPT_DIR%\sysmonitor.mjs" %1 %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

:realmonitor
shift
python "%SCRIPT_DIR%\realmonitor.py" %1 %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

:tasks
shift
node "%SCRIPT_DIR%\task_cli.mjs" %1 %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%

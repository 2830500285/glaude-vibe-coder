Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

repoDir = fso.GetParentFolderName(WScript.ScriptFullName)
bunExe = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\.bun\bin\bun.exe"

If Not fso.FileExists(bunExe) Then
    bunExe = "bun"
End If

command = "cmd /c cd /d """ & repoDir & """ && """ & bunExe & """ run app"
shell.Run command, 0, False

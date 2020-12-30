# 文件名冠以英语句点“.”是为了在 Shell 或 Git Bash 环境下，令本文件不可见。
# 文件名在英语句点之后冠以“ps-”，是为了避免该文件与“.git”文件夹的起始部分相同。令二者有此区别，则日常操作会更便捷。

. .\PowerShell-Tools\common\Push-GitRepositoryToSingleOrigin.ps1

Write-Host
Write-Host  -F 'Black'  -B 'DarkGreen'  ' Git 推送至所有源：开始 '
Write-Host

Push-GitRepositoryToSingleOrigin  '阿里云：吴乐川'  -GitOrignDisplayNameColor 'green'
Push-GitRepositoryToSingleOrigin  '码云：吴乐川'  -GitOrignDisplayNameColor 'Red'
Push-GitRepositoryToSingleOrigin  'GitHub：吴乐川'  -GitOrignDisplayNameColor 'Yellow'

Write-Host
Write-Host  -F 'Black'  -B 'DarkGreen'  ' Git 推送至所有源：结束 '
Write-Host

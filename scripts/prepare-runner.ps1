$runnerDir = "d:\Time-tap\scripts\runner"
if (!(Test-Path $runnerDir)) {
    New-Item -ItemType Directory -Path $runnerDir -Force | Out-Null
}

$zipPath = "$runnerDir\temp.zip"
$extractPath = "$runnerDir\extracted"

Write-Host "Downloading iOS Mach-O runner..."
Invoke-WebRequest -Uri 'https://github.com/Akuma1tko/ChatGPT-WebView/releases/download/v3/ChatGPTWebView-v3.ipa' -OutFile $zipPath

Write-Host "Extracting runner..."
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

Copy-Item "$extractPath\Payload\ChatGPTWebView.app\ChatGPTWebView" "$runnerDir\ShotClock" -Force
if (Test-Path "$extractPath\Payload\ChatGPTWebView.app\Assets.car") {
    Copy-Item "$extractPath\Payload\ChatGPTWebView.app\Assets.car" "$runnerDir\Assets.car" -Force
}
if (Test-Path "$extractPath\Payload\ChatGPTWebView.app\LaunchScreen.storyboardc") {
    Copy-Item -Recurse "$extractPath\Payload\ChatGPTWebView.app\LaunchScreen.storyboardc" "$runnerDir\LaunchScreen.storyboardc" -Force
}

Remove-Item -Recurse -Force $zipPath, $extractPath -ErrorAction SilentlyContinue
Write-Host "Runner prepared successfully at $runnerDir\ShotClock"

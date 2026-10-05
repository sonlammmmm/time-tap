# build-ipa.ps1 - Package Poker Shot Clock into an installable iOS .ipa
$ErrorActionPreference = "Stop"

$projectRoot = "d:\Time-tap"
$distDir = "$projectRoot\dist"
$buildDir = "$projectRoot\build_ipa"
$payloadDir = "$buildDir\Payload"
$appDir = "$payloadDir\ShotClock.app"
$runnerDir = "$projectRoot\scripts\runner"
$ipaOut = "$projectRoot\ShotClock.ipa"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building Poker Shot Clock iOS App     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Build web application
Write-Host "`n[1/4] Compiling frontend with Vite..." -ForegroundColor Yellow
Set-Location $projectRoot
npm run build

# 2. Sync with Capacitor iOS
Write-Host "`n[2/4] Syncing Capacitor iOS..." -ForegroundColor Yellow
npx cap sync ios

# 3. Assemble IPA Payload
Write-Host "`n[3/4] Assembling IPA Payload..." -ForegroundColor Yellow
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $appDir -Force | Out-Null

# Copy runner executable and assets
if (!(Test-Path "$runnerDir\ShotClock")) {
    Write-Host "Runner missing, running prepare-runner.ps1..." -ForegroundColor Yellow
    & "$projectRoot\scripts\prepare-runner.ps1"
}

Copy-Item "$runnerDir\ShotClock" "$appDir\ShotClock" -Force
if (Test-Path "$runnerDir\Assets.car") {
    Copy-Item "$runnerDir\Assets.car" "$appDir\Assets.car" -Force
}
if (Test-Path "$runnerDir\LaunchScreen.storyboardc") {
    Copy-Item -Recurse "$runnerDir\LaunchScreen.storyboardc" "$appDir\LaunchScreen.storyboardc" -Force
}

# Copy icons
Copy-Item "$projectRoot\public\apple-touch-icon.png" "$appDir\AppIcon60x60@2x.png" -Force
Copy-Item "$projectRoot\public\apple-touch-icon.png" "$appDir\AppIcon76x76@2x~ipad.png" -Force
Copy-Item "$projectRoot\public\icon-512.png" "$appDir\AppIcon-512@2x.png" -Force

# Copy Web Assets into app bundle
Copy-Item -Recurse "$distDir\*" "$appDir\" -Force
New-Item -ItemType Directory -Path "$appDir\public" -Force | Out-Null
Copy-Item -Recurse "$distDir\*" "$appDir\public\" -Force

# Create PkgInfo
Set-Content -Path "$appDir\PkgInfo" -Value "APPL????" -NoNewline

# Create Info.plist with microphone permissions
$plistContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Poker Shot Clock</string>
    <key>CFBundleExecutable</key>
    <string>ShotClock</string>
    <key>CFBundleIdentifier</key>
    <string>com.timetap.shotclock</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>ShotClock</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>MinimumOSVersion</key>
    <string>14.0</string>
    <key>UIRequiresFullScreen</key>
    <true/>
    <key>NSMicrophoneUsageDescription</key>
    <string>Ứng dụng cần quyền sử dụng microphone để ghi âm âm thanh cảnh báo và thông báo hết giờ tùy chỉnh.</string>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIDeviceFamily</key>
    <array>
        <integer>1</integer>
        <integer>2</integer>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
"@
Set-Content -Path "$appDir\Info.plist" -Value $plistContent -Encoding UTF8

# 4. Create .ipa (zip archive)
Write-Host "`n[4/4] Packaging into ShotClock.ipa..." -ForegroundColor Yellow
if (Test-Path $ipaOut) {
    Remove-Item -Force $ipaOut
}

$tempZip = "$projectRoot\ShotClock_temp.zip"
if (Test-Path $tempZip) {
    Remove-Item -Force $tempZip
}

Compress-Archive -Path $payloadDir -DestinationPath $tempZip -CompressionLevel Optimal
Rename-Item -Path $tempZip -NewName "ShotClock.ipa" -Force

# Clean up build staging
Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue

$fileInfo = Get-Item $ipaOut
$sizeMb = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " [SUCCESS] File .ipa created successfully!            " -ForegroundColor Green
Write-Host " Output file: $ipaOut ($sizeMb MB)                     " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Add-Type -AssemblyName System.Drawing

function Create-AppIcon([string]$path, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Dark background
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 7, 16, 25))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Green timer ring
    $greenPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 18, 183, 106)), ($size * 0.05)
    $padding = $size * 0.12
    $g.DrawArc($greenPen, $padding, $padding, $size - ($padding * 2), $size - ($padding * 2), -45, 270)

    # Center text "30"
    $fontSize = [float]($size * 0.36)
    $font = New-Object System.Drawing.Font ("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 233, 240, 247))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF 0, ($size * 0.04), $size, $size
    $g.DrawString("30", $font, $textBrush, $rect, $format)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $path ($size x $size)"
}

$publicDir = "d:\Time-tap\public"
if (!(Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir }

Create-AppIcon "$publicDir\icon-192.png" 192
Create-AppIcon "$publicDir\icon-512.png" 512
Create-AppIcon "$publicDir\apple-touch-icon.png" 180

# Also copy to iOS assets if exists
$iosIconDir = "d:\Time-tap\ios\App\App\Assets.xcassets\AppIcon.appiconset"
if (Test-Path $iosIconDir) {
    Create-AppIcon "$iosIconDir\AppIcon-512@2x.png" 1024
}

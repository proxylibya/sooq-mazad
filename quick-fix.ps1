$files = @(
    "apps\web\pages\transport\browse.tsx",
    "apps\web\pages\transport\calculator.tsx",
    "apps\web\pages\transport\confirmation.tsx",
    "apps\web\pages\transport\dashboard.tsx",
    "apps\web\pages\transport\edit\[id].tsx",
    "apps\web\pages\transport\edit-service\[id].tsx",
    "apps\web\pages\transport\my-bookings.tsx",
    "apps\web\pages\transport\request.tsx",
    "apps\web\pages\transport\setup-profile.tsx",
    "apps\web\pages\transport\track.tsx",
    "apps\web\pages\verify-phone.tsx"
)

$fixed = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "Skip: $file (not found)" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    $originalContent = $content
    
    # نمط البحث عن imports الخاطئة
    $pattern = "import\s+(\w+)\s+from\s+['""]@heroicons/react/24/(outline|solid)/\1['""]\s*;?\s*\r?\n?"
    
    $icons = @{
        outline = @()
        solid = @()
    }
    
    # جمع كل الأيقونات
    $matches = [regex]::Matches($content, $pattern)
    
    if ($matches.Count -eq 0) {
        Write-Host "Skip: $file (no hero imports)" -ForegroundColor Gray
        continue
    }
    
    foreach ($match in $matches) {
        $iconName = $match.Groups[1].Value
        $variant = $match.Groups[2].Value
        
        if ($icons[$variant] -notcontains $iconName) {
            $icons[$variant] += $iconName
        }
    }
    
    # إزالة كل الـ imports الخاطئة
    $content = [regex]::Replace($content, $pattern, "")
    
    # بناء الـ imports الجديدة
    $newImports = @()
    
    if ($icons['outline'].Count -gt 0) {
        if ($icons['outline'].Count -le 3) {
            $newImports += "import { " + ($icons['outline'] -join ', ') + " } from '@heroicons/react/24/outline';"
        } else {
            $newImports += "import {`n  " + ($icons['outline'] -join ",`n  ") + ",`n} from '@heroicons/react/24/outline';"
        }
    }
    
    if ($icons['solid'].Count -gt 0) {
        if ($icons['solid'].Count -le 3) {
            $newImports += "import { " + ($icons['solid'] -join ', ') + " } from '@heroicons/react/24/solid';"
        } else {
            $newImports += "import {`n  " + ($icons['solid'] -join ",`n  ") + ",`n} from '@heroicons/react/24/solid';"
        }
    }
    
    # إدراج الـ imports الجديدة في بداية الملف
    $importBlock = ($newImports -join "`n") + "`n"
    $content = $importBlock + $content
    
    # حفظ الملف
    Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
    
    $totalIcons = $icons['outline'].Count + $icons['solid'].Count
    Write-Host "Fixed: $file ($totalIcons icons)" -ForegroundColor Green
    $fixed++
}

Write-Host "`n✅ Total files fixed: $fixed / $($files.Count)" -ForegroundColor Cyan

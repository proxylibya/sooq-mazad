# Quick Manager - أداة إدارة موحدة لمشروع سوق مزاد
# استخدام: .\quick-manager.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$Host.UI.RawUI.WindowTitle = "Sooq Mazad Manager"

# ألوان للتوضيح
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# عرض المساعدة
function Show-Help {
    Clear-Host
    Write-Info "╔═══════════════════════════════════════════════════════╗"
    Write-Info "║           Sooq Mazad - Quick Manager                 ║"
    Write-Info "╚═══════════════════════════════════════════════════════╝"
    Write-Host ""
    Write-Host "الأوامر المتاحة:" -ForegroundColor White
    Write-Host ""
    Write-Success "  start       " -NoNewline; Write-Host "- تشغيل المشروع (بدون Redis)"
    Write-Success "  start-all   " -NoNewline; Write-Host "- تشغيل جميع الخدمات"
    Write-Success "  stop        " -NoNewline; Write-Host "- إيقاف جميع الخدمات"
    Write-Host ""
    Write-Warning "  fix         " -NoNewline; Write-Host "- إصلاح سريع للمشاكل"
    Write-Warning "  fix-all     " -NoNewline; Write-Host "- إصلاح شامل"
    Write-Warning "  clean       " -NoNewline; Write-Host "- تنظيف المجلدات المؤقتة"
    Write-Host ""
    Write-Info "  build       " -NoNewline; Write-Host "- بناء المشروع"
    Write-Info "  test        " -NoNewline; Write-Host "- فحص صحة المشروع"
    Write-Info "  db          " -NoNewline; Write-Host "- فتح Prisma Studio"
    Write-Host ""
    Write-Host "  help        - عرض هذه المساعدة" -ForegroundColor Gray
    Write-Host ""
    Write-Host "مثال: .\quick-manager.ps1 start" -ForegroundColor DarkGray
    Write-Host ""
}

# تشغيل بدون Redis
function Start-WithoutRedis {
    Write-Info "🚀 تشغيل المشروع بدون Redis..."
    
    # تعيين متغير البيئة
    $env:KEYDB_ENABLED = "false"
    
    # تشغيل الخدمات في نوافذ منفصلة
    Write-Info "▶ تشغيل Web App (3021)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/web; npm run dev"
    
    Start-Sleep -Seconds 2
    Write-Info "▶ تشغيل Admin Panel (3022)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/admin; npm run dev"
    
    Start-Sleep -Seconds 2
    Write-Info "▶ تشغيل API Server (3023)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/api; npm run dev"
    
    Start-Sleep -Seconds 2
    Write-Info "▶ تشغيل Realtime Server (3024)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/realtime; npm run dev"
    
    Write-Success "✅ جميع الخدمات تعمل!"
    Write-Host ""
    Write-Host "الروابط:" -ForegroundColor White
    Write-Host "  Web:      http://localhost:3021" -ForegroundColor Cyan
    Write-Host "  Admin:    http://localhost:3022" -ForegroundColor Green
    Write-Host "  API:      http://localhost:3023" -ForegroundColor Yellow
    Write-Host "  Realtime: http://localhost:3024" -ForegroundColor Magenta
}

# تشغيل جميع الخدمات
function Start-All {
    Write-Info "🚀 تشغيل جميع الخدمات..."
    npm run dev:concurrent
}

# إيقاف الخدمات
function Stop-All {
    Write-Warning "⏹ إيقاف جميع الخدمات..."
    
    # إيقاف العمليات على المنافذ
    $ports = @(3021, 3022, 3023, 3024)
    foreach ($port in $ports) {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                   Select-Object -ExpandProperty OwningProcess -Unique
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ تم إيقاف المنفذ $port" -ForegroundColor Gray
        }
    }
    
    Write-Success "✅ تم إيقاف جميع الخدمات"
}

# إصلاح سريع
function Fix-Quick {
    Write-Warning "🔧 بدء الإصلاح السريع..."
    
    Write-Info "▶ إصلاح TypeScript..."
    npm install typescript@5.3.3 --save-dev --legacy-peer-deps
    
    Write-Info "▶ تثبيت التبعيات المفقودة..."
    npm install react-dom basic-auth morgan --legacy-peer-deps
    
    Write-Info "▶ توليد Prisma Client..."
    npx prisma generate
    
    Write-Success "✅ تم الإصلاح بنجاح!"
}

# إصلاح شامل
function Fix-All {
    Write-Warning "🔧 بدء الإصلاح الشامل..."
    
    Write-Info "▶ تنظيف المجلدات..."
    Remove-Item -Path "node_modules", ".next", ".turbo", "dist" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "apps/*/node_modules", "apps/*/.next", "apps/*/dist" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Info "▶ تثبيت التبعيات..."
    npm install --legacy-peer-deps
    
    Write-Info "▶ توليد Prisma..."
    npx prisma generate
    
    Write-Success "✅ الإصلاح الشامل اكتمل!"
}

# تنظيف
function Clean-Project {
    Write-Warning "🧹 تنظيف المجلدات المؤقتة..."
    npm run fix:clean
    Write-Success "✅ تم التنظيف!"
}

# بناء
function Build-Project {
    Write-Info "📦 بناء المشروع..."
    npm run build
    Write-Success "✅ البناء اكتمل!"
}

# فحص
function Test-Project {
    Write-Info "🔍 فحص صحة المشروع..."
    node PROJECT_HEALTH_CHECK.js
}

# Prisma Studio
function Open-Database {
    Write-Info "🗄️ فتح Prisma Studio..."
    npx prisma studio
}

# تنفيذ الأمر المطلوب
switch ($Command.ToLower()) {
    "start"     { Start-WithoutRedis }
    "start-all" { Start-All }
    "stop"      { Stop-All }
    "fix"       { Fix-Quick }
    "fix-all"   { Fix-All }
    "clean"     { Clean-Project }
    "build"     { Build-Project }
    "test"      { Test-Project }
    "db"        { Open-Database }
    "help"      { Show-Help }
    default     { 
        Write-Error "أمر غير معروف: $Command"
        Write-Host ""
        Show-Help 
    }
}

# Clean Next.js cache and start dev server
Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "Cache cleared." -ForegroundColor Green
} else {
    Write-Host "No cache to clear." -ForegroundColor Gray
}

Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev

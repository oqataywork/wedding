Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$dest = Join-Path (Get-Location) "wedding_deploy.zip"
if (Test-Path $dest) { Remove-Item $dest }

$zip = [System.IO.Compression.ZipFile]::Open($dest, 'Create')
$root = (Get-Location).Path

# Root files
foreach ($f in @('index.html', 'styles.css', 'script.js')) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f, $f) | Out-Null
}

# Folders with forward slashes
foreach ($folder in @('assets', 'fonts')) {
    Get-ChildItem $folder -Recurse -File | ForEach-Object {
        $entry = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry) | Out-Null
    }
}

$zip.Dispose()
Write-Host "Done: $dest"

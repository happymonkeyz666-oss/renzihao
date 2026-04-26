$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $root "index.html"
$logoDir = Join-Path $root "assets\logos"
New-Item -ItemType Directory -Force -Path $logoDir | Out-Null

$html = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
$urls = [regex]::Matches($html, '<img\s+[^>]*src="([^"]+)"') |
  ForEach-Object { $_.Groups[1].Value } |
  Where-Object { $_ -match '^https?://' } |
  Sort-Object -Unique

function Get-LogoName {
  param([string]$Url, [string]$ContentType)

  $uri = [Uri]$Url
  $extension = [System.IO.Path]::GetExtension($uri.AbsolutePath)
  if ([string]::IsNullOrWhiteSpace($extension)) {
    if ($ContentType -match 'svg') {
      $extension = '.svg'
    } elseif ($ContentType -match 'png') {
      $extension = '.png'
    } elseif ($ContentType -match 'jpeg|jpg') {
      $extension = '.jpg'
    } elseif ($ContentType -match 'webp') {
      $extension = '.webp'
    } else {
      $extension = '.png'
    }
  }

  if ($uri.Host -eq 'www.google.com' -and $uri.AbsolutePath -eq '/s2/favicons') {
    $domain = ""
    if ($uri.Query -match '(?:\?|&)domain=([^&]+)') {
      $domain = [Uri]::UnescapeDataString($matches[1])
    }
    $baseName = "favicon-" + ($domain -replace '[^a-zA-Z0-9]+', '-').Trim('-').ToLowerInvariant()
  } elseif ($uri.Host -eq 'cdn.simpleicons.org') {
    $parts = $uri.AbsolutePath.Trim('/').Split('/')
    $baseName = "simpleicons-" + $parts[0].ToLowerInvariant()
  } else {
    $leaf = [System.IO.Path]::GetFileNameWithoutExtension($uri.AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($leaf) -or $leaf -eq 'file') {
      $segments = $uri.AbsolutePath.Trim('/').Split('/')
      $leaf = $segments[$segments.Length - 1]
    }
    $baseName = ($leaf -replace '[^a-zA-Z0-9]+', '-').Trim('-').ToLowerInvariant()
  }

  return "$baseName$extension"
}

$map = @{}
$failures = @()

foreach ($url in $urls) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 30 -Headers @{ "User-Agent" = "Mozilla/5.0" }
    $contentType = if ($response.Headers["Content-Type"]) { [string]$response.Headers["Content-Type"] } else { "" }
    $bytes = $response.Content
    if ($bytes -is [string]) {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($bytes)
    }
    $fileName = Get-LogoName -Url $url -ContentType $contentType
    $targetPath = Join-Path $logoDir $fileName
    [System.IO.File]::WriteAllBytes($targetPath, $bytes)
    $relativePath = "assets/logos/$fileName"
    $map[$url] = $relativePath
    Write-Host "OK $relativePath <- $url"
  } catch {
    $failures += "$url :: $($_.Exception.Message)"
    Write-Host "FAIL $url :: $($_.Exception.Message)"
  }
}

foreach ($entry in $map.GetEnumerator()) {
  $html = $html.Replace($entry.Key, $entry.Value)
}

[System.IO.File]::WriteAllText($indexPath, $html, [System.Text.UTF8Encoding]::new($false))

if ($failures.Count -gt 0) {
  Write-Host "FAILED_COUNT=$($failures.Count)"
  $failures | ForEach-Object { Write-Host $_ }
  exit 2
}

Write-Host "DOWNLOADED_COUNT=$($map.Count)"

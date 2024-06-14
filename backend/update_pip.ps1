$packages = pip list --outdated --format=columns | Select-String -Pattern '^\S+' | ForEach-Object { $_.Matches.Groups[0].Value }
foreach ($package in $packages) {
    pip install --upgrade $package
}
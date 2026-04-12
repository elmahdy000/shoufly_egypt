# SHOOFLY - Full E2E Lifecycle Test
# Uses cookie-based sessions matching Next.js httpOnly cookie auth

$BASE = "http://localhost:5000/api"
$PASS = "password123"
$SUB_CAT_ID = 15  # laptop-repair subcategory

function Step($n, $msg) { Write-Host "`n--- [$n] $msg ---" -ForegroundColor Cyan }
function Pass($msg) { Write-Host "    PASS: $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "    FAIL: $msg" -ForegroundColor Red }

function DoLogin($email) {
    $sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $body = ('{"email":"' + $email + '","password":"' + $PASS + '"}')
    try {
        $resp = Invoke-WebRequest -Uri ($BASE + "/auth/login") -Method POST `
            -ContentType "application/json" -Body $body `
            -SessionVariable sess -ErrorAction Stop
        $data = $resp.Content | ConvertFrom-Json
        Pass ("Logged in as " + $email + " | id=" + $data.id)
        return $sess
    } catch {
        Fail ("Login failed for " + $email + ": " + $_)
        return $null
    }
}

function DoApi($relPath, $method, $session, $bodyObj = $null) {
    $url = $BASE + $relPath
    if ($bodyObj -ne $null) {
        $json = ($bodyObj | ConvertTo-Json -Depth 10)
        $resp = Invoke-WebRequest -Uri $url -Method $method -WebSession $session `
            -ContentType "application/json" -Body $json -ErrorAction Stop
    } else {
        $resp = Invoke-WebRequest -Uri $url -Method $method -WebSession $session -ErrorAction Stop
    }
    return ($resp.Content | ConvertFrom-Json)
}

# ===== PHASE 1: CLIENT =====
Step 1 "CLIENT LOGIN"
$cSess = DoLogin "client@shoofly.com"
if (-not $cSess) { exit 1 }

Step 2 "CREATE SERVICE REQUEST"
try {
    $reqBody = [PSCustomObject]@{
        title = "E2E Test - Laptop Screen Fix"
        description = "Automated test - screen cracked needs replacement"
        categoryId = $SUB_CAT_ID
        address = "Maadi, Cairo, Egypt"
        latitude = 29.9600
        longitude = 31.2500
        deliveryPhone = "01012345678"
        notes = "Automated E2E Test Run"
    }
    $newReq = DoApi "/requests" "POST" $cSess $reqBody
    $reqId = $newReq.id
    Pass ("Request created reqId=$reqId status=" + $newReq.status)
} catch {
    Fail ("Create request: $_")
    exit 1
}

# ===== PHASE 2: ADMIN =====
Step 3 "ADMIN LOGIN"
$aSess = DoLogin "admin@shoofly.com"
if (-not $aSess) { exit 1 }

Step 4 "ADMIN APPROVE REQUEST"
try {
    $appr = DoApi ("/admin/requests/" + $reqId + "/review") "PATCH" $aSess ([PSCustomObject]@{ action = "approve" })
    Pass ("Approved -> status=" + $appr.status)
} catch { Fail "Admin approve: $_" }

Step 5 "ADMIN DISPATCH REQUEST"
try {
    $disp = DoApi ("/admin/requests/" + $reqId + "/dispatch") "PATCH" $aSess
    Pass ("Dispatched -> status=" + $disp.status)
} catch { Fail "Admin dispatch: $_" }

# ===== PHASE 3: VENDOR =====
Step 6 "VENDOR LOGIN"
$vSess = DoLogin "vendor@shoofly.com"
if (-not $vSess) { exit 1 }

try {
    $vProfile = DoApi "/vendor/profile" "GET" $vSess
    $vWalletBefore = [double]$vProfile.walletBalance
    Write-Host ("    Vendor wallet BEFORE: " + $vWalletBefore)
} catch { $vWalletBefore = 0 }

Step 7 "VENDOR SUBMIT BID"
try {
    $bidBody = [PSCustomObject]@{
        requestId = $reqId
        description = "E2E Test Bid - Professional laptop repair with warranty"
        netPrice = 1200
        clientPrice = 1500
    }
    $bid = DoApi "/vendor/bids" "POST" $vSess $bidBody
    $bidId = $bid.id
    Pass ("Bid submitted bidId=$bidId clientPrice=" + $bid.clientPrice)
} catch {
    Fail "Vendor bid: $_"
    exit 1
}

# ===== PHASE 4: ADMIN FORWARD =====
Step 8 "ADMIN FORWARD BID TO CLIENT"
try {
    $fwd = DoApi ("/admin/bids/" + $bidId + "/forward") "PATCH" $aSess
    Pass ("Bid forwarded -> status=" + $fwd.status)
} catch { Fail "Admin forward: $_" }

# ===== PHASE 5: CLIENT ACCEPT & PAY =====
Step 9 "CLIENT ACCEPT BID"
try {
    $acc = DoApi ("/client/bids/" + $bidId + "/accept") "POST" $cSess
    Pass ("Bid accepted -> " + ($acc | ConvertTo-Json -Compress))
} catch { Fail "Client accept: $_" }

Step 10 "CLIENT PAY (ESCROW)"
try {
    $paid = DoApi ("/client/requests/" + $reqId + "/pay") "POST" $cSess
    Pass ("Payment done -> status=" + $paid.status)
} catch { Fail "Client pay: $_" }

# ===== PHASE 6: VENDOR STATUS =====
Step 11 "VENDOR: PREPARING"
try {
    DoApi ("/vendor/bids/" + $bidId + "/status") "PATCH" $vSess ([PSCustomObject]@{ status = "VENDOR_PREPARING" }) | Out-Null
    Pass "Status set to VENDOR_PREPARING"
} catch { Fail "Vendor preparing: $_" }

Step 12 "VENDOR: READY FOR PICKUP"
try {
    DoApi ("/vendor/bids/" + $bidId + "/status") "PATCH" $vSess ([PSCustomObject]@{ status = "READY_FOR_PICKUP" }) | Out-Null
    Pass "Status set to READY_FOR_PICKUP"
} catch { Fail "Vendor ready: $_" }

# ===== PHASE 7: RIDER =====
Step 13 "RIDER LOGIN"
$rSess = DoLogin "rider@shoofly.com"
if (-not $rSess) { exit 1 }

try {
    $rProfile = DoApi "/delivery/profile" "GET" $rSess
    $rWalletBefore = [double]$rProfile.walletBalance
    Write-Host ("    Rider wallet BEFORE: " + $rWalletBefore)
} catch { $rWalletBefore = 0 }

Step 14 "RIDER ACCEPTS TASK"
try {
    $task = DoApi ("/delivery/tasks/" + $reqId + "/accept") "POST" $rSess
    Pass ("Task accepted -> " + ($task | ConvertTo-Json -Compress))
} catch { Fail "Rider accept: $_" }

Step 15 "RIDER MARKS DELIVERED"
try {
    $del = DoApi ("/delivery/tasks/" + $reqId + "/complete") "PATCH" $rSess
    Pass ("Marked delivered -> " + ($del | ConvertTo-Json -Compress))
} catch { Fail "Rider deliver: $_" }

# ===== PHASE 8: CLIENT CONFIRMS =====
Step 16 "GET REQUEST DETAILS & QR CODE"
try {
    $det = DoApi ("/requests/" + $reqId) "GET" $cSess
    $qr = $det.qrCode
    if ($qr) { Pass ("QR=" + $qr.Substring(0, [Math]::Min(50, $qr.Length)) + "...") }
    else { Fail "No QR code on request!" }
} catch {
    Fail "Get details: $_"
    $qr = $null
}

Step 17 "CLIENT CONFIRM RECEIPT (QR SCAN)"
if ($qr) {
    try {
        $settled = DoApi "/delivery/confirm" "POST" $cSess ([PSCustomObject]@{ qrCode = $qr })
        Pass ("ORDER SETTLED! finalStatus=" + $settled.finalRequestStatus + " vendorPayout=" + $settled.vendorPayout + " adminCommission=" + $settled.adminCommission)
    } catch { Fail "QR confirm: $_" }
} else {
    Fail "SKIP - QR not available"
}

# ===== PHASE 9: VERIFY WALLETS =====
Step 18 "VERIFY FINAL WALLETS"
try {
    $vFinal = DoApi "/vendor/profile" "GET" $vSess
    $vAfter = [double]$vFinal.walletBalance
    $vDiff = [math]::Round($vAfter - $vWalletBefore, 2)
    if ($vDiff -gt 0) { Pass ("Vendor wallet: $vWalletBefore => $vAfter | PROFIT +$vDiff EGP") }
    else { Fail ("Vendor wallet unchanged: $vWalletBefore => $vAfter") }
} catch { Fail "Vendor wallet check: $_" }

try {
    $rFinal = DoApi "/delivery/profile" "GET" $rSess
    $rAfter = [double]$rFinal.walletBalance
    $rDiff = [math]::Round($rAfter - $rWalletBefore, 2)
    if ($rDiff -gt 0) { Pass ("Rider wallet:  $rWalletBefore => $rAfter | EARNED +$rDiff EGP") }
    else { Fail ("Rider wallet unchanged: $rWalletBefore => $rAfter") }
} catch { Fail "Rider wallet check: $_" }

Write-Host "`n=============================" -ForegroundColor Yellow
Write-Host " SHOOFLY E2E TEST COMPLETED  " -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

// 🔒 Validasi token sesi mahasiswa aktif
$currentUser = requireAuth($conn);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->assetId)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID Aset wajib diisi woi."]);
    exit;
}

// 🎯 GENERATE FORMAT TANGGAL DI HARI YANG SAMA SECARA OTOMATIS
$startDate = date('Y-m-d');
$endDate = date('Y-m-d');

// 🎯 TANGKAP INPUTAN JAM MULAI & JAM SELESAI DARI FRONTEND SECARA DINAMIS
$borrowTime = !empty($data->borrowTime) ? $data->borrowTime : date('H:i:s');
$returnTime = !empty($data->returnTime) ? $data->returnTime : date('H:i:s', strtotime('+2 hours'));

try {
    // 1. Ambil info aset saat ini untuk mengambil nama aset dan memotong stok base64
    $checkAsset = $conn->prepare("SELECT asset_name, description, deskripsi, status FROM assets WHERE id = ?");
    $checkAsset->execute([$data->assetId]);
    $asset = $checkAsset->fetch(PDO::FETCH_ASSOC);

    if (!$asset) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Aset tidak ditemukan di database."]);
        exit;
    }

    // 🎯 ENGINE BONGKAR DATA QUANTITY BASE64 KELOMPOK LU
    $descriptionStr = $asset['description'] ?? $asset['deskripsi'] ?? '';
    $currentQty = 0;
    $metaData = [];
    $pureDesc = '';

    if (!empty($descriptionStr) && strpos($descriptionStr, '||META:') !== false) {
        $parts = explode('||', $descriptionStr);
        foreach ($parts as $part) {
            if (strpos($part, 'META:') === 0) {
                $base64Str = str_replace('META:', '', $part);
                $metaData = json_decode(base64_decode($base64Str), true) ?? [];
                $currentQty = isset($metaData['qty']) ? (int)$metaData['qty'] : 0;
            }
        }
        $pureDesc = isset($metaData['desc']) ? $metaData['desc'] : '';
    }

    if ($currentQty <= 0) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Maaf woi, stok kuantitas aset ini sudah kosong/habis!"]);
        exit;
    }

    // MAPPING DATA FALLBACK DARI UTILS DAN JWT TOKENS LU
    $userId = $currentUser['id'] ?? $currentUser['user_id'] ?? 0;
    $userName = $currentUser['name'] ?? $currentUser['fullName'] ?? 'User Biasa';
    $userEmail = $currentUser['email'] ?? 'user@telkomuniversity.ac.id';
    $assetName = $asset['asset_name'] ?? $data->assetName ?? 'Alat Lab';
    $purposeReason = $data->reason ?? $data->purpose ?? 'Keperluan Praktikum';

    // 📝 2. QUERY INSERT FINAL: Pas dan akurat dengan kolom returnTime baru yang ada di database!
    $sql = "INSERT INTO loans (user_id, userName, userEmail, asset_id, assetName, loan_date, return_date, purpose, borrowTime, returnTime, quantity, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'PENDING', ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $userId,
        $userName,
        $userEmail,
        (int)$data->assetId,
        $assetName,
        $startDate,
        $endDate,
        $purposeReason,
        $borrowTime,
        $returnTime, // Nilai jam selesai masuk ke kolom database woi!
        $purposeReason
    ]);

    // 📉 3. PROSES PENGURANGAN STOK QUANTITY (-1) KELOMPOK LU
    $newQty = $currentQty - 1;
    $metaData['qty'] = $newQty;
    $newEncodedDesc = "||META:" . base64_encode(json_encode($metaData)) . "|| " . $pureDesc;
    $newStatus = ($newQty <= 0) ? 'HABIS' : $asset['status'];

    // 🔥 4. SINKRONISASI UPDATE DATA STOK GANDA KE TABEL ASSETS
    $sqlUpdate = "UPDATE assets SET 
                    description = :description, 
                    deskripsi = :deskripsi,
                    status = :status,
                    QTY = :qty
                  WHERE id = :id";
    $stmtUpdate = $conn->prepare($sqlUpdate);
    $stmtUpdate->execute([
        ':description' => $newEncodedDesc,
        ':deskripsi'   => $newEncodedDesc,
        ':status'      => $newStatus,
        ':qty'         => $newQty, 
        ':id'          => (int)$data->assetId
      ]);

    echo json_encode(["status" => "success", "message" => "Permintaan izin peminjaman alat berhasil diajukan woi!"]);

} catch (PDOException $e) {
    error_log("request_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal eksekusi database: " . $e->getMessage()]);
}
?>
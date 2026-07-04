<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin', 'Dosen']); 

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (empty($data)) {
    $data = $_POST;
}

$name    = trim($data['name'] ?? $data['assetName'] ?? '');
$brand   = trim($data['brandType'] ?? $data['brand'] ?? '');
$sn      = trim($data['serialNumber'] ?? $data['sn'] ?? '');
$year    = isset($data['procurementYear']) ? (int)$data['procurementYear'] : (isset($data['year']) ? (int)$data['year'] : null);
$funding = trim($data['fundingSource'] ?? $data['funding'] ?? '');
$lab     = trim($data['lab'] ?? 'Ruangan Admin (Aset Kantor)');
$cat     = trim($data['category'] ?? 'Lainnya');
$cond    = trim($data['conditionStatus'] ?? 'Baik');

if (empty($name)) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Nama aset wajib diisi."
    ]);
    exit;
}

try {
    $sql = "INSERT INTO assets (
                name, brandType, serialNumber, procurementYear,
                fundingSource, lab, category, conditionStatus, status
            ) VALUES (
                :name, :brand, :sn, :year, :funding, :lab, :cat, :cond, 'AVAILABLE'
            )";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':name'    => $name,
        ':brand'   => $brand,
        ':sn'      => $sn,
        ':year'    => $year,
        ':funding' => $funding,
        ':lab'     => $lab,
        ':cat'     => $cat,
        ':cond'    => $cond
    ]);

    echo json_encode([
        "status"  => "success",
        "message" => "Aset '" . $name . "' berhasil disimpan ke database!"
    ]);
} catch (PDOException $e) {
    error_log("save_asset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal menyimpan aset ke database."]);
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin', 'Dosen']);

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id']) || empty($data['name'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID dan nama aset wajib diisi."]);
    exit;
}

try {
    $sql = "UPDATE assets SET
                name = :name,
                brandType = :brand,
                serialNumber = :sn,
                procurementYear = :year,
                fundingSource = :funding,
                lab = :lab,
                category = :cat,
                conditionStatus = :cond
            WHERE id = :id";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':name'    => trim($data['name']),
        ':brand'   => trim($data['brandType'] ?? ''),
        ':sn'      => trim($data['serialNumber'] ?? ''),
        ':year'    => (int)($data['procurementYear'] ?? 0),
        ':funding' => trim($data['fundingSource'] ?? ''),
        ':lab'     => trim($data['lab'] ?? 'Ruangan Admin (Aset Kantor)'),
        ':cat'     => trim($data['category'] ?? 'Lainnya'),
        ':cond'    => trim($data['conditionStatus'] ?? 'Baik'),
        ':id'      => $data['id']
    ]);

    echo json_encode(["status" => "success", "message" => "Aset berhasil diperbarui."]);
} catch (PDOException $e) {
    error_log("update_asset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memperbarui aset."]);
}
?>
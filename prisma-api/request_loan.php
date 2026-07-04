<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);

$data = json_decode(file_get_contents("php://input"));

if (
    empty($data->assetId) || empty($data->assetName) ||
    empty($data->startDate) || empty($data->endDate)
) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data peminjaman tidak lengkap."]);
    exit;
}

if (strtotime($data->endDate) < strtotime($data->startDate)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Tanggal kembali tidak boleh sebelum tanggal mulai."]);
    exit;
}

try {

    $checkAsset = $conn->prepare("SELECT status FROM assets WHERE id = ?");
    $checkAsset->execute([$data->assetId]);
    $asset = $checkAsset->fetch();

    if (!$asset) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Aset tidak ditemukan."]);
        exit;
    }
    if ($asset['status'] !== 'AVAILABLE') {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Aset sedang tidak tersedia untuk dipinjam."]);
        exit;
    }

$sql = "INSERT INTO loans
            (assetId, assetName, userId, userName, userEmail, loanDate, returnDate, purpose, borrowTime, quantity, status)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')";
$stmt = $conn->prepare($sql);
$stmt->execute([
    $data->assetId, $data->assetName, $currentUser['id'], $currentUser['fullName'],
    $currentUser['email'], $data->startDate, $data->endDate,
    $data->purpose ?? null, $data->borrowTime ?? null, $data->quantity ?? 1
]);

    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    error_log("request_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengirim permintaan peminjaman."]);
}
?>
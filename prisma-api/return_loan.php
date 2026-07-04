<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin', 'Dosen', 'Asisten Laboratorium']);

$data   = json_decode(file_get_contents('php://input'), true);
$loanId = $data['loanId'] ?? null;

if (!$loanId) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID peminjaman tidak ditemukan."]);
    exit;
}

try {
    $conn->beginTransaction();

    $check = $conn->prepare("SELECT assetId, status FROM loans WHERE id = ? FOR UPDATE");
    $check->execute([$loanId]);
    $loan = $check->fetch();

    if (!$loan || $loan['status'] !== 'APPROVED') {
        $conn->rollBack();
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Peminjaman ini tidak dalam status aktif."]);
        exit;
    }

    $updateLoan = $conn->prepare("UPDATE loans SET status = 'RETURNED', returnedAt = NOW() WHERE id = ?");
    $updateLoan->execute([$loanId]);

    $updateAsset = $conn->prepare("UPDATE assets SET status = 'AVAILABLE' WHERE id = ?");
    $updateAsset->execute([$loan['assetId']]);

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Aset berhasil dikembalikan."]);
} catch (PDOException $e) {
    $conn->rollBack();
    error_log("return_loan error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal memproses pengembalian."]);
}
?>
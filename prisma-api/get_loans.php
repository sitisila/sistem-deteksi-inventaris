<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);

try {
    // 🎯 Tarik seluruh data peminjaman dari MySQL kelompok lu
    $stmt = $conn->query("SELECT * FROM loans ORDER BY id DESC");
    $rawLoans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 🎯 FIX ENGINE SINKRONISASI: Memastikan properti status terbaca seragam oleh komponen ApprovalTab Admin woi
    $cleanLoans = array_map(function($loan) {
        // Fallback pencarian key status penulisan dari database kelompok lu
        $statusValue = $loan['status'] ?? $loan['Status'] ?? $loan['loan_status'] ?? 'PENDING';
        
        // Paksa isi properti agar seragam huruf besar murni agar filter di React tidak meleset
        $loan['status'] = strtoupper(trim($statusValue));
        
        return $loan;
    }, $rawLoans);

    echo json_encode($cleanLoans);
} catch (PDOException $e) {
    error_log("get_loans error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data peminjaman woi."]);
}
?>
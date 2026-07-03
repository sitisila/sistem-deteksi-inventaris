<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { 
    exit(0); 
} 

include 'config.php';


$loanId = $_GET['id'] ?? null;

if ($loanId) {
    try {
        
        $stmt = $conn->prepare("UPDATE loans SET status = 'REJECTED' WHERE id = ?");
        $stmt->execute([$loanId]);

        echo json_encode(["status" => "success", "message" => "Peminjaman ditolak"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID tidak ditemukan"]);
}
?>
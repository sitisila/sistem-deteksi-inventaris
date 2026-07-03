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
$assetId = $_GET['assetId'] ?? null;

if ($loanId && $assetId) {
    try {
        
        $stmt1 = $conn->prepare("UPDATE loans SET status = 'APPROVED' WHERE id = ?");
        $stmt1->execute([$loanId]);

        
        $stmt2 = $conn->prepare("UPDATE assets SET status = 'BORROWED' WHERE id = ?");
        $stmt2->execute([$assetId]);

        echo json_encode(["status" => "success", "message" => "Peminjaman disetujui!"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
}
?>
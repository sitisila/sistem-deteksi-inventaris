<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if ($data) {
    try {
        $sql = "INSERT INTO loans (assetId, assetName, userId, userName, loanDate, returnDate, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'PENDING')";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data->assetId,
            $data->assetName,
            $data->userId,
            $data->userName,
            $data->loanDate,
            $data->returnDate
        ]);
        echo json_encode(["status" => "success"]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
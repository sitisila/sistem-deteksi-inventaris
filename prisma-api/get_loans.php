<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'config.php';

try {
    $stmt = $conn->query("SELECT * FROM loans ORDER BY id DESC");
    $loans = $stmt->fetchAll();
    echo json_encode($loans);
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
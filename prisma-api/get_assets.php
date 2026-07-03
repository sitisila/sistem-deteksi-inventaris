<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { 
    exit(0); 
} 

include 'config.php';

try {
    $stmt = $conn->query("SELECT * FROM assets");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)); 
} catch(PDOException $e) {
    echo json_encode([]);
}
?>
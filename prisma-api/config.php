<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "prisma_fit"; 

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Koneksi Database Gagal: " . $e->getMessage()]);
    exit;
}
?>
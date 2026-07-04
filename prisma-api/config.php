<?php
$host = "localhost";
$user = "root";
$password = ""; 
$dbname = "prisma_fit"; 

try {
    // Mengubah koneksi menjadi PDO agar cocok dengan perintah di login.php dan admin_users.php
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    
    // Mengatur mode error PDO ke Exception agar jika ada query salah bisa terlacak dengan baik
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    // Jika koneksi gagal, kirim respons error dalam bentuk JSON agar tidak memutus koneksi aplikasi
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi database gagal: " . $e->getMessage()
    ]);
    exit;
}
?>
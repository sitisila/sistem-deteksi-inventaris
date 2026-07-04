<?php
// Pengaturan CORS agar React (localhost:3000) tidak diblokir saat memanggil API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Konfigurasi Database (Menggunakan Environment Variable atau Default Lokal Laragon)
$host   = getenv('DB_HOST') ?: "localhost";
$user   = getenv('DB_USER') ?: "root";
$pass   = getenv('DB_PASS') ?: "";
$dbname = getenv('DB_NAME') ?: "prisma_fit"; // Tetap mengarah ke database prisma_fit Anda

try {
    // Koneksi menggunakan driver PDO (Kompatibel dengan login.php dan admin_users.php)
    $conn = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass
    );
    
    // Konfigurasi keamanan dan standar fetch PDO bawaan teman Anda
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

} catch (PDOException $e) {
    // Mencatat log error di server
    error_log("Koneksi Database Gagal: " . $e->getMessage());

    // Mengirim respons JSON yang rapi ke React jika koneksi gagal
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        "status"   => "error",
        "message" => "Koneksi ke server database gagal. Silakan hubungi administrator."
    ]);
    exit;
}
?>
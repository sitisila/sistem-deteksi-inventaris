<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        
        // ✔ PERBAIKAN: Memaksa fetch menjadi Array Asosiatif agar aman saat dibaca oleh $user['password']
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // ✔ PERBAIKAN: Mendukung dua metode (Password teks biasa ATAU Password Bcrypt Hash)
            // Ini agar akun manual phpMyAdmin teks biasa maupun akun registrasi hash bisa masuk dua-duanya
            $isPasswordValid = ($data->password === $user['password']) || password_verify($data->password, $user['password']);

            if ($isPasswordValid) {
                // Menyembunyikan password hash sebelum dikirim ke frontend React demi keamanan
                unset($user['password']); 
                
                echo json_encode([
                    "status" => "success", 
                    "user" => $user
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Email dan Password wajib diisi!"]);
}
?>
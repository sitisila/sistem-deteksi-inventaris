<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); } 

$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "prisma_fit";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_host == 'localhost' ? $db_user : 'root', $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Gagal koneksi database Laragon: " . $e->getMessage()
    ]);
    exit;
}

include 'config.php';
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin']);

$method = $_SERVER['REQUEST_METHOD'];

// 1. MENANGANI METHOD GET
if ($method === 'GET') {
    $users = []; 
    try {
        $sql = "SELECT id, name, username, email, phone, role FROM users ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formattedUsers = array_map(function($user) {
            return [
                "id" => $user['id'],
                "name" => $user['name'],
                "fullName" => $user['name'],
                "username" => $user['username'],
                "email" => $user['email'],
                "phone" => $user['phone'],
                "phoneNumber" => $user['phone'],
                "role" => $user['role']
            ];
        }, $users);

        echo json_encode([
            "status" => "success",
            "data" => $formattedUsers
        ]);
    } catch(PDOException $e) {
        http_response_code(500); 
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
    exit;
}

// 2. MENANGANI METHOD POST (Dengan pemetaan payload super fleksibel)
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Menangkap variasi nama properti ID
    $targetUserId = $data->userId ?? $data->id ?? $data->user_id ?? null;
    
    // 🔍 SOLUSI BARU: Menangkap variasi nama properti role (menampung 'role' atau 'newRole')
    $targetRole   = $data->role ?? $data->newRole ?? null;

    if (!empty($targetUserId) && !empty($targetRole)) {
        try {
            // Update role di tabel users berdasarkan ID yang ditemukan
            $sql = "UPDATE users SET role = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$targetRole, $targetUserId]);

            echo json_encode([
                "status" => "success",
                "message" => "Role berhasil diperbarui!"
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal memperbarui database: " . $e->getMessage()
            ]);
        }
    } else {
        http_response_code(400);
        // Menyertakan data mentah yang diterima agar kita bisa tahu apa isi kiriman dari React
        echo json_encode([
            "status" => "error",
            "message" => "Data tidak lengkap.",
            "debug_received" => $data
        ]);
    }
    exit;
}
?>
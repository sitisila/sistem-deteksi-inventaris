<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php'; 
include 'auth.php';

$currentUser = requireAuth($conn);
requireRole($currentUser, ['Admin']); 

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "SELECT id, fullName, username, email, phoneNumber, nim, role FROM users ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $users]);
    } catch (PDOException $e) {
        error_log("admin_users GET error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal mengambil data pengguna."]);
    }
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->userId) && !empty($data->newRole)) {
        $userId  = $data->userId;
        $newRole = $data->newRole;

        $allowedRoles = ['Mahasiswa', 'Asisten Laboratorium', 'Dosen', 'Admin'];
        if (!in_array($newRole, $allowedRoles, true)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Role tidak valid."]);
            exit;
        }

        if ((string)$userId === (string)$currentUser['id']) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Tidak dapat mengubah role akun sendiri."]);
            exit;
        }

        try {
            $sql = "UPDATE users SET role = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$newRole, $userId]);

            echo json_encode([
                "status"  => "success",
                "message" => "Role berhasil diperbarui menjadi " . $newRole
            ]);
        } catch (PDOException $e) {
            error_log("admin_users POST error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memperbarui role."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
    }
    exit;
}
?>
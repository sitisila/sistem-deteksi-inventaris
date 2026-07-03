<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); } 

$db_host = "localhost";
$db_user = "root";       
$db_pass = "";           
$db_name = "prisma-api"; 

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Gagal koneksi database Laragon: " . $e->getMessage()
    ]);
    exit;
}


$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "SELECT id, fullName, username, email, phoneNumber, nim, role FROM users ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $users
        ]);
    } catch(PDOException $e) {
        http_response_code(500); 
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->userId) && !empty($data->newRole)) {
        try {
            $userId = $data->userId;
            $newRole = $data->newRole;

            $allowedRoles = ['Mahasiswa', 'Asisten Laboratorium', 'Dosen', 'Admin'];
            if (!in_array($newRole, $allowedRoles)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Role tidak valid."]);
                exit;
            }

            $sql = "UPDATE users SET role = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$newRole, $userId]);

            echo json_encode([
                "status" => "success",
                "message" => "Role berhasil diperbarui menjadi " . $newRole
            ]);
        } catch(PDOException $e) {
            http_response_code(500); 
            echo json_encode(["status" => "error", "message" => "Update Error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
    }
    exit;
}
?>
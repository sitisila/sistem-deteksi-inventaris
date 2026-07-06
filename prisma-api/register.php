<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->fullName) &&
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->phoneNumber) &&
    !empty($data->nim)
) {
    // Mapping data dari frontend ke format kolom database ril lu woi
    $name        = trim($data->fullName);     // Masuk ke kolom 'name'
    $username    = trim($data->username);     // Masuk ke kolom 'username'
    $email       = trim(strtolower($data->email)); 
    $password    = $data->password;
    $phone       = trim($data->phoneNumber);  // Masuk ke kolom 'phone'
    $nim         = trim($data->nim);          // Masuk ke kolom 'nim' yang baru ditambah

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format email tidak valid."]);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Password minimal 8 karakter."]);
        exit;
    }

    $role = "";
    if (str_ends_with($email, '@student.telkomuniversity.ac.id')) {
        $role = 'mahasiswa';
    } elseif (str_ends_with($email, '@employee.telkomuniversity.ac.id')) {
        $role = 'dosen';
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Gunakan email resmi Telkom University."]);
        exit;
    }

    try {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $check->execute([$email, $username]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email atau username sudah terdaftar."]);
            exit;
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // 🎯 QUERY FIX: Sesuai nama kolom asli di gambar database phpMyAdmin lu woi!
        $sql = "INSERT INTO users (name, username, email, password, phone, nim, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$name, $username, $email, $hashedPassword, $phone, $nim, $role]);

        echo json_encode(["status" => "success", "message" => "Registrasi berhasil sebagai " . $role]);
    } catch (PDOException $e) {
        error_log("Register error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Registrasi gagal: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap woi."]);
}
?>
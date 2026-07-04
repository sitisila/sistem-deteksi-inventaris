<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $email    = trim($data->email);
    $password = $data->password;

    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        $isValid = false;

        if ($user) {

            if (password_verify($password, $user['password'])) {
                $isValid = true;
            }

            elseif ($password === $user['password']) {
                $isValid = true;
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $update->execute([$newHash, $user['id']]);
            }
        }

        if ($isValid) {
            $token     = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

            $tokenStmt = $conn->prepare(
                "INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
            );
            $tokenStmt->execute([$user['id'], $token, $expiresAt]);

            unset($user['password']); 

            echo json_encode([
                "status" => "success",
                "user"   => $user,
                "token"  => $token
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
        }
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Terjadi kesalahan pada server."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email dan password wajib diisi."]);
}
?>
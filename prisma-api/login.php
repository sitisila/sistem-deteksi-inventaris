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
        $user = $stmt->fetch();

        if ($user && $data->password === $user['password']) {
            echo json_encode(["status" => "success", "user" => $user]);
        } else {
            echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
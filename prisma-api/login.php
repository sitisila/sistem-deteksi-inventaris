<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }

include 'config.php';
// Menyertakan file autentikasi tambahan dari update teman Anda jika ada
if (file_exists('auth.php')) { include 'auth.php'; }

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $isPasswordValid = ($data->password === $user['password']) || password_verify($data->password, $user['password']);

            if ($isPasswordValid) {
                unset($user['password']); 
                
                // Logika pembuatan Token JWT / Session baru dari teman Anda (jika fungsi generateToken ada)
                $token = null;
                if (function_exists('generateToken')) {
                    $token = generateToken($user);
                }
                
                $response = ["status" => "success", "user" => $user];
                if ($token) { $response["token"] = $token; }
                
                echo json_encode($response);
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

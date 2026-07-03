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
    try {
        $email = $data->email;
        $role = "";


        if (str_ends_with($email, '@student.telkomuniversity.ac.id')) {
            $role = 'Mahasiswa';
        } 
        elseif (str_ends_with($email, '@employee.telkomuniversity.ac.id')) {
            $role = 'Dosen';
        } 
        else {

            http_response_code(400);
            echo json_encode([
                "status" => "error", 
                "message" => "Gunakan email resmi Telkom University."
            ]);
            exit;
        }

        $sql = "INSERT INTO users (fullName, username, email, password, phoneNumber, nim, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data->fullName, 
            $data->username,
            $email,
            $data->password, 
            $data->phoneNumber,
            $data->nim,
            $role 
        ]);
        
        echo json_encode(["status" => "success"]);

    } catch(PDOException $e) {
        http_response_code(500); 
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
?>
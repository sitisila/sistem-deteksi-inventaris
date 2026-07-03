<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include 'config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (empty($data)) {
    $data = $_POST;
}

$wrappers = ['assetData', 'formData', 'data', 'payload', 'asset', 'newAsset'];
foreach ($wrappers as $wrapper) {
    if (isset($data[$wrapper])) {
        if (is_string($data[$wrapper])) {
            $decoded = json_decode($data[$wrapper], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data = $decoded;
                break;
            }
        } else if (is_array($data[$wrapper])) {
            $data = $data[$wrapper];
            break;
        }
    }
}

$name    = $data['name'] ?? $data['assetName'] ?? null;
$brand   = $data['brandType'] ?? $data['brand'] ?? null; 
$sn      = $data['serialNumber'] ?? $data['sn'] ?? null;
$year    = $data['procurementYear'] ?? $data['year'] ?? null;
$funding = $data['fundingSource'] ?? $data['funding'] ?? null;
$lab     = $data['lab'] ?? 'Ruangan Admin (Aset Kantor)';
$cat     = $data['category'] ?? 'Lainnya';
$cond    = $data['conditionStatus'] ?? 'Baik';

if (empty($name)) {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal: Kolom 'name' tidak terbaca oleh server atau bernilai kosong.",
        "data_terbaca_php" => $data
    ]);
    exit;
}

try {
    $sql = "INSERT INTO assets (
                name, 
                brandType, 
                serialNumber, 
                procurementYear, 
                fundingSource, 
                lab, 
                category, 
                conditionStatus, 
                status
            ) VALUES (
                :name, 
                :brand, 
                :sn, 
                :year, 
                :funding, 
                :lab, 
                :cat, 
                :cond, 
                'AVAILABLE'
            )";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':name'    => $name,
        ':brand'   => $brand, 
        ':sn'      => $sn,
        ':year'    => $year,
        ':funding' => $funding,
        ':lab'     => $lab,
        ':cat'     => $cat,
        ':cond'    => $cond
    ]);

    echo json_encode([
        "status" => "success", 
        "message" => "Aset '" . $name . "' berhasil disimpan ke database!"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Database Error: " . $e->getMessage()
    ]);
}
?>
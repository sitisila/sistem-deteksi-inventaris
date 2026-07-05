<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

include 'config.php';
include 'auth.php';

// Validasi token sesi user logined
$currentUser = requireAuth($conn);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->loanId) || empty($data->assetId) || empty($data->photo)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Seluruh kolom formulir dan foto bukti wajib diisi woi."]);
    exit;
}

try {
    // 1. Gabungkan data ke string formal (Menggunakan Baik / Layak, dll)
    $chosenCondition = !empty($data->condition) ? $data->condition : 'Baik / Layak';
    $finalNotes = "Kondisi: " . $chosenCondition . " | Catatan: " . $data->notes . " | Foto Bukti: " . $data->photo;
    
    // Update status transaksi log peminjaman di tabel loans menjadi DIKEMBALIKAN
    $stmt = $conn->prepare("UPDATE loans SET status = 'DIKEMBALIKAN', notes = ? WHERE id = ?");
    $stmt->execute([$finalNotes, (int)$data->loanId]);

    // 2. Ambil metadata base64 aset saat ini untuk menambahkan stok kembali (+1) woi
    $checkAsset = $conn->prepare("SELECT description, deskripsi, status FROM assets WHERE id = ?");
    $checkAsset->execute([(int)$data->assetId]);
    $asset = $checkAsset->fetch(PDO::FETCH_ASSOC);

    if ($asset) {
        $descriptionStr = $asset['description'] ?? $asset['deskripsi'] ?? '';
        $currentQty = 0;
        $metaData = [];
        $pureDesc = '';

        if (!empty($descriptionStr) && strpos($descriptionStr, '||META:') !== false) {
            $parts = explode('||', $descriptionStr);
            foreach ($parts as $part) {
                if (strpos($part, 'META:') === 0) {
                    $base64Str = str_replace('META:', '', $part);
                    $metaData = json_decode(base64_decode($base64Str), true) ?? [];
                    $currentQty = isset($metaData['qty']) ? (int)$metaData['qty'] : 0;
                }
            }
            $pureDesc = isset($metaData['desc']) ? $metaData['desc'] : '';
        }

        // Hitung kuantitas stok bertambah balik (+1) karena barang telah kembali
        $newQty = $currentQty + 1;
        
        // Perbarui data kondisi kelayakan di dalam JSON Meta Data agar sinkron saat dibaca
        $metaData['qty'] = $newQty;
        $metaData['condition'] = $chosenCondition; 

        $newEncodedDesc = "||META:" . base64_encode(json_encode($metaData)) . "|| " . $pureDesc;
        $newStatus = ($newQty > 0) ? 'TERSEDIA' : $asset['status'];

        // Update data stok dan deskripsi base64 ke tabel assets
        $sqlUpdate = "UPDATE assets SET description = :description, deskripsi = :deskripsi, status = :status, QTY = :qty WHERE id = :id";
        $stmtUpdate = $conn->prepare($sqlUpdate);
        $stmtUpdate->execute([
            ':description' => $newEncodedDesc,
            ':deskripsi'   => $newEncodedDesc,
            ':status'      => $newStatus,
            ':qty'         => $newQty, 
            ':id'          => (int)$data->assetId
        ]);
    }

    echo json_encode(["status" => "success", "message" => "Barang berhasil dikembalikan woi!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengeksekusi ke database: " . $e->getMessage()]);
}
?>
<?php
header('Content-Type: application/json; charset=utf-8');

// เชื่อมต่อฐานข้อมูล
include('conn.php'); // หรือไฟล์เชื่อมต่อ DB ของคุณ

// ตรวจสอบว่ามี user_id ส่งมาหรือไม่
if (!isset($_GET['user_id']) || empty($_GET['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ไม่พบ user_id'
    ]);
    exit;
}

$user_id = intval($_GET['user_id']);

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    // Query ดึงข้อมูลการจองของ user นั้นๆ เรียงจากใหม่ไปเก่า
    $sql = "
        SELECT 
            ra.*, 
            r.room_name, 
            ts.table_style_id, 
            ts.Table_style, 
            g.id_group, 
            g.groupname
        FROM room_appoinment ra
        LEFT JOIN room r ON ra.room_id = r.room_id
        LEFT JOIN table_style ts ON ra.table_style_id = ts.table_style_id    
        LEFT JOIN groupwork g ON ra.id_group = g.id_group
        WHERE ra.create_user = :user_id
        ORDER BY ra.start_time DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id]);

    $bookings = [];

    while ($row = $stmt->fetch()) {
        $row['Mic'] = !empty($row['Mic']);
        $row['Projector'] = !empty($row['Projector']);
        $row['TeleV'] = !empty($row['TeleV']);
        $row['video_conference'] = !empty($row['video_conference']);
        $row['streaming'] = !empty($row['streaming']);
        $row['take_photo'] = !empty($row['take_photo']);

        $row['room_appoinment_id'] = (int)$row['room_appoinment_id'];
        $row['room_id'] = (int)$row['room_id'];
        $row['table_style_id'] = (int)$row['table_style_id'];
        $row['id_group'] = (int)$row['id_group'];
        $row['num_attendees'] = (int)$row['num_attendees'];
        $row['internet_num'] = (int)$row['internet_num'];
        $row['computer_num'] = (int)$row['computer_num'];
        $row['create_user'] = (int)$row['create_user'];

        $bookings[] = $row;
    }

    echo json_encode($bookings, JSON_UNESCAPED_UNICODE);
    exit;

    
} catch (Exception $e) {
    // กรณีเกิดข้อผิดพลาด
    echo json_encode([
        'status' => 'error',
        'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' . $e->getMessage()
    ]);
}
?>
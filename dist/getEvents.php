<?php
header("Content-Type: application/json; charset=UTF-8");

 include 'conn.php';

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

   $sql = "SELECT ra.*,r.room_name,ts.Table_style,gw.groupname
        FROM room_appoinment ra 
        LEFT JOIN table_style ts on ra.table_style_id=ts.table_style_id
        LEFT JOIN room r on ra.room_id=r.room_id
        LEFT JOIN groupwork gw on ra.id_group=gw.id_group
        ORDER BY ra.start_time ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

<?php
header("Content-Type: application/json; charset=UTF-8");

if(!isset($_POST["id"])) {
    echo json_encode(["status" => "error", "msg" => "Missing ID"]);
    exit();
}

$eventID = $_POST["id"];
$host = "127.0.0.1";
$dbname = "appointment_reminder_system";
$user = "root";
$pass = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8",
    $user,
    $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );


    $sql = "DELETE FROM room_appoinment WHERE room_appoinment_id  = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":id", $eventID, PDO::PARAM_INT);

    if($stmt->execute()){
        echo json_encode(["status" => "success", "msg" => "Deleted"]);
    } else {
        echo json_encode(["status" => "error", "msg" => "Delete failed"]);
    }

} catch(PDOException $e){
    echo json_encode(["status" => "error", "msg" => $e->getMessage()]);
}

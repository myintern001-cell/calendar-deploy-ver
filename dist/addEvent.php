<?php
header("Content-Type: application/json; charset=UTF-8");

include 'conn.php';

try {
    // ========== CONNECT DB ==========
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    // ========== รับค่าจาก AJAX ==========
    $create_user = $_POST["create_user"];
    $epurpose     = $_POST["epurpose"];
    $ename        = $_POST["ename"];
    $ephone       = $_POST["ephone"];
    $egroupwork   = $_POST["egroupwork"];
    $edate        = $_POST["edate"];
    $eroom        = $_POST["eroom"];
    $enum_person  = $_POST["enum_person"];
    $etime_start  = $_POST["etime_start"];
    $etime_end    = $_POST["etime_end"];
    $etable       = $_POST["etable"];
    $etable_other = $_POST["etable_other"] ?? null;
    $eroom_other  = $_POST["eroom_other"] ?? null;
    $eannounce    = $_POST["eannounce"];

    // checkbox (ถ้าไม่ได้ติ๊ก = 0)
    $Mic              = isset($_POST["Mic"]) ? 1 : 0;
    $TeleV            = isset($_POST["TeleV"]) ? 1 : 0;
    $take_photo       = isset($_POST["take_photo"]) ? 1 : 0;
    $video_conference = isset($_POST["video_conference"]) ? 1 : 0;
    $streaming        = isset($_POST["streaming"]) ? 1 : 0;
    $Projector        = isset($_POST["Projector"]) ? 1 : 0;

    $internet_user   = $_POST["internet_user"] ?? 0;
    $computer_count  = $_POST["computer_count"] ?? 0;

        // รวมวันที่ + เวลาเป็น DATETIME
    $startDT = $edate . " " . $etime_start . ":00";
    $endDT   = $edate . " " . $etime_end   . ":00";

    // ========== ดึงข้อมูลมาเช็คเวลา ==========
    $sql1 ="SELECT room_appoinment_id,room_id,start_time,end_time,room_comment
            FROM room_appoinment 
            WHERE DATE(start_time) = :edate 
            AND room_id = :room_id";
    $stmt1 = $pdo->prepare($sql1);
    $stmt1->execute([
        'edate' => $edate,
        'room_id' => $eroom
    ]);
    $row1 = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    $appointmentByID = [];

    foreach ($row1 as $row) {
        // ให้รองรับหลาย event ต่อ id
        if ($row['room_comment']===$eroom_other) {
            $appointmentByID[$row['room_appoinment_id']][] = [
            'start' => $row['start_time'],
            'end'   => $row['end_time'],
            'room'  => $row['room_id']
        ];
        }
    }

    // ฟังก์ชันเช็คซ้อน
    function isTimeOverlap($appointmentByID, $startDT, $endDT) {

        $nStart = strtotime($startDT);
        $nEnd   = strtotime($endDT);

        foreach ($appointmentByID as $id => $events) {
            foreach ($events as $ev) {

                $oldStart = strtotime($ev['start']);
                $oldEnd   = strtotime($ev['end']);

                if ($nStart < $oldEnd && $nEnd > $oldStart) {
                    return [
                        "status" => true,
                        "id"     => $id,
                        "start"  => $ev['start'],
                        "end"    => $ev['end']
                    ];
                }
            }
        }

        return ["status" => false];
    }
    // ========== ถ้า Time ไม่ overlap จะบันทึกข้อมูลลง table room_appointment==========
    $check_overlap = isTimeOverlap($appointmentByID,$startDT,$endDT);

    if ($check_overlap['status']===false) {
        $sql2 = "INSERT INTO room_appoinment (
                    room_id, table_style_id, id_group, table_comment,
                    room_comment, purpose, applicant_name, applicant_phone_number,
                    num_attendees,announcement_date, start_time,end_time,
                    Mic, TeleV, take_photo, video_conference,
                    streaming, Projector, internet_num, computer_num , create_user
                ) VALUES (
                    :room_id, :table_style_id, :id_group, :table_comment,
                    :room_comment, :purpose, :applicant_name, :applicant_phone_number,
                    :num_attendees, :announcement_date, :start_time,:end_time,
                    :Mic, :TeleV, :take_photo, :video_conference,
                    :streaming, :Projector, :internet_num, :computer_num , :create_user 
                )";

        $stmt2 = $pdo->prepare($sql2);

        $stmt2->execute([
            ":room_id"                  => $eroom,
            ":table_style_id"           => $etable,
            ":id_group"                 => $egroupwork,
            ":table_comment"            => $etable_other,
            ":room_comment"             => $eroom_other,
            ":purpose"                  => $epurpose,
            ":applicant_name"           => $ename,
            ":applicant_phone_number"   => $ephone,
            ":num_attendees"            => $enum_person,
            ":announcement_date"        => $eannounce,
            ":start_time"               => $startDT,
            ":end_time"                 => $endDT,
            ":Mic"                      => $Mic,
            ":TeleV"                    => $TeleV,
            ":take_photo"               => $take_photo,
            ":video_conference"         => $video_conference,
            ":streaming"                => $streaming,
            ":Projector"                => $Projector,
            ":internet_num"             => $internet_user,
            ":computer_num"             => $computer_count, 
            ":create_user"              => $create_user
        ]);

        echo json_encode([
            "status" => "success",
            "isoverlap" => false
        ]);
    } else {
         echo json_encode([
            "status" => "error",
            "isoverlap" => true
        ]);
    }

        


} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

<?php
        session_start();
        if (!isset($_SESSION['userID'])) {
            header("Location: ../../comcen/admin/login.php");
        }

try {
    
    $link = mysqli_connect('localhost','root','14199LBCH$','comcen');
    mysqli_set_charset($link, 'utf8');



        $session_userID = $_SESSION['userID'];

        $qry_user = "SELECT * FROM user 
                      left join  groupwork on user.groupwork = groupwork.id_group 
                      WHERE userID='$session_userID' ";
        $result_user = mysqli_query($link,$qry_user);
        if ($result_user) {
            $row_user = mysqli_fetch_array($result_user,MYSQLI_ASSOC);

            $s_userName = $row_user['userName'];
            $s_userFullname = $row_user['userFullname'];
            $s_userPicture = $row_user['userPicture'];
            $s_admin = $row_user['userName'];
            $s_userPosition = $row_user['userPosition'];
            
            
            $s_groupwork = $row_user["groupwork"];
            mysqli_free_result($result_user);
        }
        else {
            echo 'การเชื่อมต่อผิดพลาด';
        }
        
        //echo $session_userID ;
        //echo $session_userID  ;
       // echo $s_userFullname  ;

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
<?php
// session_start();
// include('session.php');

// ตรวจสอบว่า user login หรือยัง
// if (!isset($_SESSION['userID'])) {
//     header("Location: login.php");
//     exit();
// }

// $session_userID = $_SESSION['userID'];
// $s_userFullname = $_SESSION['userFullname'];
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>การจองของฉัน - ระบบจองห้องประชุม</title>
    <link rel="stylesheet" href="./assests/css/bootstrap.min.css">
    <link rel="stylesheet" href="./assests/css/bootstrap-icons.min.css">
    <link rel="stylesheet" href="./assests/css/all.min.css">
    <link rel="stylesheet" href="./assests/css/sweetalert2.min.css">
    <link rel="stylesheet" href="./assests/css/select2.min.css">
    <link rel="stylesheet" href="./assests/css/select2-bootstrap-5-theme.min.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./my-bookings.css">
</head>
<body>
    <!-- page wrapper -->
    <div class="page-wrapper">
        <!-- Hamburger Button (แสดงเฉพาะมือถือ) -->
        <button class="hamburger-btn" id="hamburger-btn" aria-label="เปิดเมนู">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Backdrop (สำหรับปิด Sidebar เมื่อคลิกข้างนอก) -->
        <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-calendar-check" style="font-size: 24px;"></i>
                <div>
                    <a href="http://10.19.9.13/comcen/user/user_select.php" class="booking-link">
                        <h5 class="mb-0">ระบบจอง</h5>
                        <small>ห้องประชุม LBCH</small>
                    </a>
                </div>
            </div>
            <ul class="sidebar-menu">
                <li><a href="index.php"><i class="bi bi-house"></i> หน้าปฏิทิน</a></li>
                <li><a href="my-bookings.php" class="active"><i class="bi bi-person-circle"></i> การจองของฉัน</a></li>
                <li><a href="index.php#recent-bookings"><i class="bi bi-calendar3"></i> รายการจองทั้งหมด</a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="my-bookings-header">
                <div>
                    <h2 class="mb-1">
                        <i class="bi bi-person-circle"></i> การจองของฉัน
                    </h2>
                    <p class="text-muted">จัดการและดูรายการจองห้องประชุมของคุณ</p>
                </div>
                <div class="header-stats">
                    <div class="stat-card stat-upcoming">
                        <i class="bi bi-calendar-event"></i>
                        <div>
                            <h3 id="upcomingCount">0</h3>
                            <p>กำลังจะมาถึง</p>
                        </div>
                    </div>
                    <div class="stat-card stat-past">
                        <i class="bi bi-calendar-check"></i>
                        <div>
                            <h3 id="pastCount">0</h3>
                            <p>เสร็จสิ้นแล้ว</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs">
                <button class="filter-tab active" data-filter="all">
                    <i class="bi bi-list-ul"></i> ทั้งหมด
                    <span class="tab-badge" id="allCount">0</span>
                </button>
                <button class="filter-tab" data-filter="upcoming">
                    <i class="bi bi-calendar-event"></i> กำลังจะมาถึง
                    <span class="tab-badge" id="upcomingBadge">0</span>
                </button>
                <button class="filter-tab" data-filter="past">
                    <i class="bi bi-calendar-check"></i> เสร็จสิ้นแล้ว
                    <span class="tab-badge" id="pastBadge">0</span>
                </button>
            </div>

            <!-- Search Bar (Desktop) -->
            <div class="desktop-search-bar">
                <div class="search-input-wrapper">
                    <i class="bi bi-search"></i>
                    <input type="text" 
                           class="form-control" 
                           id="desktopSearchInput" 
                           placeholder="ค้นหาจากวัตถุประสงค์, ห้องประชุม, วันที่...">
                </div>
            </div>

            <!-- Search Bar (Mobile) -->
            <div class="mobile-search-bar">
                <input type="text" 
                       class="form-control" 
                       id="mobileSearchInput" 
                       placeholder="🔍 ค้นหาการจอง...">
            </div>

            <!-- Desktop Table View -->
            <div class="bookings-table-container">
                <div class="table-responsive">
                    <table class="table" id="myBookingsTable">
                        <thead>
                            <tr>
                                <th>สถานะ</th>
                                <th>วันที่</th>
                                <th>เวลา</th>
                                <th>ห้องประชุม</th>
                                <th>วัตถุประสงค์</th>
                                <th>ผู้เข้าร่วม</th>
                                <th class="text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="bookingsTableBody">
                            <!-- จะถูกสร้างด้วย JS -->
                        </tbody>
                    </table>
                </div>

                <!-- Empty State -->
                <div id="noBookings" class="bookings-empty" style="display: none;">
                    <i class="bi bi-calendar-x"></i>
                    <h5>ยังไม่มีการจอง</h5>
                    <p>คุณยังไม่มีการจองห้องประชุมในขณะนี้</p>
                    <a href="index.php" class="btn btn-primary mt-3">
                        <i class="bi bi-plus-lg"></i> เพิ่มการจองใหม่
                    </a>
                </div>

                <!-- No Results State -->
                <div id="noResults" class="bookings-empty" style="display: none;">
                    <i class="bi bi-search"></i>
                    <h5>ไม่พบรายการที่ค้นหา</h5>
                    <p>ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
                </div>

                <!-- Loading State -->
                <div id="loadingState" class="bookings-loading">
                    <i class="bi bi-arrow-repeat"></i>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            </div>

            <!-- Mobile Card View -->
            <div class="bookings-cards-container" id="bookingsCardsContainer">
                <!-- จะถูกสร้างด้วย JS -->
            </div>

        </div>
    </div>

    <!-- Event Detail Modal -->
    <div class="modal fade" id="eventModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">รายละเอียดการจอง</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="eventModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="btn-print-report">
                        <i class="bi bi-printer"></i> พิมพ์รายงาน
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Event Modal -->
    <div class="modal fade" id="editEventModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <form id="edit-event-form">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-pencil-square"></i> แก้ไขการจอง
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-booking-id" name="booking_id">
                        
                        <!-- แสดงข้อมูลแบบเดียวกับ Add Modal -->
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>หมายเหตุ:</strong> คุณสามารถแก้ไขข้อมูลได้ก่อนกิจกรรมเริ่ม
                        </div>

                        <!-- ใส่ form fields เหมือน Add Modal ตรงนี้ -->
                        <div class="mb-3">
                            <label class="form-label">วัตถุประสงค์การประชุม</label>
                            <textarea class="form-control" name="purpose" rows="3" required></textarea>
                        </div>
                        <!-- เพิ่ม fields อื่นๆ ตามต้องการ -->
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-success">
                            <i class="bi bi-check-circle"></i> บันทึกการแก้ไข
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="main-footer">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6 text-start">
                    <p class="mb-0">
                        <i class="bi bi-calendar-check me-2"></i>
                        <strong>ระบบจองห้องประชุม</strong> © 2025
                    </p>
                </div>
                <div class="col-md-6 text-end">
                    <p class="mb-0">
                        Developed by <strong>Me</strong>
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <script src="./assests/js/jquery.min.js"></script>
    <script src="./assests/js/bootstrap.bundle.min.js"></script>
    <script src="./assests/js/sweetalert2@11.js"></script>
    <script src="./assests/js/select2.min.js"></script>
    <script src="./assests/js/pdf-lib.min.js"></script>
    <script src="./assests/js/fontkit.umd.min.js"></script>
    <script src="./assests/pdfGenerator.js"></script>
    <script src="./my-bookings.js"></script>
</body>
</html>
<?php

//include('session.php');

?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบจองห้องประชุม</title>
    <link rel="stylesheet" href="./assests/css/bootstrap.min.css">
    <link rel="stylesheet" href="./assests/css/bootstrap-icons.min.css">
    <link rel="stylesheet" href="./assests/css/all.min.css">
    <link rel="stylesheet" href="./assests/css/sweetalert2.min.css">444
    <link rel="stylesheet" href="./assests/css/select2.min.css">
    <link rel="stylesheet" href="./assests/css/select2-bootstrap-5-theme.min.css">
    <link rel="stylesheet" href="./style.css">
</head>
<body >
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
                <li><a href="#" ><i class="bi bi-house"></i> หน้าปฏิทิน</a></li>
                <li><a href="#" id="menu-recent-bookings"><i class="bi bi-calendar3"></i> รายการจองทั้งหมด</a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="calendar-header">
                <div>
                    <h2 class="mb-1">ปฏิทิน</h2>
                    <p class="text-muted">ดูรายการจองห้องประชุมแบบปฏิทิน</p>
                </div>
                <div class="d-flex gap-3">

                    <? echo $session_userID; echo $s_userFullname; ?>
                    <button class="btn btn-outline-primary" onclick="showTodayView()">
                        <i class="bi bi-calendar-day"></i> วันนี้
                    </button>
                    <button class="btn btn-primary" onclick="showAddModal()">
                        <i class="bi bi-plus-lg"></i> เพิ่มการจอง
                    </button>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="month-nav">
                    <button onclick="prevMonth()"><i class="bi bi-chevron-left"></i></button>
                    <h4 id="currentMonth" class="mb-0"></h4>
                    <button onclick="nextMonth()"><i class="bi bi-chevron-right"></i></button>
                </div>
                
                <!-- Legend Container -->
                <div class="legend-container">
                    <!-- Legend Wrapper -->
                    <div class="legend-wrapper" id="legendWrapper">
                        <div class="legend-scroll">
                            <div class="legend">
                                <span class="legend-item room-1">
                                    <span class="legend-dot"></span>
                                    <span>อำนวยการ </span>
                                </span>
                                <span class="legend-item room-2">
                                    <span class="legend-dot"></span>
                                    <span>สิริศักดิ์ ภูริพัฒน์</span>
                                </span>
                                <span class="legend-item room-3">
                                    <span class="legend-dot"></span>
                                    <span>พระวิสุทธาธิบดี</span>
                                </span>
                                <span class="legend-item room-4">
                                    <span class="legend-dot"></span>
                                    <span>สิทธิกร บุญฉิม</span>
                                </span>
                                <span class="legend-item room-5">
                                    <span class="legend-dot"></span>
                                    <span>พอเพียง</span>
                                </span>
                                <span class="legend-item room-6">
                                    <span class="legend-dot"></span>
                                    <span>ห้องประชุมชั้น 6</span>
                                </span>
                                <span class="legend-item room-7">
                                    <span class="legend-dot"></span>
                                    <span>อื่นๆ</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="calendar-table">
                <!-- Desktop View (Table) -->
                <table>
                    <thead>
                        <tr>
                            <th>อาทิตย์</th>
                            <th>จันทร์</th>
                            <th>อังคาร</th>
                            <th>พุธ</th>
                            <th>พฤหัสบดี</th>
                            <th>ศุกร์</th>
                            <th>เสาร์</th>
                        </tr>
                    </thead>
                    <tbody id="calendarBody">
                        <!-- จะถูกสร้างด้วย JS -->
                    </tbody>
                </table>
                
                <!-- Mobile View (List/Card) -->
                <div class="mobile-calendar-view" id="mobileCalendarView">
                    <!-- จะถูกสร้างด้วย JS -->
                </div>
            </div>

            <!-- Scroll to Today Button (แสดงเฉพาะมือถือ) -->
            <button class="scroll-to-today" id="scrollToTodayBtn" title="กลับไปวันนี้">
                <i class="bi bi-calendar-day"></i>
            </button>

            <!--  Recent Bookings Section -->
            <div class="recent-bookings-section" id="recent-bookings">
                <div class="section-header">
                    <h4><i class="bi bi-clock-history"></i> ประวัติการจอง</h4>
                </div>
                
                <!-- Mobile Search Bar -->
                <div class="mobile-search-bar">
                    <input type="text" 
                        class="form-control" 
                        id="mobileSearchInput" 
                        placeholder="🔍 ค้นหาการจอง...">
                </div>
                
                <!-- Desktop Table View -->
                <div class="table-view">
                    <div class="table-responsive">
                        <table class="table table-hover" id="recentBookingsTable">
                            <thead>
                                <tr>
                                    <th>วันที่</th>
                                    <th>เวลา</th>
                                    <th>ห้องประชุม</th>
                                    <th>วัตถุประสงค์</th>
                                    <th>หน่วยงาน</th>
                                    <th>ผู้เข้าร่วม</th>
                                    <th></th>
                                </tr>
                                <tr class="filter-row">
                                    <th><input type="text" class="form-control form-control-sm filter-input" data-column="date" placeholder="ค้นหา..."></th>
                                    <th><input type="text" class="form-control form-control-sm filter-input" data-column="time" placeholder="ค้นหา..."></th>
                                    <th><input type="text" class="form-control form-control-sm filter-input" data-column="room" placeholder="ค้นหา..."></th>
                                    <th><input type="text" class="form-control form-control-sm filter-input" data-column="purpose" placeholder="ค้นหา..."></th>
                                    <th><input type="text" class="form-control form-control-sm filter-input" data-column="unit" placeholder="ค้นหา..."></th>
                                    <th><input type="text" class="form-control form-control-sm filter-input" data-column="attend" placeholder="ค้นหา..."></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="bookingsTableBody">
                                <!-- จะถูกสร้างด้วย JS -->
                            </tbody>
                        </table>
                        
                        <div id="noResults" class="text-center py-4" style="display: none;">
                            <i class="bi bi-search"></i>
                            <p class="text-muted mt-2">ไม่พบรายการที่ค้นหา</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile Card View -->
            <div class="card-view" id="bookingsCardsContainer">
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
                <!-- มาแก้ตอนระบบจริง การลบเดี๋ยวแยกไปอีกหน้าของหน้าการจองของ user นั้นๆ ส่วนของadmin สามารถลบได้เสมอ -->
                <!--<div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="btn-delete-event">
                        <i class="bi bi-trash"></i> ลบการจอง
                    </button>
                </div>-->
            </div>
        </div>
    </div>

<!-- Add Event Modal -->
<div id="modal-view-event-add" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <form id="add-event">
                <!-- Header -->
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-calendar-plus"></i> เพิ่มการจองห้องประชุม
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <!-- Body -->
                <div class="modal-body">
                    
                    <!-- Section 1: ข้อมูลผู้จอง -->
                    <div class="add-event-section">
                        <h6 class="section-title">
                            <i class="bi bi-person-badge"></i> ข้อมูลผู้จอง
                        </h6>
                        <div class="section-content">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-person"></i> ชื่อ-นามสกุล ผู้ขอใช้ห้องประชุม
                                    </label>
                                     <input type="hidden" id="create_user" name="create_user" value="<?=$session_userID?>">
                                    <input type="text" 
                                           class="form-control" 
                                           name="ename" 
                                           placeholder="กรอก ชื่อ-นามสกุล พร้อมใส่คำนำหน้า"
                                           >
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-building"></i> หน่วยงานที่ขออนุญาต
                                    </label>
                                    <select class="form-select" name="egroupwork" >
                                        <option value="">-- เลือกหน่วยงาน --</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-telephone"></i> เบอร์ติดต่อ
                                    </label>
                                    <input type="text" 
                                           class="form-control" 
                                           name="ephone" 
                                           placeholder="กรอกเบอร์สำหรับติดต่อกลับ"
                                           >
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: รายละเอียดการจอง -->
                    <div class="add-event-section">
                        <h6 class="section-title">
                            <i class="bi bi-calendar-event"></i> รายละเอียดการจอง
                        </h6>
                        <div class="section-content">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-calendar3"></i> วันที่จัดกิจกรรม
                                    </label>
                                    <input type="text" 
                                           class="form-control datetimepicker" 
                                           name="edate" 
                                           placeholder="-- เลือกวันที่ --" 
                                           autocomplete="off"
                                           >
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-people-fill"></i> จำนวนคนเข้าร่วม
                                    </label>
                                    <input type="number" 
                                           class="form-control" 
                                           name="enum_person" 
                                           placeholder="ระบุจำนวนผู้เข้าร่วม" 
                                           min="1"
                                           >
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-clock"></i> เวลาเริ่มการประชุม
                                    </label>
                                    <input type="text" 
                                           class="form-control timepicker-bs4" 
                                           name="etime_start" 
                                           placeholder="00:00" 
                                           autocomplete="off"
                                           >
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-clock-history"></i> เวลาสิ้นสุดการประชุม
                                    </label>
                                    <input type="text" 
                                           class="form-control timepicker-bs4" 
                                           name="etime_end" 
                                           placeholder="00:00" 
                                           autocomplete="off"
                                           >
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label required">
                                        <i class="bi bi-bullseye"></i> วัตถุประสงค์การประชุม
                                    </label>
                                    <textarea class="form-control" 
                                              name="epurpose" 
                                              rows="3" 
                                              placeholder="เช่น การประชุมเพื่อ..."
                                              ></textarea>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">
                                        <i class="bi bi-megaphone"></i> วันที่ประกาศเสียงตามสาย
                                    </label>
                                    <input type="text" 
                                           class="form-control datetimepicker" 
                                           name="eannounce" 
                                           placeholder="-- เลือกวันที่ --" 
                                           autocomplete="off">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: ห้องประชุมและการจัดเตรียม -->
                    <div class="add-event-section">
                        <h6 class="section-title">
                            <i class="bi bi-door-open"></i> ห้องประชุมและการจัดเตรียม
                        </h6>
                        <div class="section-content">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-geo-alt-fill"></i> ห้องประชุม
                                    </label>
                                    <select class="form-select" name="eroom" >
                                        <option value="">-- เลือกห้องประชุม --</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">
                                        <i class="bi bi-pencil"></i> ระบุห้องอื่นๆ (ถ้ามี)
                                    </label>
                                    <input type="text" 
                                           class="form-control" 
                                           name="eroom_other" 
                                           placeholder="กรอกเมื่อเลือก 'อื่นๆ'">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label required">
                                        <i class="bi bi-table"></i> รูปแบบโต๊ะ
                                    </label>
                                    <select class="form-select" name="etable" >
                                        <option value="">-- เลือกรูปแบบโต๊ะ --</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">
                                        <i class="bi bi-pencil"></i> ระบุรูปแบบอื่นๆ (ถ้ามี)
                                    </label>
                                    <input type="text" 
                                           class="form-control" 
                                           name="etable_other" 
                                           placeholder="กรอกเมื่อเลือก 'อื่นๆ'">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 4: อุปกรณ์สนับสนุน -->
                    <div class="add-event-section">
                        <h6 class="section-title">
                            <i class="bi bi-gear"></i> อุปกรณ์สนับสนุน
                        </h6>
                        <div class="section-content">
                            <div class="equipment-checkboxes">
                                <div class="form-check">
                                    <input type="checkbox" 
                                           class="form-check-input" 
                                           id="check-mic" 
                                           name="Mic" 
                                           value="ไมโครโฟน">
                                    <label class="form-check-label" for="check-mic">
                                        <i class="bi bi-mic"></i> ไมโครโฟน
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" 
                                           class="form-check-input" 
                                           id="check-projector" 
                                           name="Projector" 
                                           value="โปรเจคเตอร์">
                                    <label class="form-check-label" for="check-projector">
                                        <i class="bi bi-projector"></i> โปรเจคเตอร์/เครื่องฉายแผ่นทึบ
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" 
                                           class="form-check-input" 
                                           id="check-tv" 
                                           name="TeleV" 
                                           value="โทรทัศน์">
                                    <label class="form-check-label" for="check-tv">
                                        <i class="bi bi-tv"></i> โทรทัศน์
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" 
                                           class="form-check-input" 
                                           id="check-video" 
                                           name="video_conference" 
                                           value="Video Conference">
                                    <label class="form-check-label" for="check-video">
                                        <i class="bi bi-camera-video"></i> Video Conference
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" 
                                           class="form-check-input" 
                                           id="check-stream" 
                                           name="streaming" 
                                           value="สตรีมมิ่ง">
                                    <label class="form-check-label" for="check-stream">
                                        <i class="bi bi-broadcast"></i> สตรีมมิ่ง
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input type="checkbox" 
                                           class="form-check-input" 
                                           id="check-photo" 
                                           name="take_photo" 
                                           value="ถ่ายภาพนิ่ง">
                                    <label class="form-check-label" for="check-photo">
                                        <i class="bi bi-camera"></i> ถ่ายภาพ
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 5: เทคโนโลยี -->
                    <div class="add-event-section">
                        <h6 class="section-title">
                            <i class="bi bi-pc-display"></i> ระบบอินเตอร์เน็ตและคอมพิวเตอร์
                        </h6>
                        <div class="section-content">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">
                                        <i class="bi bi-wifi"></i> จำนวนผู้ใช้งาน Internet
                                    </label>
                                    <input type="number" 
                                           class="form-control" 
                                           name="internet_user" 
                                           placeholder="0" 
                                           min="0">
                                    <small class="text-muted">ระบุจำนวน User ที่ต้องการใช้งาน</small>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">
                                        <i class="bi bi-pc"></i> จำนวนเครื่องคอมพิวเตอร์
                                    </label>
                                    <input type="number" 
                                           class="form-control" 
                                           name="computer_count" 
                                           placeholder="0" 
                                           min="0">
                                    <small class="text-muted">ระบุจำนวนเครื่องที่ต้องการ</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- หมายเหตุ -->
                    <div class="alert alert-info d-flex align-items-start mb-0">
                        <i class="bi bi-info-circle me-2 mt-1"></i>
                        <div>
                            <strong>หมายเหตุ:</strong> ช่องที่มีเครื่องหมาย 
                            <span class="text-danger fw-bold">*</span> 
                            จำเป็นต้องกรอกข้อมูล
                        </div>
                    </div>

                </div>

                <!-- Footer -->
                <div class="modal-footer">
                    <button type="submit" class="btn btn-success">
                        <i class="bi bi-check-circle"></i> บันทึกการจอง
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle"></i> ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

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
    <script src="./assests/js/datepicker.js"></script>
    <script src="./assests/js/dayjs.min.js"></script>
    <script src="./assests/js/customParseFormat.min.js"></script>
    <script src="./assests/js/sweetalert2@11.js"></script>
    <script src="./assests/js/select2.min.js"></script>
    <script src="./assests/datepicker-popover.js"></script>
    <script src="./assests/timepicker-bs4.js"></script>
    <script src="./assests/js/pdf-lib.min.js"></script>
    <script src="./assests/js/fontkit.umd.min.js"></script>
    <script src="./assests/pdfGenerator.js"></script>
    <script src="./script.js"></script>
</body>
</html>
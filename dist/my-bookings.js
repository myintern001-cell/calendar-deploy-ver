// ============================================ GLOBAL VARIABLES ============================================

let myBookings = [];
let filteredBookings = [];
let currentFilter = 'all';

// ============================================ INITIALIZATION ============================================

$(document).ready(function() {
    initializeMobileMenu();
    initializeEventListeners();
    loadMyBookings();
});

// ============================================ DATA LOADING ============================================

function loadMyBookings() {
    // แสดง Loading State
    showLoadingState();

    // TODO: แทนที่ด้วย Session UserID จริง
    const userId = 1; // <?php echo $session_userID; ?>

    $.ajax({
        url: 'getMyBookings.php',
        type: 'GET',
        data: { user_id: userId },
        dataType: 'json',
        success: function(data) {
            console.log('My bookings loaded:', data);
            myBookings = data;
            filteredBookings = data;
            
            updateStatistics();
            renderBookings();
            hideLoadingState();
        },
        error: function(xhr, status, error) {
            console.error('Error loading bookings:', error);
            hideLoadingState();
            showEmptyState('error');
        }
    });
}

// ============================================ STATISTICS ============================================

function updateStatistics() {
    const now = new Date();
    
    const upcoming = myBookings.filter(b => new Date(b.start_time) >= now);
    const past = myBookings.filter(b => new Date(b.start_time) < now);
    
    $('#upcomingCount').text(upcoming.length);
    $('#pastCount').text(past.length);
    $('#allCount').text(myBookings.length);
    $('#upcomingBadge').text(upcoming.length);
    $('#pastBadge').text(past.length);
}

// ============================================ FILTER LOGIC ============================================

function filterBookings(filter) {
    currentFilter = filter;
    const now = new Date();
    
    switch(filter) {
        case 'upcoming':
            filteredBookings = myBookings.filter(b => new Date(b.start_time) >= now);
            break;
        case 'past':
            filteredBookings = myBookings.filter(b => new Date(b.start_time) < now);
            break;
        default:
            filteredBookings = myBookings;
    }
    
    renderBookings();
}

// ============================================ SEARCH FUNCTIONALITY ============================================

function searchBookings(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        filterBookings(currentFilter);
        return;
    }
    
    searchTerm = searchTerm.toLowerCase().trim();
    
    const searchResults = filteredBookings.filter(function(booking) {
        const searchableText = [
            booking.purpose || '',
            booking.room_name || '',
            booking.groupname || '',
            booking.start_time || '',
            booking.applicant_name || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
    });
    
    if (searchResults.length === 0) {
        showNoResults();
    } else {
        renderBookingsData(searchResults);
    }
}

// ============================================ RENDERING ============================================

function renderBookings() {
    if (filteredBookings.length === 0) {
        showEmptyState('no-bookings');
        return;
    }
    
    renderBookingsData(filteredBookings);
}

function renderBookingsData(bookings) {
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        renderMobileCards(bookings);
    } else {
        renderDesktopTable(bookings);
    }
    
    $('#noBookings').hide();
    $('#noResults').hide();
}

function renderDesktopTable(bookings) {
    const tbody = $('#bookingsTableBody');
    tbody.empty();
    
    bookings.forEach(function(booking) {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const now = new Date();
        
        const isPast = startTime < now;
        const canEdit = !isPast;
        const canDelete = !isPast;
        
        const dateStr = startTime.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: '2-digit'
        });
        
        const timeStr = startTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        }) + ' - ' + endTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusBadge = isPast 
            ? '<span class="status-badge status-past"><i class="bi bi-check-circle"></i> เสร็จสิ้น</span>'
            : '<span class="status-badge status-upcoming"><i class="bi bi-calendar-event"></i> กำลังมาถึง</span>';
        
        const roomClass = `room-${booking.room_id || 1}`;
        
        const row = `
            <tr>
                <td>${statusBadge}</td>
                <td>${dateStr}</td>
                <td><small>${timeStr}</small></td>
                <td>
                    <span class="room-badge ${roomClass}">
                        ${booking.room_name || 'ไม่ระบุ'}${booking.room_comment ? ` (${booking.room_comment})` : ''}
                    </span>
                </td>
                <td><strong>${booking.purpose || '-'}</strong></td>
                <td><i class="bi bi-people"></i> ${booking.num_attendees || 0} คน</td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="btn-action btn-view" 
                                onclick='showEventDetail(${JSON.stringify(booking).replace(/'/g, "&apos;")})'>
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" 
                                onclick="editBooking(${booking.room_appoinment_id})"
                                ${!canEdit ? 'disabled' : ''}>
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete" 
                                onclick="deleteBooking(${booking.room_appoinment_id}, '${booking.purpose}')"
                                ${!canDelete ? 'disabled' : ''}>
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        tbody.append(row);
    });
}

function renderMobileCards(bookings) {
    const container = $('#bookingsCardsContainer');
    container.empty();
    
    bookings.forEach(function(booking) {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const now = new Date();
        
        const isPast = startTime < now;
        const canEdit = !isPast;
        const canDelete = !isPast;
        
        const dateStr = startTime.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const timeStr = startTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        }) + ' - ' + endTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusBadge = isPast 
            ? '<span class="status-badge status-past"><i class="bi bi-check-circle"></i> เสร็จสิ้น</span>'
            : '<span class="status-badge status-upcoming"><i class="bi bi-calendar-event"></i> กำลังมาถึง</span>';
        
        const roomClass = `room-${booking.room_id || 1}`;
        
        const card = `
            <div class="my-booking-card ${roomClass}">
                <div class="my-booking-card-header">
                    <div class="my-booking-card-title">
                        <h5>${booking.purpose || 'ไม่ระบุวัตถุประสงค์'}</h5>
                        <div class="my-booking-card-date">
                            <i class="bi bi-calendar3"></i> ${dateStr}
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                
                <div class="my-booking-card-body">
                    <div class="my-booking-info-row">
                        <span class="my-booking-info-label">เวลา</span>
                        <span class="my-booking-info-value">
                            <i class="bi bi-clock"></i> ${timeStr}
                        </span>
                    </div>
                    
                    <div class="my-booking-info-row">
                        <span class="my-booking-info-label">ห้องประชุม</span>
                        <span class="my-booking-info-value">
                            <i class="bi bi-door-open"></i> ${booking.room_name || 'ไม่ระบุ'}${booking.room_comment ? ` (${booking.room_comment})` : ''}
                        </span>
                    </div>
                    
                    <div class="my-booking-info-row">
                        <span class="my-booking-info-label">ผู้เข้าร่วม</span>
                        <span class="my-booking-info-value">
                            <i class="bi bi-people"></i> ${booking.num_attendees || 0} คน
                        </span>
                    </div>
                </div>
                
                <div class="my-booking-card-footer">
                    <button class="btn-action btn-view" 
                            onclick='showEventDetail(${JSON.stringify(booking).replace(/'/g, "&apos;")})'>
                        <i class="bi bi-eye"></i> ดูรายละเอียด
                    </button>
                    <button class="btn-action btn-edit" 
                            onclick="editBooking(${booking.room_appoinment_id})"
                            ${!canEdit ? 'disabled' : ''}>
                        <i class="bi bi-pencil"></i> แก้ไข
                    </button>
                    <button class="btn-action btn-delete" 
                            onclick="deleteBooking(${booking.room_appoinment_id}, '${booking.purpose}')"
                            ${!canDelete ? 'disabled' : ''}>
                        <i class="bi bi-trash"></i> ลบ
                    </button>
                </div>
            </div>
        `;
        
        container.append(card);
    });
}

// ============================================ ACTIONS ============================================

function editBooking(bookingId) {
    // TODO: โหลดข้อมูลและแสดง Edit Modal
    console.log('Edit booking:', bookingId);
    
    Swal.fire({
        icon: 'info',
        title: 'กำลังพัฒนา',
        text: 'ฟังก์ชันแก้ไขยังอยู่ระหว่างการพัฒนา',
        confirmButtonText: 'ตกลง'
    });
}

function deleteBooking(bookingId, purpose) {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        html: `คุณต้องการลบการจอง<br><strong>"${purpose}"</strong><br>ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            performDelete(bookingId);
        }
    });
}

function performDelete(bookingId) {
    $.ajax({
        url: 'deleteEvent.php',
        type: 'POST',
        data: { id: bookingId },
        dataType: 'json',
        success: function(response) {
            console.log('Delete response:', response);
            
            Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'ลบการจองเรียบร้อยแล้ว',
                confirmButtonText: 'ตกลง',
                timer: 2000
            }).then(() => {
                loadMyBookings(); // Reload data
            });
        },
        error: function(xhr, status, error) {
            console.error('Delete error:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'ลบไม่สำเร็จ!',
                text: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
                confirmButtonText: 'ตกลง'
            });
        }
    });
}

function showEventDetail(event) {
    // ใช้ฟังก์ชันเดียวกับ index.php
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    const formatTime = (date) => {
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    let roomDisplay = event.room_name || 'ไม่ระบุ';
    if (event.room_name === 'other' && event.room_comment) {
        roomDisplay = event.room_comment;
    }
    
    let tableDisplay = event.Table_style || 'ไม่ระบุ';
    if (event.Table_style === 'other' && event.table_comment) {
        tableDisplay = event.table_comment;
    }

    let equipmentHtml = '';
    const equipmentList = [];
    
    if (event.Mic) equipmentList.push('<i class="bi bi-mic"></i> ไมโครโฟน');
    if (event.Projector) equipmentList.push('<i class="bi bi-projector"></i> โปรเจคเตอร์');
    if (event.TeleV) equipmentList.push('<i class="bi bi-tv"></i> ทีวี');
    if (event.video_conference) equipmentList.push('<i class="bi bi-camera-video"></i> Video Conference');
    if (event.streaming) equipmentList.push('<i class="bi bi-broadcast"></i> Streaming');
    if (event.take_photo) equipmentList.push('<i class="bi bi-camera"></i> ถ่ายภาพ');
    
    if (equipmentList.length > 0) {
        equipmentHtml = equipmentList.map(eq => `<span class="equipment-badge">${eq}</span>`).join('');
    }

    const html = `
        <!-- วัตถุประสงค์ -->
        <div class="event-detail-section">
            <h6 class="section-title">
                <i class="bi bi-bullseye"></i> วัตถุประสงค์
            </h6>
            <div class="section-content">
                <p class="purpose-text">${event.purpose}</p>
            </div>
        </div>

        <!-- ข้อมูลห้องและการจัดเตรียม -->
        <div class="event-detail-section">
            <h6 class="section-title">
                <i class="bi bi-door-open"></i> ข้อมูลห้องประชุม
            </h6>
            <div class="section-content">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-geo-alt-fill"></i> ห้องประชุม
                            </span>
                            <span class="info-value">${roomDisplay}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-table"></i> รูปแบบการจัดโต๊ะ
                            </span>
                            <span class="info-value">${tableDisplay}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-people-fill"></i> จำนวนผู้เข้าร่วม
                            </span>
                            <span class="info-value">${event.num_attendees} คน</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- วันและเวลา -->
        <div class="event-detail-section">
            <h6 class="section-title">
                <i class="bi bi-calendar-event"></i> วันและเวลา
            </h6>
            <div class="section-content">
                <div class="row g-3">
                    <div class="col-md-12">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-calendar3"></i> วันที่
                            </span>
                            <span class="info-value">${formatDate(startTime)}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-clock"></i> เวลาเริ่ม
                            </span>
                            <span class="info-value">${formatTime(startTime)}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-clock-history"></i> เวลาสิ้นสุด
                            </span>
                            <span class="info-value">${formatTime(endTime)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ผู้จองและหน่วยงาน -->
        <div class="event-detail-section">
            <h6 class="section-title">
                <i class="bi bi-person-badge"></i> ข้อมูลผู้จอง
            </h6>
            <div class="section-content">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-building"></i> หน่วยงานที่จอง
                            </span>
                            <span class="info-value">${event.groupname}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-person"></i> ผู้จอง
                            </span>
                            <span class="info-value">${event.applicant_name || 'ไม่ระบุ'}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-telephone"></i> เบอร์ติดต่อ
                            </span>
                            <span class="info-value">${event.applicant_phone_number || 'ไม่ระบุ'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${equipmentHtml || event.internet_num || event.computer_num ? `
        <div class="event-detail-section">
            <h6 class="section-title">
                <i class="bi bi-gear"></i> อุปกรณ์และเทคโนโลยี
            </h6>
            <div class="section-content">
                ${equipmentHtml ? `
                <div class="equipment-list mb-3">
                    ${equipmentHtml}
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('eventModalBody').innerHTML = html;
    $('#btn-print-report').data('event', event);
    new bootstrap.Modal(document.getElementById('eventModal')).show();
}

// ============================================ UI STATES ============================================

function showLoadingState() {
    $('#loadingState').show();
    $('#bookingsTableBody').empty();
    $('#bookingsCardsContainer').empty();
    $('#noBookings').hide();
    $('#noResults').hide();
}

function hideLoadingState() {
    $('#loadingState').hide();
}

function showEmptyState(type) {
    $('#loadingState').hide();
    $('#noResults').hide();
    
    if (type === 'no-bookings') {
        $('#noBookings').show();
        $('#bookingsTableBody').empty();
        $('#bookingsCardsContainer').empty();
    }
}

function showNoResults() {
    $('#noResults').show();
    $('#noBookings').hide();
    $('#bookingsTableBody').empty();
    $('#bookingsCardsContainer').empty();
}

// ============================================ EVENT LISTENERS ============================================

function initializeEventListeners() {
    // Filter Tabs
    $('.filter-tab').on('click', function() {
        $('.filter-tab').removeClass('active');
        $(this).addClass('active');
        
        const filter = $(this).data('filter');
        filterBookings(filter);
    });
    
    // Desktop Search
    $('#desktopSearchInput').on('keyup', function() {
        const searchTerm = $(this).val();
        searchBookings(searchTerm);
    });
    
    // Mobile Search
    $('#mobileSearchInput').on('keyup', function() {
        const searchTerm = $(this).val();
        searchBookings(searchTerm);
    });
    
    // Print Report
    $('#btn-print-report').on('click', function() {
        const eventData = $(this).data('event');
        if (eventData && typeof generatePDFFromTemplate === 'function') {
            generatePDFFromTemplate(eventData);
        }
    });
    
    // Responsive Resize
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (filteredBookings.length > 0) {
                renderBookings();
            }
        }, 250);
    });
}

// ============================================ MOBILE MENU ============================================

function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (!hamburger || !sidebar || !backdrop) return;

    function toggleSidebar() {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
        
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeSidebar() {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleSidebar);
    backdrop.addEventListener('click', closeSidebar);

    const sidebarLinks = sidebar.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 991) {
                closeSidebar();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            closeSidebar();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}
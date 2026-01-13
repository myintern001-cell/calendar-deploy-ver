// ============================================ GLOBAL VARIABLES ============================================

let currentDate = new Date();
let events = [];
let allBookings = [];
let recentBookings = [];

const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

function handleResize() {
        if (window.innerWidth <= 767) {
            renderMobileCalendar();
        }
    }

// ============================================ INITIALIZATION ============================================

$(document).ready(function() {
    initializeComponents();
    initializeFormHandlers();
    initializeDataLoaders();
    initializeEventListeners();
    initializeMobileMenu();
    
    // Load initial data
    loadEvents();
    loadRecentBookings();
});

function initializeComponents() {
    // Modal configuration
    $(document).on('shown.bs.modal', function () {
        $(document).off('focusin.modal');
    });

    // Dayjs plugin
    if (window.dayjs_plugin_customParseFormat) {
        dayjs.extend(window.dayjs_plugin_customParseFormat);
    }
    
    // Format labels with asterisk
    /*$('.form-label').each(function () {
        let text = $(this).text().trim();
        if (text.endsWith('*')) {
            let cleanText = text.slice(0, -1).trim();
            $(this).html(`${cleanText} <span class="text-danger">*</span>`);
        }
    });*/

    // Initialize timepicker
    $('.timepicker-bs4').timepicker({
        format: 'HH:mm',
        step: 900,
        defaultTime: '8:00',
        scheme: 'light'
        //มีการconfig ที่ const popover = new bootstrap.Popover ใน plugin ตรง container
    });

}




// ============================================ FORM VALIDATION & SUBMISSION ============================================

function initializeFormHandlers() {
    $('#add-event').on('submit', function(e) {
        e.preventDefault();

        if (!validateRequiredFields()) return;
        if (!validateConditionalFields()) return;
        if (!validateTimeRange()) return;
       

        submitEventForm($(this));
    });
}

function validateRequiredFields() {
    let required = {
        "ename" : "ชื่อ-นามสกุล ผู้ขอใช้ห้องประชุม",
        "epurpose": "วัตถุประสงค์การประชุม",
        "egroupwork": "หน่วยงานที่ขออนุญาต",
        "edate": "วันที่จัดกิจกรรม",
        "etime_start": "เวลาเริ่มการประชุม",
        "etime_end": "เวลาสิ้นสุดการประชุม",
        "eroom": "ห้องประชุม",
        "enum_person": "จำนวนคนเข้าร่วม",
        "etable": "รูปแบบโต๊ะ",
        "ephone":"เบอร์ติดต่อ"
    };

    let missing = [];
    for (let [field, label] of Object.entries(required)) {
        let value = $(`[name="${field}"]`).val();
        if (!value || value.trim() === "") {
            missing.push(label);
        }
    }

    if (missing.length > 0) {
        Swal.fire({
            icon: "warning",
            title: "กรุณากรอกข้อมูลให้ครบ",
            html: "ยังไม่ได้กรอก:<br>• " + missing.join("<br>• "),
            confirmButtonText: "ตกลง"
        });
        return false;
    }
    return true;
}

function validateConditionalFields() {
    const conditionalFields = [
        {
            select: 'etable',
            optionData: 'other',
            input: 'etable_other',
            alert: {
                title: 'กรุณาระบุรูปแบบโต๊ะ (อื่น ๆ)',
                text: "คุณเลือก 'อื่น ๆ' กรุณากรอกคำอธิบายในช่อง 'อื่น ๆ'"
            }
        },
        {
            select: 'eroom',
            optionData: 'other',
            input: 'eroom_other',
            alert: {
                title: 'กรุณาระบุห้องประชุม (อื่น ๆ)',
                text: "คุณเลือก 'อื่น ๆ' กรุณากรอกคำอธิบายในช่อง 'อื่น ๆ'"
            }
        }
    ];

    for (let cfg of conditionalFields) {
        const $selected = $(`select[name="${cfg.select}"] option:selected`);
        if ($selected.data(cfg.optionData) === 1) {
            const val = $(`input[name="${cfg.input}"]`).val();
            if (!val || val.trim() === '') {
                Swal.fire({
                    icon: 'warning',
                    title: cfg.alert.title,
                    text: cfg.alert.text,
                    confirmButtonText: 'ตกลง'
                });
                return false;
            }
        }
    }
    return true;
}

function validateTimeRange() {
    let startTime = $('input[name="etime_start"]').val();
    let endTime   = $('input[name="etime_end"]').val();

    if (startTime && endTime) {
        let start = new Date(`1970-01-01T${startTime}:00`);
        let end   = new Date(`1970-01-01T${endTime}:00`);

        if (end <= start) {
            Swal.fire({
                icon: "warning",
                title: "เวลาไม่ถูกต้อง",
                text: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น",
                confirmButtonText: "ตกลง"
            });
            return false;
        }
    }
    return true;
}





function submitEventForm($form) {
    $.ajax({
        url: "addEvent.php",
        type: "POST",
        data: $form.serialize(),
        dataType: "json",
        success: function(res) {
            console.log(res);

            if (res.isoverlap === true || res.status === 'overlap') {
                Swal.fire({
                    icon: "error",
                    title: "ไม่สามารถบันทึกได้",
                    text: "ช่วงเวลานี้มีการใช้ห้องประชุมแล้ว",
                    confirmButtonText: "ตกลง"
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "บันทึกสำเร็จ",
                text: "เพิ่มการจองห้องประชุมเรียบร้อยแล้ว",
                confirmButtonText: "ตกลง",
                timer: 2000
            }).then(() => {
                loadEvents();
                loadRecentBookings();
                
                let modalEl = document.getElementById('modal-view-event-add');
                let modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                
                $('#add-event')[0].reset();
                resetOtherFields();
            });
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
            console.log("Response:", xhr.responseText);
            
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด!",
                text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
                confirmButtonText: "ตกลง"
            });
        }
    });
}



// ============================================ BOOKINGS TABLE MANAGEMENT ============================================

function loadRecentBookings() {
    $.ajax({
        url: 'getEvents.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            allBookings = data;
            
            allBookings.sort((a, b) => {
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.room_appoinment_id - a.room_appoinment_id;
            });
            
            displayedBookingsCount = 5;
            recentBookings = allBookings.slice(0, displayedBookingsCount);
            renderBookingsTable(recentBookings);
            
        },
        error: function(err) {
            console.error('Error loading bookings:', err);
            
            const container = window.innerWidth <= 767 
                ? $('#bookingsCardsContainer') 
                : $('#bookingsTableBody');
                
            container.html(`
                <div class="bookings-empty">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h5>เกิดข้อผิดพลาด</h5>
                    <p>ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
                </div>
            `);
        }
    });
}

function renderBookingsTable(bookings) {
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        renderBookingsCards(bookings);
    } else {
        renderBookingsTableDesktop(bookings);
    }
}

function renderBookingsTableDesktop(bookings) {
    const tbody = $('#bookingsTableBody');
    tbody.empty();
    
    if (bookings.length === 0) {
        $('#noResults').show();
        return;
    }
    
    $('#noResults').hide();
    
    bookings.forEach(function(booking) {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        
        const dateStr = startTime.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: '2-digit'
        });
        
        const timeStr = startTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        }) + '-' + endTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const row = `
            <tr>
                <td>${dateStr}</td>
                <td><small>${timeStr}</small></td>
                <td><span class="room-badge room-${booking.room_id || 1}">${booking.room_name || 'ไม่ระบุ'}${booking.room_comment ? `(${booking.room_comment})` : ''}</span></td>
                <td><strong>${booking.purpose || '-'}</strong></td>
                <td>${booking.groupname || '-'}</td>
                <td><i class="bi bi-people"></i> ${booking.num_attendees || 0} คน</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-view-detail" 
                            onclick='showEventDetail(${JSON.stringify(booking).replace(/'/g, "&apos;")})'>
                        <i class="bi bi-eye"></i> ดูรายละเอียด
                    </button>
                </td>
            </tr>
        `;
        
        tbody.append(row);
    });
}

function renderBookingsCards(bookings) {
    const container = $('#bookingsCardsContainer');
    container.empty();
    
    if (bookings.length === 0) {
        container.append(`
            <div class="bookings-empty">
                <i class="bi bi-calendar-x"></i>
                <h5>ไม่พบรายการจอง</h5>
                <p>ลองค้นหาด้วยคำอื่นหรือเพิ่มการจองใหม่</p>
            </div>
        `);
        return;
    }
    
    bookings.forEach(function(booking) {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        
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
        
        const roomClass = `room-${booking.room_id || 1}`;
        
        const card = `
            <div class="booking-card ${roomClass}">
                <div class="booking-card-header">
                    <div class="booking-card-title">
                        <h5>${booking.purpose || 'ไม่ระบุวัตถุประสงค์'}</h5>
                        <div class="booking-card-date">
                            <i class="bi bi-calendar3"></i> ${dateStr}
                        </div>
                    </div>
                    <div class="booking-card-room">
                        <span class="room-badge ${roomClass}">
                            ${booking.room_name || 'ห้องประชุม'}${booking.room_comment ? ` (${booking.room_comment})` : ''}
                        </span>
                    </div>
                </div>
                
                <div class="booking-card-body">
                    <div class="booking-info-item">
                        <span class="booking-info-label">เวลา</span>
                        <span class="booking-info-value">
                            <i class="bi bi-clock"></i> ${timeStr}
                        </span>
                    </div>
                    
                    <div class="booking-info-item">
                        <span class="booking-info-label">ผู้เข้าร่วม</span>
                        <span class="booking-info-value">
                            <i class="bi bi-people"></i> ${booking.num_attendees || 0} คน
                        </span>
                    </div>
                </div>
                
                <div class="booking-card-footer">
                    <div class="booking-card-unit">
                        <strong>หน่วยงาน:</strong> ${booking.groupname || '-'}
                    </div>
                    <button class="btn btn-sm btn-primary btn-view-detail" 
                            onclick='showEventDetail(${JSON.stringify(booking).replace(/'/g, "&apos;")})'>
                        <i class="bi bi-eye"></i> ดูรายละเอียด
                    </button>
                </div>
            </div>
        `;
        
        container.append(card);
    });
}

function initializeTableFilters() {
    $('.filter-input').on('keyup', function() {
        const filters = {
            date: $('.filter-input[data-column="date"]').val().toLowerCase().trim(),
            time: $('.filter-input[data-column="time"]').val().toLowerCase().trim(),
            room: $('.filter-input[data-column="room"]').val().toLowerCase().trim(),
            purpose: $('.filter-input[data-column="purpose"]').val().toLowerCase().trim(),
            unit: $('.filter-input[data-column="unit"]').val().toLowerCase().trim(),
            attend: $('.filter-input[data-column="attend"]').val().toLowerCase().trim()
        };
        
        const hasAnyFilter = Object.values(filters).some(val => val !== '');
        
        const filtered = allBookings.filter(function(booking) {
            const startTime = new Date(booking.start_time);
            const dateStr = startTime.toLocaleDateString('th-TH', {
                day: 'numeric', month: 'short', year: '2-digit'
            }).toLowerCase();
            
            const timeStr = booking.start_time.toLowerCase();
            const roomName = (booking.room_name || '').toLowerCase();
            const purpose = (booking.purpose || '').toLowerCase();
            const unit = (booking.groupname || '').toLowerCase();
            const attendees = String(booking.num_attendees || '');
            
            return (filters.date === '' || dateStr.includes(filters.date)) &&
                (filters.time === '' || timeStr.includes(filters.time)) &&
                (filters.room === '' || roomName.includes(filters.room)) &&
                (filters.purpose === '' || purpose.includes(filters.purpose)) &&
                (filters.unit === '' || unit.includes(filters.unit)) &&
                (filters.attend === '' || attendees.includes(filters.attend));
        });
        
        if (hasAnyFilter) {
            if (window.innerWidth <= 767) {
                renderBookingsCards(filtered.slice(0, 10));
            } else {
                renderBookingsTableDesktop(filtered.slice(0, 10));
            }
        } else {
            renderBookingsTable(recentBookings);
        }
    });
}


// ============================================ EVENT DELETION ============================================

function initializeDeleteHandler() {
    $('#btn-delete-event').on('click', function () {
        let eventID = $(this).data("id");

        Swal.fire({
            title: "ยืนยันการลบ?",
            text: "คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก"
        }).then((result) => {
            if (!result.isConfirmed) return;

            $.ajax({
                url: "deleteEvent.php",
                type: "POST",
                data: { id: eventID },
                dataType: "json",
                success: function(res){
                    console.log(res);

                    Swal.fire({
                        icon: "success",
                        title: "ลบสำเร็จ!",
                        confirmButtonText: "ตกลง"
                    }).then(() => {
                        let modalEl = document.getElementById('modal-view-event');
                        let modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) modal.hide();
                        
                        loadEvents();
                        loadRecentBookings();
                    });
                },
                error: function(err){
                    console.log(err);
                    Swal.fire({
                        icon: "error",
                        title: "ลบไม่สำเร็จ!",
                        text: "เกิดข้อผิดพลาดในระบบ",
                        confirmButtonText: "ตกลง"
                    });
                }
            });
        });
    });
}



// ============================================ DATA LOADERS (Dropdowns) ============================================

function initializeDataLoaders() {
    loadTableStyles();
    loadGroupworks();
    loadRooms();
}

function loadTableStyles() {
    $.ajax({
        url: "getTablestyleChoice.php",
        type: "GET",
        dataType: "json",
        success: function(tables) {
            let tableSelect = $('select[name="etable"]');
            let added = {};

            tableSelect.find('option:not(:first)').remove();

            tables.forEach(function(table) {
                if (!added[table.table_style_id]) {
                    const isOther = String(table.Table_style).toLowerCase().trim() === 'other';
                    const dataAttr = isOther ? ' data-other="1"' : '';
                    if (table.Table_style!=="other") {
                        tableSelect.append(`
                        <option value="${table.table_style_id}"${dataAttr}>
                            ${table.Table_style}
                        </option>
                    `);
                    }else{
                        tableSelect.append(`
                        <option value="${table.table_style_id}"${dataAttr}>
                            ${"อื่นๆ"}
                        </option>
                    `);
                    }
                    
                    added[table.table_style_id] = true;
                }
            });
            tableSelect.trigger('change');
        },
        error: function(xhr, status, error) {
            console.error("Error loading table styles:", error);
            console.log("Response:", xhr.responseText);
        }
    });
}

function loadGroupworks() {
    $.ajax({
        url: "getGroupworks.php",
        type: "GET",
        dataType: "json",
        success: function(groups) {
            let groupSelect = $('select[name="egroupwork"]');
            let added = {};

            groupSelect.find('option:not(:first)').remove();

            groups.forEach(function(group) {
                if (!added[group.id_group]) {
                    groupSelect.append(`
                        <option value="${group.id_group}">
                            ${group.groupname}
                        </option>
                    `);
                    added[group.id_group] = true;
                }
            });
            groupSelect.trigger('change');
        },
        error: function(xhr, status, error) {
            console.error("Error loading groups:", error);
            console.log("Response:", xhr.responseText);
        }
    });
}

function loadRooms() {
    $.ajax({
        url: "getRoomChoice.php",
        type: "GET",
        dataType: "json",
        success: function(rooms) {
            let roomSelect = $('select[name="eroom"]');
            let added = {};

            roomSelect.find('option:not(:first)').remove();

            rooms.forEach(function(room) {
                if (!added[room.room_id]) {
                    const isOther = String(room.room_name).toLowerCase().trim() === 'other';
                    const dataAttr = isOther ? ' data-other="1"' : '';
                    if (room.room_name !== "other") {
                        roomSelect.append(`
                        <option value="${room.room_id}"${dataAttr}>
                            ${room.room_name}
                        </option>
                    `);
                    } else {
                        roomSelect.append(`
                        <option value="${room.room_id}"${dataAttr}>
                            ${"อื่นๆ"}
                        </option>
                    `);
                    }
                    
                    added[room.room_id] = true;
                }
            });
            roomSelect.trigger('change');
        },
        error: function(xhr, status, error) {
            console.error("Error loading rooms:", error);
            console.log("Response:", xhr.responseText);
        }
    });
}



// ============================================ OTHER FIELD LOGIC ============================================

function initializeOtherFieldsLogic() {
    const otherFieldConfigs = [
        {
            select: 'etable',
            optionData: 'other',
            input: 'etable_other'
        },
        {
            select: 'eroom',
            optionData: 'other',
            input: 'eroom_other'
        }
    ];

    otherFieldConfigs.forEach(cfg => {
        $(`select[name="${cfg.select}"]`).on('change', function () {
            const $selected   = $(this).find('option:selected');
            const $otherInput = $(`input[name="${cfg.input}"]`);

            if ($selected.data(cfg.optionData) === 1) {
                $otherInput.prop('disabled', false).val('').focus();
            } else {
                $otherInput.prop('disabled', true).val('');
            }
        });
    });
}

function resetOtherFields(selector = '[name$="_other"]') {
    $(selector).prop('disabled', true).val('');
}



// ============================================ MODAL EVENT HANDLERS ============================================

function initializeModalHandlers() {
    $('#modal-view-event-add').on('show.bs.modal', function () {
        $('#add-event')[0].reset();
        resetOtherFields();
        $('#modal-view-event-add select')
            .val(null)
            .trigger('change.select2');
        
        const modalBody = this.querySelector('.modal-body') || this.querySelector('.modal-content');

        initDatepicker('.modal .datetimepicker', {
            format: 'DD/MM/YYYY',
            locale: 'th',
            minDate: new Date(),
            container: modalBody,
            onChange: function(date, formattedDate) {
                console.log('วันที่:', date);
            }
        });

        $(this).find('select').each(function () {
            if ($(this).hasClass('select2-hidden-accessible')) {
                $(this).select2('destroy');
            }

            $(this).select2({
                theme: 'bootstrap-5',
                width: '100%',
                dropdownParent: $('#modal-view-event-add .modal-content'),
                placeholder: '--เลือก--'
            });
        });
    });


    /*$('#modal-view-event-add ').on('scroll', function() {
        $('.form-select').select2('close');
        $('.timepicker').each(function () {
            const popoverInstance = bootstrap.Popover.getInstance(this);
            if (popoverInstance) {
                popoverInstance.hide();
            }
        });
    });*/

    $('#modal-view-event-add').on('hidden.bs.modal', function () {
        document.querySelectorAll('.modal .datetimepicker').forEach(function(input) {
            if (input._datepickerInstance) {
                input._datepickerInstance.destroy();
            }
        });
        
        document.querySelectorAll('.datepicker-popover').forEach(el => el.remove());
    });

    $('#btn-print-report').on('click', function() {
        const eventData = $(this).data('event');
        if (eventData) {
            generatePDFFromTemplate(eventData);
        }
    });

}



// ============================================ EVENT LISTENERS ============================================

function initializeEventListeners() {
    initializeTableFilters();
    initializeDeleteHandler();
    initializeOtherFieldsLogic();
    initializeModalHandlers();
    initializeMobileSearch();
    
    document.addEventListener('click', function(e) {
        const eventItem = e.target.closest('.event-clickable');
        if (eventItem) {
            e.stopPropagation();
            const eventData = JSON.parse(eventItem.getAttribute('data-event'));
            showEventDetail(eventData);
        }
    });

    $('#menu-recent-bookings').on('click', function(e) {
        e.preventDefault();
        const recentBookingsSection = document.getElementById('recent-bookings');
        if (recentBookingsSection) {
            recentBookingsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    // เพิ่ม Event Listener สำหรับ Resize
    window.addEventListener('resize', debounce(handleResize, 250));

    // Debounce function เพื่อลด performance impact
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const scrollBtn = document.getElementById('scrollToTodayBtn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', scrollToToday);
    }


    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleComponentsResize, 250);
    });
}
    



// ============================================ CALENDAR FUNCTIONS ============================================

async function loadEvents() {
    try {
        const response = await fetch('getEvents.php');
        events = await response.json();
        console.log(events);
        renderCalendar();
    } catch (error) {
        console.error('Error loading events:', error);
        alert('ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่าไฟล์ getEvents.php อยู่ในโฟลเดอร์เดียวกัน');
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[month]} ${year + 543}`;

    // Render Desktop Calendar (Table)
    renderDesktopCalendar(year, month);
    
    // Render Mobile Calendar (List)
    if (window.innerWidth <= 767) {
        renderMobileCalendar();
    }
}

function renderDesktopCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = '';
    let day = 1;

    for (let i = 0; i < 6; i++) {
        html += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                const prevDay = daysInPrevMonth - firstDay + j + 1;
                html += `<td><div class="date-number other-month">${prevDay}</div></td>`;
            } else if (day > daysInMonth) {
                const nextDay = day - daysInMonth;
                html += `<td><div class="date-number other-month">${nextDay}</div></td>`;
                day++;
            } else {
                const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = isDateToday(year, month, day);
                const dayEvents = getEventsForDate(currentDateStr);
                
                html += `<td class="${isToday ? 'today' : ''}" data-date="${currentDateStr}" onclick="onDateClick('${currentDateStr}', event)">
                    <div class="date-number">${day}</div>
                    ${renderEvents(dayEvents)}
                </td>`;
                day++;
            }
        }
        html += '</tr>';
        if (day > daysInMonth) break;
    }

    document.getElementById('calendarBody').innerHTML = html;
}

function renderMobileCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let html = '';
    const today = new Date();
    
    // วนลูปทุกวันในเดือน
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(year, month, day);
        const isToday = today.getFullYear() === year && 
                       today.getMonth() === month && 
                       today.getDate() === day;
        
        const dayName = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'][date.getDay()];
        const monthYearThai = `${monthNames[month]} ${year + 543}`;
        
        const dayEvents = getEventsForDate(currentDateStr);
        
        html += `
            <div class="calendar-day-card ${isToday ? 'today' : ''}" data-date="${currentDateStr}" ${isToday ? 'id="today-card"' : ''}>
                <div class="calendar-day-header">
                    <div class="calendar-day-date">
                        <div class="calendar-day-number">${day}</div>
                        <div class="calendar-day-name">
                            <span class="day">${dayName}</span>
                            <span class="month-year">${monthYearThai}</span>
                        </div>
                    </div>
                    ${dayEvents.length > 0 ? `<span class="calendar-day-badge">${dayEvents.length} รายการ</span>` : ''}
                </div>
        `;
        
        if (dayEvents.length > 0) {
            html += '<div class="calendar-day-events">';
            
            dayEvents.forEach(event => {
                const roomClass = `room-${event.room_id || 1}`;
                const startTime = event.start_time.split(' ')[1].substring(0, 5);
                const endTime = event.end_time.split(' ')[1].substring(0, 5);
                const timeRange = `${startTime}-${endTime}`;
                
                html += `
                    <div class="mobile-event-item ${roomClass} event-clickable" data-event='${JSON.stringify(event).replace(/'/g, "&apos;")}'>
                        <div class="mobile-event-header">
                            <div class="mobile-event-title">${event.purpose || 'ไม่ระบุวัตถุประสงค์'}</div>
                            <div class="mobile-event-time">
                                <i class="bi bi-clock"></i> ${timeRange}
                            </div>
                        </div>
                        <div class="mobile-event-details">
                            <div class="mobile-event-room">
                                <i class="bi bi-door-open"></i> ${event.room_name || 'ห้องประชุม'}${event.room_comment ? ` (${event.room_comment})` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        } else {
            html += `
                <div class="calendar-day-empty" onclick="onDateClick('${currentDateStr}', event)">
                    <i class="bi bi-calendar-plus"></i>
                    <p>ไม่มีกิจกรรม</p>
                    <small class="text-muted">คลิกเพื่อเพิ่มการจอง</small>
                </div>
            `;
        }
        
        html += '</div>';
    }
    
    const mobileView = document.getElementById('mobileCalendarView');
    if (mobileView) {
        mobileView.innerHTML = html;
    }
}


function isDateToday(year, month, day) {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
}

function getEventsForDate(dateStr) {
    return events.filter(event => {
        const eventDate = event.start_time.split(' ')[0];
        return eventDate === dateStr;
    });
}

function renderEvents(dayEvents) {
    if (dayEvents.length === 0) return '';
    
    let html = '';
    
    for (let i = 0; i < dayEvents.length; i++) {
        const event = dayEvents[i];
        const roomClass = `room-${event.room_id || 1}`;
        const startTime = event.start_time.split(' ')[1].substring(0, 5);
        const endTime   = event.end_time.split(' ')[1].substring(0, 5);

        const timeRange = `${startTime} - ${endTime}`;
        
        html += `
            <div class="event-item ${roomClass} event-clickable" data-event='${JSON.stringify(event).replace(/'/g, "&apos;")}'>
                <div class="event-title">${event.purpose || 'ไม่ระบุวัตถุประสงค์'}</div>
                <div class="event-time">${timeRange} นาฬิกา</div>
                <div class="event-room">${event.room_name || 'ห้องประชุม'}${event.room_comment ? `(${event.room_comment})` : ''}</div>
            </div>
        `;
    }

    return html;
}

// ============================================ SCROLL TO TODAY (MOBILE) ============================================

function scrollToToday() {
    const todayCard = document.getElementById('today-card');
    if (todayCard) {
        todayCard.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    } else {
        // ถ้าไม่อยู่ในเดือนปัจจุบัน ให้กลับไปเดือนปัจจุบัน
        showTodayView();
    }
}

// ============================================ MOBILE MENU HANDLER ============================================

function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (!hamburger || !sidebar || !backdrop) return;

    // Toggle Sidebar
    function toggleSidebar() {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
        
        // ป้องกัน scroll body เมื่อเปิด sidebar
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // ปิด Sidebar
    function closeSidebar() {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event Listeners
    hamburger.addEventListener('click', toggleSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // ปิด sidebar เมื่อคลิกเมนู (บนมือถือ)
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 991) {
                closeSidebar();
            }
        });
    });

    // ปิด sidebar เมื่อหมุนหน้าจอ
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            closeSidebar();
        }
    });

    // ปิด sidebar ด้วย ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

// ============================================ MOBILE SEARCH FILTER ============================================

function initializeMobileSearch() {
    $('#mobileSearchInput').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase().trim();
        
        if (searchTerm === '') {
            renderBookingsCards(recentBookings);
            return;
        }
        
        const filtered = allBookings.filter(function(booking) {
            const searchableText = [
                booking.purpose || '',
                booking.room_name || '',
                booking.groupname || '',
                booking.start_time || '',
                String(booking.num_attendees || '')
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
        
        renderBookingsCards(filtered.slice(0, 20));
    });
}


// ============================================ RESPONSIVE HANDLER ============================================

function handleComponentsResize() {
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        // Re-render as cards
        if (recentBookings.length > 0) {
            renderBookingsCards(recentBookings);
        }
        
        // Auto-collapse legend
        const legendWrapper = document.getElementById('legendWrapper');
        if (legendWrapper && !legendWrapper.classList.contains('collapsed')) {
            legendWrapper.classList.add('collapsed');
        }
    } else {
        // Re-render as table
        if (recentBookings.length > 0) {
            renderBookingsTableDesktop(recentBookings);
        }
        
        // Auto-expand legend
        const legendWrapper = document.getElementById('legendWrapper');
        if (legendWrapper) {
            legendWrapper.classList.remove('collapsed');
        }
    }
}


// ============================================ UTILITY FUNCTIONS ============================================

function showEventDetail(event) {
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

    // จัดการแสดงห้องประชุม
    let roomDisplay = event.room_name || 'ไม่ระบุ';
    if (event.room_name === 'other' && event.room_comment) {
        roomDisplay = event.room_comment;
    }
    
    // จัดการแสดงรูปแบบโต๊ะ
    let tableDisplay = event.Table_style || 'ไม่ระบุ';
    if (event.Table_style === 'other' && event.table_comment) {
        tableDisplay = event.table_comment;
    }

    // สร้าง HTML สำหรับอุปกรณ์
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
                    ${event.announcement_date && event.announcement_date !== '0000-00-00' ? `
                    <div class="col-md-12">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-megaphone"></i> วันที่ประกาศเสียงตามสาย
                            </span>
                            <span class="info-value">${formatDate(new Date(event.announcement_date))}</span>
                        </div>
                    </div>
                    ` : ''}
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

        <!-- อุปกรณ์และเทคโนโลยี -->
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
                ${event.internet_num || event.computer_num ? `
                <div class="row g-3">
                    ${event.internet_num ? `
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-wifi"></i> จำนวน Internet
                            </span>
                            <span class="info-value">${event.internet_num}</span>
                        </div>
                    </div>
                    ` : ''}
                    ${event.computer_num ? `
                    <div class="col-md-6">
                        <div class="info-item">
                            <span class="info-label">
                                <i class="bi bi-pc-display"></i> จำนวนคอมพิวเตอร์
                            </span>
                            <span class="info-value">${event.computer_num}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('eventModalBody').innerHTML = html;
    $('#btn-delete-event').data('id', event.room_appoinment_id);
    $('#btn-print-report').data('event', event);
    new bootstrap.Modal(document.getElementById('eventModal')).show();
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function showTodayView() {
    currentDate = new Date();
    renderCalendar();

    // สำหรับ mobile ให้ scroll ไปวันนี้อัตโนมัติ
    if (window.innerWidth <= 767) {
        setTimeout(() => {
            const todayCard = document.getElementById('today-card');
            if (todayCard) {
                todayCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100); // รอ DOM render เสร็จก่อน
    }
}

function showAddModal(dateStr = '') {
    $('#add-event')[0].reset();
    resetOtherFields();

    const modalEl = document.getElementById('modal-view-event-add');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    if (dateStr) {
        $('input[name="edate"]').val(dateStr);
    }
}

function onDateClick(dateStr, event) {
    if (event && event.target.closest('.event-item')) {
        return;
    }
    const today = dayjs().startOf('day');
    const selected = dayjs(dateStr);
    const minDate = today;
    if (selected.isBefore(minDate)) {
        return;
    }
    showAddModal(dateStr);
}
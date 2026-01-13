/**
 * Bootstrap 5 Datepicker Popover
 * Custom datepicker component using Bootstrap 5 popover
 */

class DatepickerPopover {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.options = {
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            defaultDate: options.defaultDate || null,
            onChange: options.onChange || null,
            locale: options.locale || 'th',
            container: options.container || null,
            ...options
        };
        
        this.currentDate = new Date();
        this.selectedDate = null;
        this.popoverInstance = null;
        this.isShowing = false;
        
        this.init();
    }
    
    init() {
        // Parse existing value
        if (this.input.value) {
            this.selectedDate = this.parseDate(this.input.value);
        } else if (this.options.defaultDate) {
            this.selectedDate = new Date(this.options.defaultDate);
        }
        
        // เก็บ handler ไว้ใช้ตอน destroy
        this.clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.selectedDate) {
                this.currentDate = new Date(this.selectedDate);
            } else {
                this.currentDate = new Date();
            }
            this.toggle();
        };
        
        this.focusHandler = (e) => {
            e.preventDefault();
        };
        
        this.input.addEventListener('click', this.clickHandler);
        this.input.addEventListener('focus', this.focusHandler);
        
        this.input.setAttribute('readonly', 'readonly');
        this.input.style.cursor = 'pointer';
    }
    
    toggle() {
        // Sync ค่าจาก input ก่อนทุกครั้ง
        if (this.input.value) {
            const parsed = this.parseDate(this.input.value);
            if (parsed) {
                this.selectedDate = parsed;
                this.currentDate = new Date(parsed);
            }
        } else {
            this.currentDate = new Date();
        }

        if (this.isShowing) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    show() {
        if (this.isShowing) return;
        
        const popoverDiv = document.createElement('div');
        popoverDiv.className = 'popover datepicker-popover bs-popover-bottom fade show';
        popoverDiv.setAttribute('role', 'tooltip');
        popoverDiv.style.position = 'absolute';
        
        const arrow = document.createElement('div');
        arrow.className = 'popover-arrow';
        
        const body = document.createElement('div');
        body.className = 'popover-body';
        body.innerHTML = this.generateCalendar();
        
        popoverDiv.appendChild(arrow);
        popoverDiv.appendChild(body);
        
        const container = this.options.container || document.body;
        container.appendChild(popoverDiv);
        
        this.positionPopover(popoverDiv);
        
        this.popoverInstance = popoverDiv;
        this.isShowing = true;
        
        setTimeout(() => {
            this.attachEventListeners();
            document.addEventListener('click', this.handleOutsideClick);
            
            // ปิด popover เมื่อ scroll modal
            const modal = this.input.closest('.modal');
            if (modal) {
                modal.addEventListener('scroll', this.handleModalScroll);
            }
        }, 50);
    }
    
    positionPopover(popover) {
        const container = this.options.container || document.body;
        
        const inputRect = this.input.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        let top = inputRect.bottom - containerRect.top + 8;
        let left = inputRect.left - containerRect.left;
        
        popover.style.top = top + 'px';
        popover.style.left = left + 'px';
        
        const arrow = popover.querySelector('.popover-arrow');
        if (arrow) {
            arrow.style.left = (inputRect.width / 2) + 'px';
        }
    }
    
    hide() {
        if (!this.isShowing) return;
        
        document.removeEventListener('click', this.handleOutsideClick);
        
        const modal = this.input.closest('.modal');
        if (modal) {
            modal.removeEventListener('scroll', this.handleModalScroll);
        }
        
        if (this.popoverInstance) {
            this.popoverInstance.remove();
            this.popoverInstance = null;
        }
        
        this.isShowing = false;
    }

    destroy() {
    this.hide();
    
    // ลบ event listeners
    if (this.clickHandler) {
        this.input.removeEventListener('click', this.clickHandler);
    }
    if (this.focusHandler) {
        this.input.removeEventListener('focus', this.focusHandler);
    }
    
    // ลบ attributes
    this.input.removeAttribute('readonly');
    this.input.style.cursor = '';
    
    // ลบ instance reference
    delete this.input._datepickerInstance;
}
    
    handleOutsideClick = (e) => {
        const popoverElement = this.popoverInstance;
        if (popoverElement && !popoverElement.contains(e.target) && e.target !== this.input) {
            this.hide();
        }
    }
    
    handleModalScroll = () => {
        this.hide();
    }
    
    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = this.options.locale === 'th' 
            ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
               'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
            : ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayNames = this.options.locale === 'th'
            ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
            : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        
        const displayYear = this.options.locale === 'th' ? year + 543 : year;
        
        // ตรวจสอบว่าสามารถย้อนกลับหรือไปข้างหน้าได้หรือไม่
        const canGoPrev = this.canNavigateToPrevMonth();
        const canGoNext = this.canNavigateToNextMonth();
        
        let html = `
            <div class="datepicker-container">
                <div class="datepicker-header">
                    <button type="button" class="btn btn-sm datepicker-prev-month" ${!canGoPrev ? 'disabled' : ''}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                        </svg>
                    </button>
                    <div class="datepicker-title">
                        <select class="datepicker-month-select">
                            ${this.generateMonthOptions(month, year)}
                        </select>
                        <div class="datepicker-year-control">
                            <button type="button" class="btn btn-sm datepicker-year-next" ${!this.canIncreaseYear() ? 'disabled' : ''}>
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                                </svg>
                            </button>
                            <span class="datepicker-year-display">${displayYear}</span>
                            <button type="button" class="btn btn-sm datepicker-year-prev" ${!this.canDecreaseYear() ? 'disabled' : ''}>
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm datepicker-next-month" ${!canGoNext ? 'disabled' : ''}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                <table class="datepicker-calendar">
                    <thead>
                        <tr>
        `;
        
        dayNames.forEach(day => {
            html += `<th>${day}</th>`;
        });
        
        html += `
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        let dayCount = 1;
        let nextMonthDay = 1;
        
        for (let week = 0; week < 6; week++) {
            html += '<tr>';
            
            for (let day = 0; day < 7; day++) {
                const cellIndex = week * 7 + day;
                
                if (cellIndex < firstDay) {
                    const prevDay = daysInPrevMonth - firstDay + cellIndex + 1;
                    html += `<td class="datepicker-day prev-month">${prevDay}</td>`;
                } else if (dayCount <= daysInMonth) {
                    const isToday = this.isToday(year, month, dayCount);
                    const isSelected = this.isSelected(year, month, dayCount);
                    const isDisabled = this.isDisabled(year, month, dayCount);
                    
                    let classes = 'datepicker-day current-month';
                    if (isToday) classes += ' today';
                    if (isSelected) classes += ' selected';
                    if (isDisabled) classes += ' disabled';
                    
                    html += `<td class="${classes}" data-day="${dayCount}" data-month="${month}" data-year="${year}">${dayCount}</td>`;
                    dayCount++;
                } else {
                    html += `<td class="datepicker-day next-month">${nextMonthDay}</td>`;
                    nextMonthDay++;
                }
            }
            
            html += '</tr>';
        }
        
        html += `
                    </tbody>
                </table>
                <div class="datepicker-footer">
                    <button type="button" class="btn btn-sm btn-primary datepicker-today">วันนี้</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary datepicker-clear">ล้าง</button>
                </div>
            </div>
        `;
        
        return html;
    }
    
    generateMonthOptions(currentMonth, currentYear) {
        const monthNames = this.options.locale === 'th' 
            ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
               'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
            : ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];
        
        const today = new Date();
        const currentYearNow = today.getFullYear();
        const currentMonthNow = today.getMonth();
        
        let options = '';
        for (let i = 0; i < 12; i++) {
            let isDisabled = false;
            
            // ถ้าเป็นปีปัจจุบัน และเดือนที่พิจารณาอยู่ก่อนเดือนปัจจุบัน = ไม่แสดงใน dropdown
            if (currentYear === currentYearNow && i < currentMonthNow) {
                continue; // ข้ามเดือนที่ผ่านมาแล้ว
            }
            
            // เช็คกับ minDate และ maxDate ด้วย
            if (!this.canSelectMonth(i, currentYear)) {
                continue; // ข้ามเดือนที่เลือกไม่ได้
            }
            
            options += `<option value="${i}" ${i === currentMonth ? 'selected' : ''}>${monthNames[i]}</option>`;
        }
        return options;
    }
    
    canSelectMonth(month, year) {
        const testDate = new Date(year, month, 15);
        
        if (this.options.minDate) {
            const minDate = new Date(this.options.minDate);
            const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            if (testDate < minMonth) return false;
        }
        
        if (this.options.maxDate) {
            const maxDate = new Date(this.options.maxDate);
            const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
            if (testDate > maxMonth) return false;
        }
        
        return true;
    }
    
    canNavigateToPrevMonth() {
        if (!this.options.minDate) return true;
        
        const minDate = new Date(this.options.minDate);
        const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        
        return prevMonth >= minMonth;
    }
    
    canNavigateToNextMonth() {
        if (!this.options.maxDate) return true;
        
        const maxDate = new Date(this.options.maxDate);
        const nextMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        
        return nextMonth <= maxMonth;
    }
    
    canDecreaseYear() {
        if (!this.options.minDate) return true;
        
        const minDate = new Date(this.options.minDate);
        return this.currentDate.getFullYear() > minDate.getFullYear();
    }
    
    canIncreaseYear() {
        if (!this.options.maxDate) return true;
        
        const maxDate = new Date(this.options.maxDate);
        return this.currentDate.getFullYear() < maxDate.getFullYear();
    }
    
    attachEventListeners() {
        if (!this.popoverInstance) return;
        
        const prevBtn = this.popoverInstance.querySelector('.datepicker-prev-month');
        if (prevBtn && !prevBtn.disabled) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.previousMonth();
            });
        }
        
        const nextBtn = this.popoverInstance.querySelector('.datepicker-next-month');
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.nextMonth();
            });
        }
        
        const monthSelect = this.popoverInstance.querySelector('.datepicker-month-select');
        if (monthSelect) {
            monthSelect.addEventListener('change', (e) => {
                e.stopPropagation();
                this.currentDate.setMonth(parseInt(e.target.value));
                this.updateCalendar();
            });
        }
        
        const yearNextBtn = this.popoverInstance.querySelector('.datepicker-year-next');
        if (yearNextBtn && !yearNextBtn.disabled) {
            yearNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
                this.updateCalendar();
            });
        }
        
        const yearPrevBtn = this.popoverInstance.querySelector('.datepicker-year-prev');
        if (yearPrevBtn && !yearPrevBtn.disabled) {
            yearPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
                this.updateCalendar();
            });
        }
        
        const days = this.popoverInstance.querySelectorAll('.datepicker-day.current-month:not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                e.stopPropagation();
                const year = parseInt(day.dataset.year);
                const month = parseInt(day.dataset.month);
                const dayNum = parseInt(day.dataset.day);
                this.selectDate(year, month, dayNum);
            });
        });
        
        const todayBtn = this.popoverInstance.querySelector('.datepicker-today');
        if (todayBtn) {
            todayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectToday();
            });
        }
        
        const clearBtn = this.popoverInstance.querySelector('.datepicker-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clear();
            });
        }
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.updateCalendar();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.updateCalendar();
    }
    
    selectDate(year, month, day) {
        this.selectedDate = new Date(year, month, day);
        this.input.value = this.formatDate(this.selectedDate);
        
        if (this.options.onChange) {
            this.options.onChange(this.selectedDate, this.input.value);
        }
        
        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
        
        this.hide();
    }
    
    selectToday() {
        const today = new Date();
        this.currentDate = new Date(today);
        this.selectDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
    
    clear() {
        this.selectedDate = null;
        this.input.value = '';
        
        if (this.options.onChange) {
            this.options.onChange(null, '');
        }
        
        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);
        
        this.hide();
    }
    
    updateCalendar() {
        if (!this.popoverInstance) return;
        
        const body = this.popoverInstance.querySelector('.popover-body');
        if (body) {
            body.innerHTML = this.generateCalendar();
            this.attachEventListeners();
        }
    }
    
    formatDate(date) {
        if (!date) return '';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${year}-${month}-${day}`;
    }
    
    parseDate(dateString) {
        if (!dateString) return null;
        
        let parts;
        let day, month, year;
        
        if (dateString.includes('-')) {
            parts = dateString.split('-');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[2]);
        } else {
            parts = dateString.split('/');
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            year = parseInt(parts[2]);
            
            if (this.options.locale === 'th' && year > 2500) {
                year -= 543;
            }
        }
        
        return new Date(year, month, day);
    }
    
    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && 
               today.getMonth() === month && 
               today.getDate() === day;
    }
    
    isSelected(year, month, day) {
        if (!this.selectedDate) return false;
        return this.selectedDate.getFullYear() === year && 
               this.selectedDate.getMonth() === month && 
               this.selectedDate.getDate() === day;
    }
    
    isDisabled(year, month, day) {
        const date = new Date(year, month, day);
        
        if (this.options.minDate) {
            const minDate = new Date(this.options.minDate);
            minDate.setHours(0, 0, 0, 0);
            if (date < minDate) return true;
        }
        
        if (this.options.maxDate) {
            const maxDate = new Date(this.options.maxDate);
            maxDate.setHours(23, 59, 59, 999);
            if (date > maxDate) return true;
        }
        
        return false;
    }
    
    destroy() {
        this.hide();
        this.input.removeAttribute('readonly');
        this.input.style.cursor = '';
    }
}

function initDatepicker(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    
    elements.forEach(element => {
        // ถ้ามี instance อยู่แล้ว ไม่ต้องสร้างใหม่
        if (element._datepickerInstance) {
            console.log('Instance already exists, skipping...');
            instances.push(element._datepickerInstance);
            return;
        }

        const instance = new DatepickerPopover(element, options);
        instances.push(instance);
        element._datepickerInstance = instance;
    });
    
    return instances.length === 1 ? instances[0] : instances;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DatepickerPopover, initDatepicker };
}

window.DatepickerPopover = DatepickerPopover;
window.initDatepicker = initDatepicker;
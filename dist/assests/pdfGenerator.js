
// pdfGenerator.js
// ไฟล์สำหรับสร้าง PDF จาก Template

async function generatePDFFromTemplate(event) {
    try {
        // แสดง Loading
        Swal.fire({
            title: 'กำลังสร้าง PDF...',
            html: 'กรุณารอสักครู่',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const { PDFDocument, rgb } = PDFLib;

        // 1. โหลด PDF Template
        const templateUrl = './reportroom.pdf'; // หรือ './assests/reportroom.pdf'
        const existingPdfBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error('ไม่พบไฟล์ reportroom.pdf');
            return res.arrayBuffer();
        });

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // โหลดและ Register fontkit ก่อน embedFont
        pdfDoc.registerFontkit(fontkit);

        // 2. โหลด Font ภาษาไทย
        const fontUrl = './assests/fonts/THSarabunNew.ttf';
        const fontBytes = await fetch(fontUrl).then(res => {
            if (!res.ok) throw new Error('ไม่พบไฟล์ THSarabunNew.ttf');
            return res.arrayBuffer();
        });
        const thaiFont = await pdfDoc.embedFont(fontBytes);

        // 3. ดึงหน้าแรก
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { height } = firstPage.getSize();

        // 4. จัดรูปแบบวันที่และเวลา
        const startTime = new Date(event.start_time);
        //const endTime = new Date(event.end_time);

        const formatDateThai = (date) => {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear() + 543;
            return `${day}/${month}/${year}`;
        };

        const formatDateThaiParts = (date) => {
            if (!(date instanceof Date) || isNaN(date.getTime())) {
                return { day: "", month: "", year: "" };
            }

            const monthNamesThai = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
                "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
                "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];

            return {
                day: date.getDate(),
                month: monthNamesThai[date.getMonth()],
                year: date.getFullYear() + 543
            };
        };


        const formatTime = (date) => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        // 5. ตั้งค่าพื้นฐาน
        const fontSize = 14;
        const checkSize = 18;
        const textColor = rgb(0, 0, 0);

        // ฟังก์ชันช่วยวาดข้อความ (y คำนวณจากด้านบน)
        const drawText = (text, x, yFromTop, size = fontSize) => {
            firstPage.drawText(text || '', {
                x: x,
                y: height - yFromTop,
                size: size,
                font: thaiFont,
                color: textColor,
            });
        };

        // ตัดข้อความตามความกว้าง (ใส่ ...)
        // maxWidth = ความกว้างสูงสุดที่อนุญาต (หน่วยเดียวกับ x ใน PDF)
        const truncateText = (text, maxWidth, font, size) => {
            if (!text) return '';

            // ถ้าข้อความสั้นพอ ไม่ต้องตัด
            if (font.widthOfTextAtSize(text, size) <= maxWidth) {
                return text;
            }

            let truncated = text;
            while (
                truncated.length > 0 &&
                font.widthOfTextAtSize(truncated + '...', size) > maxWidth
            ) {
                truncated = truncated.slice(0, -1);
            }

            return truncated + '...';
        };


        // ฟังก์ชันวาดเครื่องหมายถูก
        const drawCheck = (x, yFromTop) => {
            firstPage.drawText('X', {
                x: x,
                y: height - yFromTop,
                size: checkSize,
                font: thaiFont,
                color: textColor,
            });
        };

        // 6. กรอกข้อมูลลงใน PDF
        // **หมายเหตุ: ต้องปรับพิกัด x, y ให้ตรงกับ Template จริง**
        // วิธีหาพิกัด: ใช้โปรแกรม PDF editor หรือลองผิดลองถูก

        // หัวข้อเอกสาร (ถ้ามี)
        // drawText('บันทึกข้อความ', 250, 50, 18);

        // ส่วนราชการ / หน่วยงาน
        drawText(event.groupname || '', 390, 137);

        // เลขที่หนังสือ (ถ้ามีในฐานข้อมูล)
        // drawText(`สธ 0315.2()/${event.room_appoinment_id}`, 150, 170);

        // วันที่
        drawText(formatDateThai(new Date()), 415, 89);

        // วัตถุประสงค์
        // กำหนดความกว้างช่องวัตถุประสงค์ (ลองปรับตาม template)
        const PURPOSE_MAX_WIDTH = 400;

        const purposeText = truncateText(
            event.purpose || '',
            PURPOSE_MAX_WIDTH,
            thaiFont,
            fontSize
        );

        drawText(purposeText, 180, 178);


        // ห้องประชุม - ติ๊กถูก
        // พิกัดตัวอย่าง (ต้องปรับตามจริง)
        const roomCheckboxes = {
            1: { x: 217, yFromTop: 153 },   // อำนวยการ
            2: { x: 412, yFromTop: 153 },  // สิริศักดิ์ ภูริพัฒน์
            3: { x: 217, yFromTop: 167 },   // พระวิสุทธาธิบดี
            4: { x: 302, yFromTop: 167 },  // สิทธิกร บุญฉิม
            5: { x: 383, yFromTop: 167 },  // พอเพียง
            6: { x: 443, yFromTop: 167 },  // ชั้น 6
            7: { x: 443, yFromTop: 167 },  // อื่นๆ 
        };

        if (roomCheckboxes[event.room_id]) {
            drawCheck(
                roomCheckboxes[event.room_id].x,
                roomCheckboxes[event.room_id].yFromTop
            );
        }
        if (event.room_id === 6) {
                drawText(event.room_name,460, 165);
            }else if (event.room_id === 7){
                drawText(event.room_comment,460,165);
            }

        // วันที่จัดกิจกรรม
        drawText(formatDateThai(startTime), 142, 191);

        // เวลา
        drawText(formatTime(startTime), 310, 191);

        // จำนวนคน
        drawText(String(event.num_attendees || ''), 435, 191);

        // รูปแบบโต๊ะ
        const tableCheckboxes = {
            1: { x: 261, yFromTop: 261 }, // classroom
            2: { x: 361, yFromTop: 261 }, // รูปตัว U
            3: { x: 438, yFromTop: 261 }  // อื่นๆ        
        };

        if (event.table_style_id && tableCheckboxes[event.table_style_id]) {
            drawCheck(
                tableCheckboxes[event.table_style_id].x,
                tableCheckboxes[event.table_style_id].yFromTop
            );
        }

        if(event.table_style_id === 3){
            drawText(event.table_comment,455,259)
        }

        // วันที่ประกาศเสียงตามสาย (ถ้ามี)
        if (event.announcement_date) {
            const dateParts = formatDateThaiParts(
                new Date(event.announcement_date)
            );

            drawText(dateParts.day.toString(), 312, 232);      // วัน
            drawText(dateParts.month,          390, 232);     // เดือน (เต็ม)
            drawText(dateParts.year.toString(), 500, 232);    // ปี
        }

        // อุปกรณ์โสตทัศนูปกรณ์
        const equipmentCheckboxes = {
            'Mic': { x: 199, yFromTop: 302 },
            'TeleV': { x: 292, yFromTop: 302 },
            'take_photo': { x: 401, yFromTop: 302 },
            'video_conference': { x: 199, yFromTop: 316 },
            'streaming': { x: 292, yFromTop: 316 },
            'Projector': { x: 199, yFromTop: 330 },
        };

        Object.keys(equipmentCheckboxes).forEach(key => {
            if (event[key]) {
                drawCheck(
                    equipmentCheckboxes[key].x,
                    equipmentCheckboxes[key].yFromTop
                );
            }
        });

        // จำนวน Internet user
        if (event.internet_num  >= 1) {
            drawCheck(199,357);
            drawText(String(event.internet_num), 335, 354);
        }

        // จำนวนคอมพิวเตอร์
        if (event.computer_num >= 1) {
            drawCheck(199,370)
            drawText(String(event.computer_num), 335, 367);
        }

        // ชื่อผู้ขอใช้ห้องประชุม
        // drawText(event.applicant_name || '', 200, 720);

        // 7. บันทึกและดาวน์โหลด PDF
        const pdfBytes = await pdfDoc.save();

        // สร้าง Blob
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // เปิดในแท็บใหม่
        window.open(url, '_blank');

        // ปิด Loading
        Swal.close();

        // แสดงข้อความสำเร็จ
        Swal.fire({
            icon: 'success',
            title: 'สร้าง PDF สำเร็จ!',
            text: 'ไฟล์ถูกดาวน์โหลดและเปิดในแท็บใหม่แล้ว',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            html: `ไม่สามารถสร้าง PDF ได้<br><small>${error.message}</small>`,
            confirmButtonText: 'ตกลง'
        });
    }
}

// ฟังก์ชันสำหรับหาพิกัดในหน้า PDF (ใช้สำหรับ Debug)
async function findPDFCoordinates() {
    try {
        const { PDFDocument } = PDFLib;
        const templateUrl = './reportroom.pdf';
        const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        console.log('PDF Size:', { width, height });
        console.log('ใช้พิกัด y จากด้านบน: yFromTop');
        console.log('ตัวอย่าง: drawText(text, 100, 150) = x=100, y จากด้านบน 150');
        
        return { width, height };
    } catch (error) {
        console.error('Error:', error);
    }
}
package com.springerp.dtos;

import com.springerp.models.InvoiceHeader;
import com.springerp.models.Vendor; // Cần import Vendor nếu bạn muốn trả về object Vendor
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponseDto {

    // --- 1. THÔNG TIN HEADER CƠ BẢN ---
    private Long invoiceId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;

    // --- 2. THÔNG TIN THAM CHIẾU (Đã thêm refNumber) ---
    private InvoiceHeader.RefType refType;
    private Long refId; // ID của tài liệu gốc (PO ID)
    private String refNumber; // ✅ Sửa: Mã PO/SO gốc (ví dụ: PO-001)

    // --- 3. THÔNG TIN ĐỐI TÁC (Đã thay partnerId bằng đối tượng Vendor/Partner) ---
    // Giả định bạn có một DTO đơn giản cho Vendor/Partner
    private Long partnerId; // Vẫn giữ ID
    private String vendorName;
    private String taxCode;

    // --- 4. TỔNG TIỀN VÀ TRẠNG THÁI ---
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    private InvoiceHeader.InvoiceStatus invoiceStatus;

    private String notes;

    // --- 5. AUDIT & LINES ---
    private LocalDateTime createdDate;
    private List<InvoiceLineResponseDto> lines;
}
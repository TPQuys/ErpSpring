package com.springerp.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class InvoiceUpdateDto {

    // --- 1. Header Fields (Có thể cập nhật) ---

    // Số hóa đơn của Vendor (Thường được cập nhật nếu có lỗi gõ)
    @Size(max = 50, message = "Invoice number không được vượt quá 50 ký tự")
    private String invoiceNumber;

    private LocalDate invoiceDate;

    // Ngày đến hạn (Thường được thay đổi theo điều khoản)
    private LocalDate dueDate;

    // Ghi chú (Luôn được phép thay đổi)
    @Size(max = 500, message = "Notes không được vượt quá 500 ký tự")
    private String notes;

    // --- 2. Lines Fields (Chỉ cập nhật khi Status = DRAFT) ---

    // Sử dụng @Valid để kích hoạt validation trong từng InvoiceLineDto
    // Chỉ được phép cập nhật toàn bộ mảng lines khi hóa đơn ở trạng thái DRAFT.
    @Valid
    private List<InvoiceLineDto> lines;

    // 💡 KHÔNG bao gồm các trường sau (vì chúng không thể thay đổi sau khi tạo):
    // - private Long partnerId;
    // - private Long refId;
    // - private String refType;
    // - private BigDecimal totalAmount; (Đây là trường tính toán)
}
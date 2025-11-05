package com.springerp.dtos;

import com.springerp.models.InvoiceHeader;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
// ... imports validation ...

@Data
public class InvoiceCreateDto {
    // ... (Các trường đã định nghĩa: refType, refId, partnerId, invoiceNumber,
    // invoiceDate, dueDate, notes)
    private InvoiceHeader.RefType refType;
    private Long refId;
    private Long partnerId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String notes;

    private List<InvoiceLineDto> lines;
}
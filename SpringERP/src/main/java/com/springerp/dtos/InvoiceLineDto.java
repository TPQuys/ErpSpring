package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;
// ... imports validation ...

@Data
public class InvoiceLineDto {
    // ... (Các trường đã định nghĩa: refLineId, itemId, quantity, unitPrice, taxRate)
    private Long refLineId;
    private Long itemId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
}
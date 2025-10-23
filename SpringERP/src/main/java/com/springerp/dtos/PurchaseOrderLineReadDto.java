package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate; // ✅ Thêm import
import java.time.LocalDateTime;

@Data
public class PurchaseOrderLineReadDto {
    private Long poLineId;

    private BigDecimal quantity;
    private BigDecimal receivedQuantity;

    private BigDecimal unitPrice;
    private BigDecimal discountRate;
    private BigDecimal lineTotal;

    private LocalDate expectedDate;

    private ItemDto item;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PurchaseOrderLineReadDto {
    private Long poLineId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    // Sử dụng DTO/Info cho đối tượng liên quan
    private ItemDto item;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PurchaseOrderLineDto {
    private Long itemId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
}
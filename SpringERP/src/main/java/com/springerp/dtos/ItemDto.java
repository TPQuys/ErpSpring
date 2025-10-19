package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ItemDto {
    private Long itemId;
    private String itemCode;
    private String itemName;
    private BigDecimal quantityInStock;
    private String unit;
    private BigDecimal price;
    private String description;
    private boolean isActive;
}
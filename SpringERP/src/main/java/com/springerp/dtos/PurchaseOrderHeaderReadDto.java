package com.springerp.dtos;

import com.springerp.models.PurchaseOrderHeader;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseOrderHeaderReadDto {
    private Long poId;
    private String poNumber;
    private LocalDate orderDate;

    private LocalDate requiredDate;

    private PurchaseOrderHeader.Status status;
    private BigDecimal totalAmount;

    private String paymentTerms;
    private String deliveryAddress;
    private String notes;

    private VendorDto vendor;
    private UserDto createdBy;
    private List<PurchaseOrderLineReadDto> lines;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
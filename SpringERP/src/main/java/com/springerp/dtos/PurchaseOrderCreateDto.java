package com.springerp.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderCreateDto {
    private String poNumber;
    private LocalDate orderDate;
    private Long vendorId;
    private Long createdById;
    private List<PurchaseOrderLineDto> lines;
}
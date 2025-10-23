package com.springerp.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderCreateDto {
    private String poNumber;

    @NotNull(message = "Ngày đặt hàng không được để trống")
    private LocalDate orderDate;

    private LocalDate requiredDate;

    @NotNull(message = "Nhà cung cấp không được để trống")
    private Long vendorId;

    private Long createdById;

    private String paymentTerms;
    private String deliveryAddress;
    private String notes;

    @NotNull(message = "Đơn hàng phải có ít nhất một mặt hàng")
    private List<PurchaseOrderLineCreateDto> lines;
}
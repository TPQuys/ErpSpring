package com.springerp.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate; // ✅ Thêm import

@Data
public class PurchaseOrderLineCreateDto {
    @NotNull(message = "Mặt hàng không được để trống")
    private Long itemId;

    @DecimalMin(value = "0.01", message = "Số lượng phải lớn hơn 0")
    private BigDecimal quantity;

    @DecimalMin(value = "0.00", message = "Đơn giá phải là số không âm")
    private BigDecimal unitPrice;

    private BigDecimal discountRate;
    private LocalDate expectedDate;
}
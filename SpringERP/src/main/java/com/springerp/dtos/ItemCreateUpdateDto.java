package com.springerp.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemCreateUpdateDto {
    @NotBlank(message = "Mã mặt hàng không được để trống")
    private String itemCode;

    @NotBlank(message = "Tên mặt hàng không được để trống")
    private String itemName;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unit;

    @NotNull(message = "Giá bán không được để trống")
    @PositiveOrZero(message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    private String description;
}
package com.springerp.dtos;

import com.springerp.enums.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemCreateUpdateDto {

    // THÔNG TIN CƠ BẢN
    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String itemCode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name; // Đã đổi từ 'itemName' sang 'name'

    // THUỘC TÍNH KỸ THUẬT VÀ PHÂN LOẠI
    @NotNull(message = "Loại sản phẩm không được để trống")
    private ItemType itemType; // Thêm ItemType (Enum)

    private String brand;
    private String modelNumber;
    private String specifications;

    // GIÁ VÀ ĐƠN VỊ
    @NotBlank(message = "Đơn vị tính không được để trống")
    private String stockUnit; // Đã đổi từ 'unit' sang 'stockUnit'

    @NotNull(message = "Giá bán không được để trống")
    @PositiveOrZero(message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal sellingPrice; // Đã đổi từ 'price' sang 'sellingPrice'

    @NotNull(message = "Giá vốn không được để trống")
    @PositiveOrZero(message = "Giá vốn phải lớn hơn hoặc bằng 0")
    private BigDecimal costPrice; // Thêm costPrice

    // VÒNG ĐỜI SẢN PHẨM
    private String notes; // Đổi từ 'description' sang 'notes'

    @NotNull(message = "Trạng thái ngừng kinh doanh không được để trống")
    private boolean isDiscontinued; // Đổi từ 'isActive' sang 'isDiscontinued'
}
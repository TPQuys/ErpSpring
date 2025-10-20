package com.springerp.dtos;

import com.springerp.enums.ItemType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate; // Sử dụng LocalDate cho launchDate
import java.time.LocalDateTime;

@Data
public class ItemDto {
    private Long itemId;
    private String itemCode;
    private String name; // Đã đổi từ 'itemName' sang 'name'

    // THUỘC TÍNH TỒN KHO VÀ ĐỊNH GIÁ
    private BigDecimal currentStock; // Đã đổi từ 'quantityInStock'
    private String stockUnit; // Đã đổi từ 'unit'
    private BigDecimal sellingPrice; // Đã đổi từ 'price'
    private BigDecimal costPrice; // Thêm costPrice

    // THUỘC TÍNH KỸ THUẬT VÀ PHÂN LOẠI
    private ItemType itemType; // Thêm ItemType
    private String brand;
    private String modelNumber;
    private String specifications;

    // VÒNG ĐỜI SẢN PHẨM
    private String notes; // Đã đổi từ 'description' sang 'notes'
    private LocalDate launchDate; // Thêm launchDate
    private boolean isDiscontinued; // Đã đổi từ 'isActive' sang 'isDiscontinued'

    // Thuộc tính từ BaseEntity (nếu cần hiển thị)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
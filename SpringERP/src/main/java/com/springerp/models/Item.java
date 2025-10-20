package com.springerp.models;

import com.springerp.enums.ItemType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
public class Item extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @Column(unique = true, nullable = false)
    private String itemCode;

    @Column(nullable = false)
    private String name;

    // THUỘC TÍNH KỸ THUẬT QUAN TRỌNG

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType itemType;

    private String brand;

    private String modelNumber;

    private String specifications;

    // QUẢN LÝ TỒN KHO & GIÁ

    @Column(precision = 10, scale = 2)
    private BigDecimal currentStock = BigDecimal.ZERO;

    private String stockUnit;

    @Column(precision = 19, scale = 4)
    private BigDecimal sellingPrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal costPrice;

    // VÒNG ĐỜI SẢN PHẨM

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDate launchDate;

    private boolean isDiscontinued = false;
}


package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Item extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    private String itemCode;
    private String itemName;
    private BigDecimal quantityInStock = BigDecimal.ZERO;
    private String unit;
    private BigDecimal price;
    private String description;
    private boolean isActive = false;
}

package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "purchase_order_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderLine extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long poLineId;

    private BigDecimal quantity;
    private BigDecimal receivedQuantity = BigDecimal.ZERO;

    private BigDecimal unitPrice;
    private BigDecimal discountRate = BigDecimal.ZERO;
    private BigDecimal lineTotal;

    private LocalDate expectedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id")
    private PurchaseOrderHeader purchaseOrderHeader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;
}

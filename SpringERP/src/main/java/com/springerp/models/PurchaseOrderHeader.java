package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_order_header")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderHeader extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long poId;

    @Column(unique = true)
    private String poNumber;

    private LocalDate orderDate;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;

    public enum Status { DRAFT, APPROVED, RECEIVED, CLOSED, CANCELED, PARTIALLY_RECEIVED }

    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    private LocalDate requiredDate;

    private String paymentTerms;
    private String deliveryAddress;
    private String notes;

    @OneToMany(mappedBy = "purchaseOrderHeader", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderLine> lines;
}


package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceLine extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceLineId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private InvoiceHeader invoiceHeader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item; // Liên kết tới Item Entity

    @Column(nullable = false)
    private Long refLineId; // ID của dòng PO/SO gốc

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "tax_rate")
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "line_total")
    private BigDecimal lineTotal;

    @Column(name = "line_tax_amount")
    private BigDecimal lineTaxAmount;
}
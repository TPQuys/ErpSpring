package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoice_header")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceHeader extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefType refType; // PURCHASE hoặc SALE
    public enum RefType { PURCHASE, SALE }

    @Column(nullable = false)
    private Long refId; // ID của tài liệu gốc (PO ID / SO ID)

    @Column(nullable = false)
    private Long partnerId; // ID của Vendor hoặc Customer

    @Column(unique = true, nullable = false)
    private String invoiceNumber; // Số hóa đơn chính thức

    @Column(nullable = false)
    private LocalDate invoiceDate;

    private LocalDate dueDate; // Ngày đến hạn thanh toán

    private BigDecimal subTotal = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus invoiceStatus = InvoiceStatus.DRAFT;
    public enum InvoiceStatus { DRAFT, APPROVED, PAID, PARTIALLY_PAID, CANCELED }

    private String notes;

    @OneToMany(mappedBy = "invoiceHeader", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "invoiceHeader", fetch = FetchType.LAZY)
    private List<Payment> payments;
}
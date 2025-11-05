package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    // A. LIÊN KẾT VỚI HÓA ĐƠN GỐC (INVOICE HEADER)
    // Payment luôn liên kết với cấp Header vì nó thanh toán cho TỔNG giá trị hóa đơn.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_header_id", nullable = false) // ✅ Đổi tên cột và thêm NOT NULL
    private InvoiceHeader invoiceHeader; // ✅ Đổi từ Invoice sang InvoiceHeader

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefType refType;
    public enum RefType { ACCOUNTS_PAYABLE, ACCOUNTS_RECEIVABLE }

    // C. THÔNG TIN GIAO DỊCH

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false)
    private BigDecimal amount; // Số tiền thanh toán

    @Enumerated(EnumType.STRING)
    private Method method;
    public enum Method { CASH, BANK_TRANSFER, CHEQUE, CREDIT_CARD }

    @Column(length = 100)
    private String transactionReference;
}
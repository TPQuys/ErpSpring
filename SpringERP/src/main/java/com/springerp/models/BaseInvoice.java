package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseInvoice extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    private LocalDate invoiceDate;
    private LocalDate postingDate;
    private LocalDate dueDate;

    private BigDecimal totalExclVAT = BigDecimal.ZERO;
    private BigDecimal totalVAT = BigDecimal.ZERO;
    private BigDecimal totalInclVAT = BigDecimal.ZERO;
    private BigDecimal invoiceDiscountAmount = BigDecimal.ZERO;
    private BigDecimal invoiceDiscountPercent = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private Status status = Status.UNPAID;

    public enum Status { UNPAID, PARTIALLY_PAID, PAID, CANCELED }

    private String notes;
}

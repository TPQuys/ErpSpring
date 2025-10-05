package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long invoiceId;

    @Enumerated(EnumType.STRING)
    private RefType refType; // PURCHASE or SALE

    public enum RefType { PURCHASE, SALE }

    private Long refId;

    private BigDecimal amount;
    private LocalDate invoiceDate;

    @Enumerated(EnumType.STRING)
    private Status status = Status.UNPAID;

    public enum Status { UNPAID, PAID }
}

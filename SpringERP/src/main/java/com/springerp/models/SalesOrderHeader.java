package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "sales_order_header")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderHeader extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long soId;

    @Column(unique = true)
    private String soNumber;

    private LocalDate orderDate;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;

    public enum Status { DRAFT, APPROVED, SHIPPED, CLOSED }

    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "salesOrderHeader", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesOrderLine> lines;
}

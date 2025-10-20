package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vendor extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vendorId;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String taxCode;

    @Column(unique = true, nullable = false)
    private String vendorCode;

    @Column(nullable = false)
    private Boolean isActive = true;

    private String contactPersonName;
    private String contactPersonPhone;
    private String contactPersonEmail;

    // 4. Điều khoản Thanh toán
    // Dùng trong quá trình lập Purchase Order (PO) và thanh toán công nợ.
    // Ví dụ: Net 30, Net 60, Thanh toán ngay
    private String paymentTerms;

    @Lob
    private String notes;
}
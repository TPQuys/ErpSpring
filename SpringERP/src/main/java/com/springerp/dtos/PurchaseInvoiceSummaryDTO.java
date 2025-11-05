package com.springerp.dtos;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseInvoiceSummaryDTO {
    private Long invoiceId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private String vendorName;
    private BigDecimal totalInclVAT;
    private String status;
}

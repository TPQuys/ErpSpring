package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceLineResponseDto {

    private Long invoiceLineId;
    private Long refLineId;
    private Long itemId;
    private String itemName;
    private String itemCode;
    private BigDecimal quantity;
    private BigDecimal receivedQuantity;
    private BigDecimal invoicedQuantity;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
    private BigDecimal lineTotal;
    private BigDecimal lineTaxAmount;
}
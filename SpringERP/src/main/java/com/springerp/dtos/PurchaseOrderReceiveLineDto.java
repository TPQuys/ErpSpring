package com.springerp.dtos;

import lombok.Data;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

@Data
public class PurchaseOrderReceiveLineDto {
    @NotNull private Long poLineId;
    @NotNull private BigDecimal receivedQuantity;
}
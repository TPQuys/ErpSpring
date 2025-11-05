package com.springerp.mappers;

import com.springerp.dtos.InvoiceCreateDto;
import com.springerp.dtos.InvoiceLineDto;
import com.springerp.dtos.InvoiceLineResponseDto;
import com.springerp.dtos.InvoiceResponseDto;
import com.springerp.models.*;
import com.springerp.repositories.PurchaseOrderHeaderRepository;
import com.springerp.repositories.PurchaseOrderLineRepository;
import com.springerp.repositories.VendorRepository;
import com.springerp.services.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class InvoiceMapper {

    private final VendorRepository vendorRepository;
    private final PurchaseOrderHeaderRepository purchaseOrderHeaderRepository;
    private final PurchaseOrderLineRepository purchaseOrderLineRepository;

    // ===================================================================
    // 1. DTO -> ENTITY (HEADER & LINE)
    // ===================================================================

    public InvoiceHeader toHeaderEntity(InvoiceCreateDto dto) {
        if (dto == null) return null;

        InvoiceHeader entity = new InvoiceHeader();

        entity.setRefType(dto.getRefType());
        entity.setRefId(dto.getRefId());
        entity.setPartnerId(dto.getPartnerId());
        entity.setInvoiceNumber(dto.getInvoiceNumber());
        entity.setInvoiceDate(dto.getInvoiceDate());
        entity.setDueDate(dto.getDueDate());
        entity.setNotes(dto.getNotes());

        // Khởi tạo các trường tính toán
        entity.setSubTotal(BigDecimal.ZERO);
        entity.setTaxAmount(BigDecimal.ZERO);
        entity.setTotalAmount(BigDecimal.ZERO);
        entity.setInvoiceStatus(InvoiceHeader.InvoiceStatus.DRAFT);

        return entity;
    }

    public InvoiceLine toLineEntity(InvoiceLineDto dto) {
        if (dto == null) return null;

        InvoiceLine entity = new InvoiceLine();

        entity.setRefLineId(dto.getRefLineId());
        entity.setQuantity(dto.getQuantity());
        entity.setUnitPrice(dto.getUnitPrice());
        entity.setTaxRate(dto.getTaxRate());

        // Khởi tạo Item Entity chỉ với ID để tìm kiếm/set trong Service
        Item item = new Item();
        item.setItemId(dto.getItemId());
        entity.setItem(item);

        return entity;
    }

    // ===================================================================
    // 2. ENTITY -> RESPONSE DTO (HEADER & LINE)
    // ===================================================================

    public InvoiceResponseDto toResponseDto(InvoiceHeader entity) {
        if (entity == null) return null;

        InvoiceResponseDto dto = new InvoiceResponseDto();

        // Map Header fields
        dto.setInvoiceId(entity.getInvoiceId());
        dto.setRefType(entity.getRefType());
        dto.setRefId(entity.getRefId());
        PurchaseOrderHeader header = purchaseOrderHeaderRepository.findById(entity.getRefId()).get();
        dto.setRefNumber(header.getPoNumber());
        dto.setPartnerId(entity.getPartnerId());
        Vendor vendor = vendorRepository.findById(entity.getPartnerId()).get();
        dto.setVendorName(vendor.getName());
        dto.setTaxCode(vendor.getTaxCode());
        dto.setInvoiceNumber(entity.getInvoiceNumber());
        dto.setInvoiceDate(entity.getInvoiceDate());
        dto.setDueDate(entity.getDueDate());
        dto.setSubTotal(entity.getSubTotal());
        dto.setTaxAmount(entity.getTaxAmount());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setInvoiceStatus(entity.getInvoiceStatus());
        dto.setNotes(entity.getNotes());
        dto.setCreatedDate(entity.getCreatedAt());
        // Map Lines
        if (entity.getLines() != null) {
            dto.setLines(toLineResponseDtoList(entity.getLines()));
        }

        return dto;
    }

    public InvoiceLineResponseDto toLineResponseDto(InvoiceLine entity) {
        if (entity == null) return null;

        InvoiceLineResponseDto dto = new InvoiceLineResponseDto();

        dto.setInvoiceLineId(entity.getInvoiceLineId());
        dto.setRefLineId(entity.getRefLineId());
        PurchaseOrderLine poLine = purchaseOrderLineRepository.findById(entity.getRefLineId()).get();
        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getItemId());
            dto.setItemName(entity.getItem().getName());
        }

        dto.setQuantity(entity.getQuantity());
        dto.setInvoicedQuantity(poLine.getInvoicedQuantity());
        dto.setReceivedQuantity(poLine.getReceivedQuantity());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setTaxRate(entity.getTaxRate());
        dto.setLineTotal(entity.getLineTotal());
        dto.setLineTaxAmount(entity.getLineTaxAmount());
        dto.setItemCode(entity.getItem().getItemCode());

        return dto;
    }

    public List<InvoiceLineResponseDto> toLineResponseDtoList(List<InvoiceLine> entities) {
        if (entities == null) return null;

        return entities.stream()
                .map(this::toLineResponseDto)
                .collect(Collectors.toList());
    }
}
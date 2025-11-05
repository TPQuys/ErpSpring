package com.springerp.mappers;

import com.springerp.dtos.*;
import com.springerp.models.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class PurchaseOrderMapper {

    public PurchaseOrderHeaderReadDto toDto(PurchaseOrderHeader entity) {
        if (entity == null) return null;

        PurchaseOrderHeaderReadDto dto = new PurchaseOrderHeaderReadDto();
        dto.setPoId(entity.getPoId());
        dto.setPoNumber(entity.getPoNumber());
        dto.setOrderDate(entity.getOrderDate());
        dto.setRequiredDate(entity.getRequiredDate());
        dto.setPaymentTerms(entity.getPaymentTerms());
        dto.setDeliveryAddress(entity.getDeliveryAddress());
        dto.setNotes(entity.getNotes());

        dto.setStatus(entity.getStatus());
        dto.setTotalAmount(entity.getTotalAmount());

        dto.setVendor(toDto(entity.getVendor()));
        dto.setCreatedBy(toDto(entity.getCreatedBy()));

        if (entity.getLines() != null) {
            dto.setLines(entity.getLines().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setLines(Collections.emptyList());
        }

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    public PurchaseOrderLineReadDto toDto(PurchaseOrderLine entity) {
        if (entity == null) return null;
        PurchaseOrderLineReadDto dto = new PurchaseOrderLineReadDto();
        dto.setPoLineId(entity.getPoLineId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setLineTotal(entity.getLineTotal());
        dto.setInvoicedQuantity(entity.getInvoicedQuantity());
        dto.setReceivedQuantity(entity.getReceivedQuantity());
        dto.setDiscountRate(entity.getDiscountRate());
        dto.setExpectedDate(entity.getExpectedDate());
        dto.setItem(toItemInfo(entity.getItem()));
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setReceivedQuantity(entity.getReceivedQuantity());
        return dto;
    }

    public PurchaseOrderHeader toEntity(PurchaseOrderCreateDto dto) {
        if (dto == null) return null;
        PurchaseOrderHeader entity = new PurchaseOrderHeader();
        updateHeaderEntityFromDto(dto, entity);
        return entity;
    }

    public void updateHeaderEntityFromDto(PurchaseOrderCreateDto dto, PurchaseOrderHeader entity) {
        if (dto == null || entity == null) return;
        entity.setPoNumber(dto.getPoNumber());
        entity.setOrderDate(dto.getOrderDate());
        entity.setRequiredDate(dto.getRequiredDate());
        entity.setPaymentTerms(dto.getPaymentTerms());
        entity.setDeliveryAddress(dto.getDeliveryAddress());
        entity.setNotes(dto.getNotes());
    }

    public PurchaseOrderLine toEntity(PurchaseOrderLineCreateDto dto) {
        if (dto == null) return null;
        PurchaseOrderLine entity = new PurchaseOrderLine();
        updateLineEntityFromDto(dto, entity);
        entity.setReceivedQuantity(BigDecimal.ZERO);
        entity.setInvoicedQuantity(BigDecimal.ZERO);
        return entity;
    }

    public void updateLineEntityFromDto(PurchaseOrderLineCreateDto dto, PurchaseOrderLine entity) {
        if (dto == null || entity == null) return;
        entity.setQuantity(dto.getQuantity());
        entity.setUnitPrice(dto.getUnitPrice());
        entity.setDiscountRate(dto.getDiscountRate() != null ? dto.getDiscountRate() : BigDecimal.ZERO);
        entity.setExpectedDate(dto.getExpectedDate());

    }


    public UserDto toDto(User entity) {
        if (entity == null) return null;
        UserDto dto = new UserDto();
        dto.setUsername(entity.getUsername());
        return dto;
    }
    public RoleDto toDto(Role entity) { return new RoleDto(); }

    public VendorDto toDto(Vendor entity) {
        if (entity == null) return null;
        VendorDto dto = new VendorDto();
        dto.setVendorId(entity.getVendorId());
        dto.setName(entity.getName());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        dto.setTaxCode(entity.getTaxCode());
        return dto;
    }

    public ItemDto toItemInfo(Item entity) {
        if (entity == null) return null;
        ItemDto dto = new ItemDto();
        dto.setItemId(entity.getItemId());
        dto.setItemCode(entity.getItemCode());
        dto.setName(entity.getName());
        dto.setStockUnit(entity.getStockUnit());
        dto.setSellingPrice(entity.getSellingPrice());
        dto.setBrand(entity.getBrand());
        dto.setItemType(entity.getItemType());
        return dto;
    }
}
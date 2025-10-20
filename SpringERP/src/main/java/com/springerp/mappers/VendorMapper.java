package com.springerp.mappers;

import com.springerp.dtos.VendorDto;
import com.springerp.models.Vendor;
import org.springframework.stereotype.Component;

@Component
public class VendorMapper {

    public VendorDto toDto(Vendor vendor) {
        if (vendor == null) return null;

        VendorDto dto = new VendorDto();
        dto.setVendorId(vendor.getVendorId());

        dto.setName(vendor.getName());
        dto.setPhone(vendor.getPhone());
        dto.setEmail(vendor.getEmail());
        dto.setAddress(vendor.getAddress());
        dto.setTaxCode(vendor.getTaxCode());

        dto.setVendorCode(vendor.getVendorCode());
        dto.setIsActive(vendor.getIsActive());
        dto.setContactPersonName(vendor.getContactPersonName()); // ✅
        dto.setContactPersonPhone(vendor.getContactPersonPhone()); // ✅
        dto.setContactPersonEmail(vendor.getContactPersonEmail()); // ✅
        dto.setPaymentTerms(vendor.getPaymentTerms());
        dto.setNotes(vendor.getNotes());

        return dto;
    }

    public Vendor toEntity(VendorDto dto) {
        if (dto == null) return null;

        Vendor entity = new Vendor();
        updateEntityFromDto(dto, entity);
        return entity;
    }

    public void updateEntityFromDto(VendorDto dto, Vendor entity) {
        if (dto == null || entity == null) return;

        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setAddress(dto.getAddress());
        entity.setTaxCode(dto.getTaxCode());

        // CÁC TRƯỜNG MỚI
        if (entity.getVendorId() == null) {
            entity.setVendorCode(dto.getVendorCode());
        }

        entity.setIsActive(dto.getIsActive());
        entity.setContactPersonName(dto.getContactPersonName());
        entity.setContactPersonPhone(dto.getContactPersonPhone());
        entity.setContactPersonEmail(dto.getContactPersonEmail());
        entity.setPaymentTerms(dto.getPaymentTerms());
        entity.setNotes(dto.getNotes());
    }
}
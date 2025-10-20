package com.springerp.mappers; // Hoặc com.springerp.mappers

import com.springerp.dtos.*;
import com.springerp.models.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PurchaseOrderMapper {

    public PurchaseOrderHeaderReadDto toDto(PurchaseOrderHeader entity) {
        if (entity == null) return null;

        PurchaseOrderHeaderReadDto dto = new PurchaseOrderHeaderReadDto();
        dto.setPoId(entity.getPoId());
        dto.setPoNumber(entity.getPoNumber());
        dto.setOrderDate(entity.getOrderDate());
        dto.setStatus(entity.getStatus());
        dto.setTotalAmount(entity.getTotalAmount());

        // Map relationships
        dto.setVendor(toDto(entity.getVendor()));
        dto.setCreatedBy(toDto(entity.getCreatedBy()));

        // Map lines (Collection mapping)
        if (entity.getLines() != null) {
            dto.setLines(entity.getLines().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));
        }

        // Map BaseEntity fields
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

        // Map Item Info
        dto.setItem(toItemInfo(entity.getItem()));

        // Map BaseEntity fields
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    public UserDto toDto(User entity) {
        if (entity == null) return null;

        UserDto dto = new UserDto();
        dto.setUserId(entity.getUserId());
        dto.setUsername(entity.getUsername());
        dto.setEmail(entity.getEmail());
        dto.setStatus(entity.getStatus());

        // Map Role
        // Lưu ý: Nếu entity.getRole() là LAZY và mapper được gọi ngoài Transaction,
        // nó sẽ ném ra LazyInitializationException.
        // Cần đảm bảo Role được tải (eagerly, join fetch, hoặc truy cập trong @Transactional)
        // trước khi mapper được gọi.
        dto.setRole(toDto(entity.getRole()));

        return dto;
    }

    public RoleDto toDto(Role entity) {
        if (entity == null) return null;

        RoleDto dto = new RoleDto();
        dto.setRoleId(entity.getRoleId());
        dto.setRoleName(entity.getRoleName());

        return dto;
    }

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
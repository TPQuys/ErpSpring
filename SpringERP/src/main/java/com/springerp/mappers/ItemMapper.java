package com.springerp.mappers;

import com.springerp.dtos.ItemCreateUpdateDto;
import com.springerp.dtos.ItemDto;
import com.springerp.models.Item;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {

    public ItemDto toDto(Item entity) {
        if (entity == null) return null;

        ItemDto dto = new ItemDto();
        dto.setItemId(entity.getItemId());
        dto.setItemCode(entity.getItemCode());
        dto.setItemName(entity.getItemName());
        dto.setQuantityInStock(entity.getQuantityInStock());
        dto.setUnit(entity.getUnit());
        dto.setPrice(entity.getPrice());
        dto.setDescription(entity.getDescription());


        return dto;
    }


    public Item toEntity(ItemCreateUpdateDto dto) {
        if (dto == null) return null;

        Item entity = new Item();
        entity.setItemCode(dto.getItemCode());
        entity.setItemName(dto.getItemName());
        entity.setUnit(dto.getUnit());
        entity.setPrice(dto.getPrice());
        entity.setDescription(dto.getDescription());
        entity.setQuantityInStock(java.math.BigDecimal.ZERO); // Mặc định khi tạo

        return entity;
    }


    public void updateEntityFromDto(ItemCreateUpdateDto dto, Item entity) {
        if (dto == null || entity == null) return;

        entity.setItemCode(dto.getItemCode());
        entity.setItemName(dto.getItemName());
        entity.setUnit(dto.getUnit());
        entity.setPrice(dto.getPrice());
        entity.setDescription(dto.getDescription());
    }
}
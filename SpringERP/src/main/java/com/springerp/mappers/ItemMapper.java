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
        dto.setName(entity.getName());

        dto.setItemType(entity.getItemType());
        dto.setBrand(entity.getBrand());
        dto.setModelNumber(entity.getModelNumber());
        dto.setSpecifications(entity.getSpecifications());

        dto.setCurrentStock(entity.getCurrentStock());
        dto.setStockUnit(entity.getStockUnit());
        dto.setSellingPrice(entity.getSellingPrice());
        dto.setCostPrice(entity.getCostPrice());

        dto.setNotes(entity.getNotes());
        dto.setLaunchDate(entity.getLaunchDate());
        dto.setDiscontinued(entity.isDiscontinued());

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }



    public Item toEntity(ItemCreateUpdateDto dto) {
        if (dto == null) return null;

        Item entity = new Item();

        entity.setItemCode(dto.getItemCode());
        entity.setName(dto.getName());

        entity.setItemType(dto.getItemType());
        entity.setBrand(dto.getBrand());
        entity.setModelNumber(dto.getModelNumber());
        entity.setSpecifications(dto.getSpecifications());

        entity.setStockUnit(dto.getStockUnit());
        entity.setSellingPrice(dto.getSellingPrice());
        entity.setCostPrice(dto.getCostPrice());

        entity.setNotes(dto.getNotes());
        entity.setDiscontinued(dto.isDiscontinued());

        entity.setCurrentStock(java.math.BigDecimal.ZERO);

        return entity;
    }



    public void updateEntityFromDto(ItemCreateUpdateDto dto, Item entity) {
        if (dto == null || entity == null) return;


        entity.setName(dto.getName());

        entity.setItemType(dto.getItemType());
        entity.setBrand(dto.getBrand());
        entity.setModelNumber(dto.getModelNumber());
        entity.setSpecifications(dto.getSpecifications());

        entity.setStockUnit(dto.getStockUnit());
        entity.setSellingPrice(dto.getSellingPrice());
        entity.setCostPrice(dto.getCostPrice());

        entity.setNotes(dto.getNotes());
        entity.setDiscontinued(dto.isDiscontinued());

    }
}
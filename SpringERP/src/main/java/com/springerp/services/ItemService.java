package com.springerp.services;

import com.springerp.dtos.ItemCreateUpdateDto;
import com.springerp.dtos.ItemDto;
import com.springerp.mappers.ItemMapper;
import com.springerp.models.Item;
import com.springerp.repositories.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    public List<ItemDto> findAll() {
        return itemRepository.findAll().stream()
                .map(itemMapper::toDto)
                .collect(Collectors.toList());
    }

    public ItemDto findById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId));
        return itemMapper.toDto(item);
    }

    @Transactional
    public ItemDto createItem(ItemCreateUpdateDto dto) {
        // Kiểm tra trùng lặp itemCode (tùy chọn)
        if (itemRepository.findByItemCode(dto.getItemCode()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Mã mặt hàng đã tồn tại: " + dto.getItemCode());
        }

        Item item = itemMapper.toEntity(dto);
        Item savedItem = itemRepository.save(item);
        return itemMapper.toDto(savedItem);
    }

    @Transactional
    public ItemDto updateItem(Long itemId, ItemCreateUpdateDto dto) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId));

        // Kiểm tra trùng lặp itemCode nếu code thay đổi (tùy chọn)
        if (!item.getItemCode().equals(dto.getItemCode())) {
            if (itemRepository.findByItemCode(dto.getItemCode()).isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Mã mặt hàng đã tồn tại: " + dto.getItemCode());
            }
        }

        itemMapper.updateEntityFromDto(dto, item);
        Item updatedItem = itemRepository.save(item);
        return itemMapper.toDto(updatedItem);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId);
        }

        itemRepository.deleteById(itemId);
    }


    @Transactional
    public void increaseStock(Long itemId, BigDecimal quantity) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId));

        item.setQuantityInStock(item.getQuantityInStock().add(quantity));
        itemRepository.save(item);
    }
}
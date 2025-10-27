package com.springerp.services;

import com.springerp.dtos.ItemCreateUpdateDto;
import com.springerp.dtos.ItemDto;
import com.springerp.enums.ItemType;
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
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    @FunctionalInterface
    private interface ExceptionSupplier<T> {
        T get() throws Exception;
    }

    private <T> T handleExceptions(ExceptionSupplier<T> supplier) {
        try {
            return supplier.get();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi server", e);
        }
    }

    public List<ItemDto> findAll() {
        return handleExceptions(() ->
                itemRepository.findAll().stream()
                        .map(itemMapper::toDto)
                        .collect(Collectors.toList())
        );
    }

    public ItemDto findById(Long itemId) {
        return handleExceptions(() -> {
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId));
            return itemMapper.toDto(item);
        });
    }

    @Transactional
    public ItemDto createItem(ItemCreateUpdateDto dto) {
        return handleExceptions(() -> {
            if (itemRepository.findByItemCode(dto.getItemCode()).isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Mã mặt hàng đã tồn tại: " + dto.getItemCode());
            }

            Item item = itemMapper.toEntity(dto);
            Item savedItem = itemRepository.save(item);
            return itemMapper.toDto(savedItem);
        });
    }

    @Transactional
    public ItemDto updateItem(Long itemId, ItemCreateUpdateDto dto) {
        return handleExceptions(() -> {
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId));
            itemMapper.updateEntityFromDto(dto, item);
            Item updatedItem = itemRepository.save(item);
            return itemMapper.toDto(updatedItem);
        });
    }

    @Transactional
    public void deleteItem(Long itemId) {
        handleExceptions(() -> {
            if (!itemRepository.existsById(itemId)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId);
            }
            itemRepository.deleteById(itemId);
            return null; // vì method void
        });
    }

    @Transactional
    public void increaseStock(Long itemId, BigDecimal quantity) {
        handleExceptions(() -> {
            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + itemId));

            item.setCurrentStock(item.getCurrentStock().add(quantity));
            itemRepository.save(item);
            return null;
        });
    }

    public List<String> getAllItemTypes() {
        return handleExceptions(() ->
                Stream.of(ItemType.values())
                        .map(ItemType::name)
                        .collect(Collectors.toList())
        );
    }
}

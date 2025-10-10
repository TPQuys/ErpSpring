package com.springerp.services;

import com.springerp.models.Item;
import com.springerp.repositories.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional
    public void increaseStock(Long itemId, BigDecimal quantity) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mặt hàng với ID: " + itemId));

        item.setQuantityInStock(item.getQuantityInStock().add(quantity));
        itemRepository.save(item);
    }
}
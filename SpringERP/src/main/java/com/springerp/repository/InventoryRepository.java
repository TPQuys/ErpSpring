package com.springerp.repository;

import com.springerp.models.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByItem_ItemId(Long itemId);
}

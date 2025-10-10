package com.springerp.repositories;

import com.springerp.models.Item;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Object> findByItemCode(@NotBlank(message = "Mã mặt hàng không được để trống") String itemCode);
}


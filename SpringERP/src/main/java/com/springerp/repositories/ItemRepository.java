package com.springerp.repositories;

import com.springerp.models.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
}

// Bạn cũng cần có VendorRepository và UserRepository
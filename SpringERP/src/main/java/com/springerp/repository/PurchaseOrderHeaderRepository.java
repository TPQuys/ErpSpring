package com.springerp.repository;

import com.springerp.models.PurchaseOrderHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PurchaseOrderHeaderRepository extends JpaRepository<PurchaseOrderHeader, Long> {
    Optional<PurchaseOrderHeader> findByPoNumber(String poNumber);
}

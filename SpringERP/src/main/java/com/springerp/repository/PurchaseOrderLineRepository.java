package com.springerp.repository;

import com.springerp.models.PurchaseOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseOrderLineRepository extends JpaRepository<PurchaseOrderLine, Long> {
    List<PurchaseOrderLine> findByPurchaseOrderHeader_PoId(Long poId);
}

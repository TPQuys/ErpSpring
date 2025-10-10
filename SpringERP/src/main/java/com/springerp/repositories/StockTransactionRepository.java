package com.springerp.repositories;

import com.springerp.models.StockTransaction;
import com.springerp.models.StockTransaction.RefType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByItem_ItemId(Long itemId);
    List<StockTransaction> findByRefType(RefType refType);
}

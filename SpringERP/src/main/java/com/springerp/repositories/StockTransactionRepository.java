package com.springerp.repositories;

import com.springerp.models.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    // Hàm 1: Tìm kiếm theo Item ID
    List<StockTransaction> findByItemItemId(Long itemId);

    // Hàm 2: Tìm kiếm theo Ref ID và Source Type
    List<StockTransaction> findByRefIdAndSourceType(Long refId, StockTransaction.SourceType sourceType);

    // Hàm 3: Tìm kiếm theo Item ID và khoảng thời gian (dùng cho thống kê)
    List<StockTransaction> findByItemItemIdAndTransDateBetween(Long itemId, LocalDateTime startDate, LocalDateTime endDate);
}
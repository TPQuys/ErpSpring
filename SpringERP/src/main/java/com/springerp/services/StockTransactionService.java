package com.springerp.services;

import com.springerp.models.Item;
import com.springerp.models.StockTransaction;
import com.springerp.models.StockTransaction.Direction;
import com.springerp.models.StockTransaction.SourceType;
import com.springerp.repositories.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockTransactionService {

    private final StockTransactionRepository stockTransactionRepository;

    @Transactional(propagation = Propagation.REQUIRED) // Đảm bảo giao dịch được chạy cùng PO Service
    public StockTransaction createTransaction(
            Item item,
            BigDecimal quantity,
            BigDecimal unitCost,
            LocalDateTime transDate,
            Direction direction,
            SourceType sourceType,
            Long refId) {

        // 1. Kiểm tra dữ liệu đầu vào cơ bản
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số lượng giao dịch phải lớn hơn 0.");
        }
        if (item == null) {
            throw new IllegalArgumentException("Mặt hàng không được để trống.");
        }

        // 2. Tạo đối tượng StockTransaction
        StockTransaction transaction = new StockTransaction();

        // Thiết lập các trường bắt buộc (non-nullable)
        transaction.setItem(item);
        transaction.setDirection(direction);
        transaction.setSourceType(sourceType);
        transaction.setRefId(refId);

        // Luôn đảm bảo quantity là số dương trong bảng transaction, 
        // hướng đã được xác định bằng trường 'direction'.
        transaction.setQuantity(quantity);
        transaction.setUnitCost(unitCost);

        // Sử dụng ngày giờ truyền vào hoặc ngày giờ hiện tại
        transaction.setTransDate(transDate != null ? transDate : LocalDateTime.now());

        // 3. Lưu giao dịch vào cơ sở dữ liệu
        return stockTransactionRepository.save(transaction);
    }

    // Hàm tìm kiếm, thống kê có thể được thêm vào đây
    // public List<StockTransaction> findByItemId(Long itemId) { ... }
    @Transactional(readOnly = true)
    public List<StockTransaction> findAll() {
        return stockTransactionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<StockTransaction> findByItemId(Long itemId) {
        // Giả định bạn đã có hàm tìm kiếm này trong StockTransactionRepository
        return stockTransactionRepository.findByItemItemId(itemId);
    }

    @Transactional(readOnly = true)
    public List<StockTransaction> findByRefIdAndSourceType(Long refId, StockTransaction.SourceType sourceType) {
        return stockTransactionRepository.findByRefIdAndSourceType(refId, sourceType);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateNetMovement(Long itemId, LocalDateTime startDate, LocalDateTime endDate) {
        // 💥 Lưu ý: Hàm này yêu cầu Repository thực hiện truy vấn phức tạp hơn (sử dụng JPQL hoặc Native Query)

        // Giả định Repository có hàm:
        // public List<StockTransaction> findByItemItemIdAndTransDateBetween(Long itemId, LocalDateTime start, LocalDateTime end);

        List<StockTransaction> transactions = stockTransactionRepository
                .findByItemItemIdAndTransDateBetween(itemId, startDate, endDate);

        BigDecimal netMovement = BigDecimal.ZERO;

        for (StockTransaction t : transactions) {
            if (t.getDirection() == StockTransaction.Direction.IN) {
                netMovement = netMovement.add(t.getQuantity());
            } else if (t.getDirection() == StockTransaction.Direction.OUT) {
                netMovement = netMovement.subtract(t.getQuantity());
            }
        }
        return netMovement;
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTotalTransactionValue(Long itemId, LocalDateTime startDate, LocalDateTime endDate) {
        List<StockTransaction> transactions = stockTransactionRepository
                .findByItemItemIdAndTransDateBetween(itemId, startDate, endDate);

        BigDecimal totalValue = BigDecimal.ZERO;

        for (StockTransaction t : transactions) {
            // Tổng giá trị = Số lượng * Giá vốn
            BigDecimal transactionValue = t.getQuantity().multiply(t.getUnitCost());

            // Cộng/trừ giá trị dựa trên hướng giao dịch (IN/OUT)
            if (t.getDirection() == StockTransaction.Direction.IN) {
                totalValue = totalValue.add(transactionValue);
            } else if (t.getDirection() == StockTransaction.Direction.OUT) {
                totalValue = totalValue.subtract(transactionValue);
            }
        }
        return totalValue;
    }
}
package com.springerp.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transaction")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor // Sử dụng thay cho AllArgsConstructor để kiểm soát các trường @NonNull
public class StockTransaction extends BaseEntity {

    // Enum mới để xác định hướng của giao dịch kho
    public enum Direction { IN, OUT }

    // Enum cho loại tài liệu nguồn (chỉ định từ đâu giao dịch này đến)
    public enum SourceType { PURCHASE_RECEIPT, SALES_ISSUE, INVENTORY_ADJUSTMENT, TRANSFER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transId;

    // 1. Loại giao dịch (Bắt buộc)
    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Direction direction; // IN (Nhập) hoặc OUT (Xuất)

    // 2. Tham chiếu nguồn (Bắt buộc)
    @NonNull
    @Enumerated(EnumType.STRING)
    private SourceType sourceType; // Nguồn tạo ra giao dịch

    @NonNull
    @Column(nullable = false)
    private Long refId; // ID của tài liệu nguồn (PO ID, SO ID, v.v.)

    // 3. Số lượng (Bắt buộc)
    @NonNull
    @Column(nullable = false)
    private BigDecimal quantity;

    // 4. Ngày giao dịch (Bắt buộc)
    @NonNull
    @Column(nullable = false)
    private LocalDateTime transDate = LocalDateTime.now();

    // 5. Giá vốn tại thời điểm giao dịch (Rất quan trọng cho kế toán)
    @Column(name = "unit_cost")
    private BigDecimal unitCost;

    // 6. Liên kết tới Item (Bắt buộc)
    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    // 7. Liên kết tới Kho/Vị trí (Nếu có)
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "location_id")
    // private Location location;
}
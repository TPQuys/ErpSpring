package com.springerp.repositories;

import com.springerp.models.PurchaseOrderHeader;
import com.springerp.models.PurchaseOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderHeaderRepository extends JpaRepository<PurchaseOrderHeader, Long> {
    Optional<PurchaseOrderHeader> findByPoNumber(String poNumber);


    // Phương thức này sẽ loại trừ các PO nếu trạng thái của chúng KHÔNG nằm trong danh sách truyền vào
    List<PurchaseOrderHeader> findByVendorVendorIdAndStatusIn(
            Long vendorId,
            Collection<PurchaseOrderHeader.Status> statuses // ✅ Sử dụng Collection
    );

    // Phương thức truy vấn trực tiếp bằng JPQL
    @Query("SELECT l FROM PurchaseOrderLine l WHERE l.purchaseOrderHeader.poId = :poHeaderId AND l.receivedQuantity > l.invoicedQuantity")
    List<PurchaseOrderLine> findInvoicableLinesByPoHeaderId(@Param("poHeaderId") Long poHeaderId);

    List<PurchaseOrderHeader> findByVendorVendorIdAndInvoiceStatusNotInAndStatusNotIn(Long vendorId, List<PurchaseOrderHeader.InvoiceStatus> excludedInvoiceStatuses, List<PurchaseOrderHeader.Status> excludedHeaderStatuses);


}

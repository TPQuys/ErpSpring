package com.springerp.repositories;


import com.springerp.models.PurchaseOrderHeader;
import com.springerp.models.Vendor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Vendor getVendorsByName(String name);

    Optional<Object> findByVendorCode(String vendorCode);

    @Query("SELECT DISTINCT p.vendor.vendorId FROM PurchaseOrderHeader p " +
            "WHERE p.invoiceStatus NOT IN :invoiceStatuses " +
            "AND p.status NOT IN :headerStatuses")
    List<Long> findDistinctVendorIdByInvoiceStatusNotInAndStatusNotIn(
            @Param("invoiceStatuses") List<PurchaseOrderHeader.InvoiceStatus> invoiceStatuses,
            @Param("headerStatuses") List<PurchaseOrderHeader.Status> headerStatuses
    );
}

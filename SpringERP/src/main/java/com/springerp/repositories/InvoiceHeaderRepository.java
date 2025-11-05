package com.springerp.repositories;

import com.springerp.models.InvoiceHeader;
import com.springerp.models.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceHeaderRepository extends JpaRepository<InvoiceHeader, Long> {
    List<InvoiceHeader> findInvoiceHeadersByRefId(Long refId);
    boolean existsByRefIdAndInvoiceStatusNot(Long refId, InvoiceHeader.InvoiceStatus invoiceStatus);
}

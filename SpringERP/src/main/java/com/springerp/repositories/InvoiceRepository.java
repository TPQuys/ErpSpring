package com.springerp.repositories;

import com.springerp.models.Invoice;
import com.springerp.models.Invoice.RefType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByRefType(RefType refType);
}

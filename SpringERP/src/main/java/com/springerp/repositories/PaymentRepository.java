package com.springerp.repositories;

import com.springerp.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceHeader_InvoiceId(Long invoiceId);
}

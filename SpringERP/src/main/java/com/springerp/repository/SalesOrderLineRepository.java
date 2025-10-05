package com.springerp.repository;

import com.springerp.models.SalesOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SalesOrderLineRepository extends JpaRepository<SalesOrderLine, Long> {
    List<SalesOrderLine> findBySalesOrderHeader_SoId(Long soId);
}

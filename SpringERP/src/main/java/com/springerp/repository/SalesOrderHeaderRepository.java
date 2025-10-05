package com.springerp.repository;

import com.springerp.models.SalesOrderHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SalesOrderHeaderRepository extends JpaRepository<SalesOrderHeader, Long> {
    Optional<SalesOrderHeader> findBySoNumber(String soNumber);
}

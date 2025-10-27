package com.springerp.repositories;


import com.springerp.models.Vendor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Vendor getVendorsByName(String name);

    Optional<Object> findByVendorCode(String vendorCode);
}

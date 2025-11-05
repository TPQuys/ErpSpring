package com.springerp.controllers;

import com.springerp.dtos.VendorDto;
import com.springerp.services.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    public ResponseEntity<VendorDto> createVendor(@Valid @RequestBody VendorDto vendorDto) {
        VendorDto createdVendor = vendorService.createVendor(vendorDto);
        return new ResponseEntity<>(createdVendor, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorDto> getVendorById(@PathVariable Long id) throws Exception {
        VendorDto vendorDto = vendorService.getVendorById(id);
        return ResponseEntity.ok(vendorDto);    }

    @GetMapping
    public ResponseEntity<List<VendorDto>> getAllVendors() {
        List<VendorDto> vendors = vendorService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/get-available-vendor")
    public ResponseEntity<List<VendorDto>> getVendorsWithInvoiceEligibleOrders() {
        List<VendorDto> vendors = vendorService.getVendorsWithInvoiceEligibleOrders();
        return ResponseEntity.ok(vendors);
    }
    @PutMapping("/{id}")
    public ResponseEntity<VendorDto> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorDto vendorDto) throws Exception {
        VendorDto updatedVendor = vendorService.updateVendor(id, vendorDto);
        return ResponseEntity.ok(updatedVendor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) throws Exception {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}
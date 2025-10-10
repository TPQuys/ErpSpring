package com.springerp.services;

import com.springerp.dtos.VendorDto;
import com.springerp.models.Vendor;
import com.springerp.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;

    private VendorDto convertToDto(Vendor vendor) {
        VendorDto dto = new VendorDto();
        dto.setVendorId(vendor.getVendorId());
        dto.setName(vendor.getName());
        dto.setPhone(vendor.getPhone());
        dto.setEmail(vendor.getEmail());
        dto.setAddress(vendor.getAddress());
        dto.setTaxCode(vendor.getTaxCode());
        return dto;
    }

    private void mapDtoToEntity(VendorDto dto, Vendor vendor) {
        vendor.setName(dto.getName());
        vendor.setPhone(dto.getPhone());
        vendor.setEmail(dto.getEmail());
        vendor.setAddress(dto.getAddress());
        vendor.setTaxCode(dto.getTaxCode());
    }

    @Transactional
    public VendorDto createVendor(VendorDto vendorDto) {
        Vendor vendor = new Vendor();
        mapDtoToEntity(vendorDto, vendor);
        Vendor savedVendor = vendorRepository.save(vendor);
        return convertToDto(savedVendor);
    }


    @Transactional(readOnly = true)
    public VendorDto getVendorById(Long id)  {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy nhà cung cấp với ID: " + id));
        return convertToDto(vendor);
    }


    @Transactional(readOnly = true)
    public List<VendorDto> getAllVendors() {
        return vendorRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public VendorDto updateVendor(Long id, VendorDto vendorDto)  {
        Vendor existingVendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy nhà cung cấp với ID: " + id));

        mapDtoToEntity(vendorDto, existingVendor);
        Vendor updatedVendor = vendorRepository.save(existingVendor);
        return convertToDto(updatedVendor);
    }


    @Transactional
    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy nhà cung cấp với ID: " + id);
        }
        vendorRepository.deleteById(id);
    }
}
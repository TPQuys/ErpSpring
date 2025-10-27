package com.springerp.services;

import com.springerp.dtos.VendorDto;
import com.springerp.mappers.VendorMapper;
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
    private final VendorMapper vendorMapper;

    @FunctionalInterface
    private interface ExceptionSupplier<T> {
        T get() throws Exception;
    }

    private <T> T handleExceptions(ExceptionSupplier<T> supplier) {
        try {
            return supplier.get();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    private Vendor findVendorEntityById(Long id) {
        return handleExceptions(() ->
                vendorRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + id))
        );
    }

    @Transactional
    public VendorDto createVendor(VendorDto vendorDto) {
        return handleExceptions(() -> {
            if (vendorRepository.findByVendorCode(vendorDto.getVendorCode()).isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Mã nhà cung cấp đã tồn tại: " + vendorDto.getVendorCode());
            }

            Vendor vendor = vendorMapper.toEntity(vendorDto);
            Vendor savedVendor = vendorRepository.save(vendor);
            return vendorMapper.toDto(savedVendor);
        });
    }

    @Transactional(readOnly = true)
    public VendorDto getVendorById(Long id) {
        return handleExceptions(() -> {
            Vendor vendor = findVendorEntityById(id);
            return vendorMapper.toDto(vendor);
        });
    }

    @Transactional(readOnly = true)
    public List<VendorDto> getAllVendors() {
        return handleExceptions(() ->
                vendorRepository.findAll().stream()
                        .map(vendorMapper::toDto)
                        .collect(Collectors.toList())
        );
    }

    @Transactional
    public VendorDto updateVendor(Long id, VendorDto vendorDto) {
        return handleExceptions(() -> {
            Vendor existingVendor = findVendorEntityById(id);
            vendorMapper.updateEntityFromDto(vendorDto, existingVendor);
            Vendor updatedVendor = vendorRepository.save(existingVendor);
            return vendorMapper.toDto(updatedVendor);
        });
    }

    @Transactional
    public void deleteVendor(Long id) {
        handleExceptions(() -> {
            Vendor vendor = findVendorEntityById(id);
            vendorRepository.delete(vendor);
            return null;
        });
    }
}

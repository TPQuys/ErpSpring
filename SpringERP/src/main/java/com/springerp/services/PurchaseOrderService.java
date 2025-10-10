package com.springerp.services;

import com.springerp.dtos.PurchaseOrderCreateDto;
import com.springerp.dtos.PurchaseOrderHeaderReadDto;
import com.springerp.dtos.PurchaseOrderLineDto;
import com.springerp.mappers.PurchaseOrderMapper;
import com.springerp.models.*;
import com.springerp.repositories.ItemRepository;
import com.springerp.repositories.PurchaseOrderHeaderRepository;
import com.springerp.repositories.UserRepository;
import com.springerp.repositories.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderHeaderRepository poHeaderRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemService itemService;
    private final PurchaseOrderMapper mapper;

    /**
     * Creates a new Purchase Order from DTO and returns the result as DTO.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto createPurchaseOrder(PurchaseOrderCreateDto dto) { // Return DTO
        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));

        User createdBy = userRepository.findById(dto.getCreatedById())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + dto.getCreatedById()));

        PurchaseOrderHeader header = new PurchaseOrderHeader();
        header.setPoNumber(dto.getPoNumber());
        header.setOrderDate(dto.getOrderDate());
        header.setVendor(vendor);
        header.setCreatedBy(createdBy);
        header.setStatus(PurchaseOrderHeader.Status.DRAFT);
        header.setLines(new ArrayList<>());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderLineDto lineDto : dto.getLines()) {
            Item item = itemRepository.findById(lineDto.getItemId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + lineDto.getItemId()));

            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrderHeader(header);
            line.setItem(item);
            line.setQuantity(lineDto.getQuantity());
            line.setUnitPrice(lineDto.getUnitPrice());
            BigDecimal lineTotal = lineDto.getQuantity().multiply(lineDto.getUnitPrice());
            line.setLineTotal(lineTotal);

            header.getLines().add(line);
            totalAmount = totalAmount.add(lineTotal);
        }

        header.setTotalAmount(totalAmount);

        PurchaseOrderHeader savedHeader = poHeaderRepository.save(header);
        return mapper.toDto(savedHeader); // Map Entity to DTO before returning
    }

    /**
     * Updates an existing Purchase Order and returns the result as DTO.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto updatePurchaseOrder(Long poId, PurchaseOrderCreateDto dto) { // Return DTO
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể sửa đơn hàng ở trạng thái DRAFT.");
        }

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));

        header.setPoNumber(dto.getPoNumber());
        header.setOrderDate(dto.getOrderDate());
        header.setVendor(vendor);

        header.getLines().clear();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderLineDto lineDto : dto.getLines()) {
            Item item = itemRepository.findById(lineDto.getItemId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + lineDto.getItemId()));

            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrderHeader(header);
            line.setItem(item);
            line.setQuantity(lineDto.getQuantity());
            line.setUnitPrice(lineDto.getUnitPrice());
            BigDecimal lineTotal = lineDto.getQuantity().multiply(lineDto.getUnitPrice());
            line.setLineTotal(lineTotal);

            header.getLines().add(line);
            totalAmount = totalAmount.add(lineTotal);
        }

        header.setTotalAmount(totalAmount);

        PurchaseOrderHeader updatedHeader = poHeaderRepository.save(header);
        return mapper.toDto(updatedHeader); // Map Entity to DTO before returning
    }

    /**
     * Deletes a DRAFT Purchase Order.
     */
    @Transactional
    public void deletePurchaseOrder(Long poId) {
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể xóa đơn hàng ở trạng thái DRAFT.");
        }

        poHeaderRepository.delete(header);
    }

    /**
     * Approves a DRAFT Purchase Order and returns the result as DTO.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto approvePurchaseOrder(Long poId) { // Return DTO
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể duyệt đơn hàng ở trạng thái DRAFT.");
        }

        header.setStatus(PurchaseOrderHeader.Status.APPROVED);
        PurchaseOrderHeader approvedHeader = poHeaderRepository.save(header);
        return mapper.toDto(approvedHeader); // Map Entity to DTO before returning
    }

    /**
     * Receives goods for an APPROVED Purchase Order, increases item stock, and returns the result as DTO.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto receiveGoods(Long poId) { // Return DTO
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể nhập hàng cho đơn hàng đã được DUYỆT.");
        }

        for (PurchaseOrderLine line : header.getLines()) {
            itemService.increaseStock(line.getItem().getItemId(), line.getQuantity());
        }

        header.setStatus(PurchaseOrderHeader.Status.RECEIVED);
        PurchaseOrderHeader receivedHeader = poHeaderRepository.save(header);
        return mapper.toDto(receivedHeader); // Map Entity to DTO before returning
    }

    /**
     * Finds a Purchase Order by ID and returns the result as DTO.
     */
    public PurchaseOrderHeaderReadDto findById(Long poId) { // Return DTO
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId));
        return mapper.toDto(header); // Map Entity to DTO before returning
    }

    /**
     * Finds all Purchase Orders and returns the list as DTOs.
     */
    public List<PurchaseOrderHeaderReadDto> findAll() { // Return List of DTOs
        return poHeaderRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}
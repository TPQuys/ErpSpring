package com.springerp.services;

import com.springerp.dtos.PurchaseOrderCreateDto;
import com.springerp.dtos.PurchaseOrderLineDto;
import com.springerp.models.*;
import com.springerp.repositories.ItemRepository;
import com.springerp.repositories.PurchaseOrderHeaderRepository;
import com.springerp.repositories.UserRepository;
import com.springerp.repositories.VendorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderHeaderRepository poHeaderRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemService itemService;

    @Transactional
    public PurchaseOrderHeader createPurchaseOrder(PurchaseOrderCreateDto dto) {
        // Tìm các entity liên quan
        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));
        User createdBy = userRepository.findById(dto.getCreatedById())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với ID: " + dto.getCreatedById()));

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
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mặt hàng với ID: " + lineDto.getItemId()));

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

        return poHeaderRepository.save(header);
    }

    @Transactional
    public PurchaseOrderHeader updatePurchaseOrder(Long poId, PurchaseOrderCreateDto dto) {
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + poId));

        // Kiểm tra trạng thái
        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new IllegalStateException("Chỉ có thể sửa đơn hàng ở trạng thái DRAFT.");
        }

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));

        header.setPoNumber(dto.getPoNumber());
        header.setOrderDate(dto.getOrderDate());
        header.setVendor(vendor);


        header.getLines().clear();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderLineDto lineDto : dto.getLines()) {
            Item item = itemRepository.findById(lineDto.getItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy mặt hàng với ID: " + lineDto.getItemId()));

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

        return poHeaderRepository.save(header);
    }


    @Transactional
    public void deletePurchaseOrder(Long poId) {
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new IllegalStateException("Chỉ có thể xóa đơn hàng ở trạng thái DRAFT.");
        }

        poHeaderRepository.delete(header);
    }


    @Transactional
    public PurchaseOrderHeader approvePurchaseOrder(Long poId) {
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new IllegalStateException("Chỉ có thể duyệt đơn hàng ở trạng thái DRAFT.");
        }

        header.setStatus(PurchaseOrderHeader.Status.APPROVED);
        return poHeaderRepository.save(header);
    }


    @Transactional
    public PurchaseOrderHeader receiveGoods(Long poId) {
        PurchaseOrderHeader header = poHeaderRepository.findById(poId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + poId));

        if (header.getStatus() != PurchaseOrderHeader.Status.APPROVED) {
            throw new IllegalStateException("Chỉ có thể nhập hàng cho đơn hàng đã được DUYỆT.");
        }

        for (PurchaseOrderLine line : header.getLines()) {
            itemService.increaseStock(line.getItem().getItemId(), line.getQuantity());
        }

        header.setStatus(PurchaseOrderHeader.Status.RECEIVED);
        return poHeaderRepository.save(header);
    }

    public PurchaseOrderHeader findById(Long poId) {
        return poHeaderRepository.findById(poId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + poId));
    }

    public List<PurchaseOrderHeader> findAll() {
        return poHeaderRepository.findAll();
    }
}
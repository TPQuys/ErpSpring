package com.springerp.services;

import com.springerp.dtos.PurchaseOrderCreateDto;
import com.springerp.dtos.PurchaseOrderHeaderReadDto;
import com.springerp.dtos.PurchaseOrderLineCreateDto;
import com.springerp.mappers.PurchaseOrderMapper;
import com.springerp.models.*;
import com.springerp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    private static final int SCALE = 2;

    private PurchaseOrderHeader findHeaderEntityById(Long poId) {
        return poHeaderRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId));
    }

    /**
     * Tính toán tổng tiền, tạo Line Entity, và ánh xạ các trường Header.
     */
    private BigDecimal updateLinesAndCalculateTotal(PurchaseOrderHeader header, PurchaseOrderCreateDto dto) {
        mapper.updateHeaderEntityFromDto(dto, header);

        if (header.getLines() == null) {
            header.setLines(new ArrayList<>());
        } else {
            header.getLines().clear();
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseOrderLineCreateDto lineDto : dto.getLines()) {
            Item item = itemRepository.findById(lineDto.getItemId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy mặt hàng với ID: " + lineDto.getItemId()));

            BigDecimal subtotal = lineDto.getQuantity().multiply(lineDto.getUnitPrice());
            BigDecimal discount = lineDto.getDiscountRate() != null
                    ? subtotal.multiply(lineDto.getDiscountRate().divide(new BigDecimal("100"), SCALE, RoundingMode.HALF_UP))
                    : BigDecimal.ZERO;

            BigDecimal lineTotal = subtotal.subtract(discount).setScale(SCALE, RoundingMode.HALF_UP);

            PurchaseOrderLine line = mapper.toEntity(lineDto);
            line.setPurchaseOrderHeader(header);
            line.setItem(item);
            line.setLineTotal(lineTotal);

            header.getLines().add(line);
            totalAmount = totalAmount.add(lineTotal);
        }

        header.setTotalAmount(totalAmount.setScale(SCALE, RoundingMode.HALF_UP));
        return totalAmount;
    }

    /**
     * Tạo mới một Đơn hàng Mua (Purchase Order) ở trạng thái DRAFT.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto createPurchaseOrder(PurchaseOrderCreateDto dto) {
        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));

        User createdBy = userRepository.findById(dto.getCreatedById())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + dto.getCreatedById()));

        PurchaseOrderHeader header = mapper.toEntity(dto);
        header.setVendor(vendor);
        header.setCreatedBy(createdBy);
        header.setStatus(PurchaseOrderHeader.Status.DRAFT);

        updateLinesAndCalculateTotal(header, dto);

        PurchaseOrderHeader savedHeader = poHeaderRepository.save(header);
        return mapper.toDto(savedHeader);
    }

    /**
     * Cập nhật thông tin chi tiết cho một Purchase Order đã tồn tại.
     * Chỉ cho phép sửa khi đơn hàng ở trạng thái DRAFT.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto updatePurchaseOrder(Long poId, PurchaseOrderCreateDto dto) {
        PurchaseOrderHeader header = findHeaderEntityById(poId);

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể sửa đơn hàng ở trạng thái DRAFT.");
        }

        if (!header.getVendor().getVendorId().equals(dto.getVendorId())) {
            Vendor newVendor = vendorRepository.findById(dto.getVendorId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));
            header.setVendor(newVendor);
        }

        updateLinesAndCalculateTotal(header, dto);

        return mapper.toDto(header);
    }

    /**
     * Xóa một Purchase Order đã tồn tại.
     * Chỉ cho phép xóa khi đơn hàng ở trạng thái DRAFT.
     */
    @Transactional
    public void deletePurchaseOrder(Long poId) {
        PurchaseOrderHeader header = findHeaderEntityById(poId);

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể xóa đơn hàng ở trạng thái DRAFT.");
        }
        poHeaderRepository.delete(header);
    }

    /**
     * Tìm kiếm và trả về thông tin chi tiết Purchase Order theo ID.
     */
    public PurchaseOrderHeaderReadDto findById(Long poId) {
        return mapper.toDto(findHeaderEntityById(poId));
    }

    /**
     * Lấy danh sách tất cả các Purchase Order.
     */
    public List<PurchaseOrderHeaderReadDto> findAll() {
        return poHeaderRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Duyệt một Purchase Order, chuyển trạng thái từ DRAFT sang APPROVED.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto approvePurchaseOrder(Long poId) {
        PurchaseOrderHeader header = findHeaderEntityById(poId);

        if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể duyệt đơn hàng ở trạng thái DRAFT.");
        }
        header.setStatus(PurchaseOrderHeader.Status.APPROVED);
        return mapper.toDto(header);
    }

    /**
     * Hủy một Purchase Order, chuyển trạng thái sang CANCELED.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto cancelPurchaseOrder(Long poId) {
        PurchaseOrderHeader header = findHeaderEntityById(poId);

        if (header.getStatus() == PurchaseOrderHeader.Status.RECEIVED || header.getStatus() == PurchaseOrderHeader.Status.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Không thể hủy đơn hàng đã nhận hàng hoặc đã đóng.");
        }

        header.setStatus(PurchaseOrderHeader.Status.CANCELED);
        return mapper.toDto(header);
    }

    /**
     * Xử lý Nhập kho toàn bộ số lượng hàng (Full Goods Receipt).
     * Tăng tồn kho và cập nhật số lượng đã nhận trong Line.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto receiveFullGoods(Long poId) {
        PurchaseOrderHeader header = findHeaderEntityById(poId);

        if (header.getStatus() != PurchaseOrderHeader.Status.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Chỉ có thể nhập hàng cho đơn hàng đã được DUYỆT.");
        }

        for (PurchaseOrderLine line : header.getLines()) {
            BigDecimal quantityToReceive = line.getQuantity().subtract(line.getReceivedQuantity());

            if (quantityToReceive.compareTo(BigDecimal.ZERO) > 0) {
                itemService.increaseStock(line.getItem().getItemId(), quantityToReceive);
                line.setReceivedQuantity(line.getQuantity());
            }
        }

        header.setStatus(PurchaseOrderHeader.Status.RECEIVED);
        return mapper.toDto(header);
    }

    /**
     * Khóa đơn hàng, chuyển trạng thái sang CLOSED.
     * Dùng khi đã hoàn tất quy trình mua hàng/thanh toán.
     */
    @Transactional
    public PurchaseOrderHeaderReadDto closePurchaseOrder(Long poId) {
        PurchaseOrderHeader header = findHeaderEntityById(poId);

        if (header.getStatus() == PurchaseOrderHeader.Status.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Không thể đóng đơn hàng ở trạng thái DRAFT.");
        }

        header.setStatus(PurchaseOrderHeader.Status.CLOSED);
        return mapper.toDto(header);
    }
}
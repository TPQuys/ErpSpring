package com.springerp.services;

import com.springerp.dtos.PurchaseOrderCreateDto;
import com.springerp.dtos.PurchaseOrderHeaderReadDto;
import com.springerp.dtos.PurchaseOrderReceiveLineDto;
import com.springerp.mappers.PurchaseOrderMapper;
import com.springerp.models.*;
import com.springerp.models.StockTransaction.Direction;
import com.springerp.models.StockTransaction.SourceType;
import com.springerp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderHeaderRepository poHeaderRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemService itemService;
    private final StockTransactionService stockTransactionService; // Sử dụng StockTransactionService
    private final PurchaseOrderMapper mapper;

    private static final int SCALE = 2;
    private final SequenceService sequenceService;

    // Helper xử lý try-catch chung
    private <T> T handleExceptions(ExceptionSupplier<T> supplier) {
        try {
            return supplier.get();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    @FunctionalInterface
    private interface ExceptionSupplier<T> {
        T get() throws Exception;
    }

    private PurchaseOrderHeader findHeaderEntityById(Long poId) {
        return handleExceptions(() ->
                poHeaderRepository.findById(poId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + poId))
        );
    }

    // Logic tính toán tổng tiền và cập nhật chi tiết dòng PO
    private BigDecimal updateLinesAndCalculateTotal(PurchaseOrderHeader header, PurchaseOrderCreateDto dto) {
        return handleExceptions(() -> {
            mapper.updateHeaderEntityFromDto(dto, header);

            if (header.getLines() == null) header.setLines(new ArrayList<>());
            else header.getLines().clear(); // Xóa các dòng cũ khi cập nhật

            BigDecimal totalAmount = BigDecimal.ZERO;

            for (var lineDto : dto.getLines()) {
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
        });
    }

    @Transactional
    public PurchaseOrderHeaderReadDto createPurchaseOrder(PurchaseOrderCreateDto dto) {
        return handleExceptions(() -> {
            // Nghiệp vụ: Kiểm tra trùng mã PO
            if(poHeaderRepository.findByPoNumber(dto.getPoNumber()).isPresent()){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã đơn hàng đã tồn tại ");
            }
            Vendor vendor = vendorRepository.findById(dto.getVendorId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));

            User createdBy = userRepository.findById(dto.getCreatedById())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + dto.getCreatedById()));
            String poNumber = sequenceService.generateNextPoNumber();

            PurchaseOrderHeader header = mapper.toEntity(dto);
            header.setPoNumber(poNumber);
            header.setVendor(vendor);
            header.setCreatedBy(createdBy);
            header.setStatus(PurchaseOrderHeader.Status.DRAFT); // Trạng thái khởi tạo

            updateLinesAndCalculateTotal(header, dto);

            return mapper.toDto(poHeaderRepository.save(header));
        });
    }

    @Transactional
    public PurchaseOrderHeaderReadDto updatePurchaseOrder(Long poId, PurchaseOrderCreateDto dto) {
        return handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);

            // Nghiệp vụ: Chỉ có thể sửa đơn hàng ở trạng thái DRAFT
            if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể sửa đơn hàng ở trạng thái DRAFT.");
            }

            // Nghiệp vụ: Kiểm tra và cập nhật Nhà cung cấp nếu thay đổi
            if (!header.getVendor().getVendorId().equals(dto.getVendorId())) {
                Vendor newVendor = vendorRepository.findById(dto.getVendorId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Không tìm thấy nhà cung cấp với ID: " + dto.getVendorId()));
                header.setVendor(newVendor);
            }

            // Nghiệp vụ: Kiểm tra trùng mã PO khi cập nhật (nếu mã có thay đổi)
            if (!header.getPoNumber().equals(dto.getPoNumber()) && poHeaderRepository.findByPoNumber(dto.getPoNumber()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã đơn hàng đã tồn tại ");
            }

            updateLinesAndCalculateTotal(header, dto);
            return mapper.toDto(header);
        });
    }

    @Transactional
    public void deletePurchaseOrder(Long poId) {
        handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);
            // Nghiệp vụ: Chỉ có thể xóa đơn hàng ở trạng thái DRAFT
            if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể xóa đơn hàng ở trạng thái DRAFT.");
            }
            poHeaderRepository.delete(header);
            return null;
        });
    }

    public PurchaseOrderHeaderReadDto findById(Long poId) {
        return handleExceptions(() -> mapper.toDto(findHeaderEntityById(poId)));
    }

    public List<PurchaseOrderHeaderReadDto> findAll() {
        return handleExceptions(() -> poHeaderRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList()));
    }

    @Transactional
    public PurchaseOrderHeaderReadDto approvePurchaseOrder(Long poId) {
        return handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);
            // Nghiệp vụ: Chỉ có thể duyệt đơn hàng từ DRAFT
            if (header.getStatus() != PurchaseOrderHeader.Status.DRAFT) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể duyệt đơn hàng ở trạng thái DRAFT.");
            }
            header.setStatus(PurchaseOrderHeader.Status.APPROVED);
            return mapper.toDto(header);
        });
    }

    @Transactional
    public PurchaseOrderHeaderReadDto cancelPurchaseOrder(Long poId) {
        return handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);

            // Nghiệp vụ: Không thể hủy nếu PO đã hoàn thành hoặc đóng
            if (header.getStatus() == PurchaseOrderHeader.Status.RECEIVED
                    || header.getStatus() == PurchaseOrderHeader.Status.CLOSED
                    ||  header.getStatus() == PurchaseOrderHeader.Status.PARTIALLY_RECEIVED
            ) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể hủy đơn hàng đã hoàn tất nhập kho hoặc đã đóng.");
            }
            header.setStatus(PurchaseOrderHeader.Status.CANCELED);
            return mapper.toDto(header);
        });
    }

    @Transactional
    public PurchaseOrderHeaderReadDto receiveFullGoods(Long poId) {
        return handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);
            LocalDateTime now = LocalDateTime.now();

            // Nghiệp vụ: Chỉ nhập hàng cho đơn đã DUYỆT hoặc NHẬN MỘT PHẦN
            if (header.getStatus() != PurchaseOrderHeader.Status.APPROVED && header.getStatus() != PurchaseOrderHeader.Status.PARTIALLY_RECEIVED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể nhập hàng cho đơn hàng đã được DUYỆT hoặc đã NHẬN MỘT PHẦN.");
            }

            // Lặp qua các dòng PO và nhận số lượng còn lại
            for (PurchaseOrderLine line : header.getLines()) {
                BigDecimal quantityToReceive = line.getQuantity().subtract(line.getReceivedQuantity());

                if (quantityToReceive.compareTo(BigDecimal.ZERO) > 0) {
                    // Kích hoạt nghiệp vụ tồn kho
                    itemService.increaseStock(line.getItem().getItemId(), quantityToReceive);

                    // Tạo giao dịch tồn kho (StockTransaction)
                    stockTransactionService.createTransaction(
                            line.getItem(),
                            quantityToReceive,
                            line.getUnitPrice(),
                            now,
                            Direction.IN,
                            SourceType.PURCHASE_RECEIPT,
                            header.getPoId()
                    );

                    // Cập nhật ReceivedQuantity trên dòng PO (Nhận đủ)
                    line.setReceivedQuantity(line.getQuantity());
                }
            }

            // Cập nhật trạng thái Header thành RECEIVED (vì đã nhận FULL)
            header.setStatus(PurchaseOrderHeader.Status.RECEIVED);

            return mapper.toDto(header);
        });
    }

    @Transactional
    public PurchaseOrderHeaderReadDto receiveGoods(Long poId, List<PurchaseOrderReceiveLineDto> receivedLines) {
        return handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);
            LocalDateTime now = LocalDateTime.now();

            // Nghiệp vụ: Kiểm tra trạng thái hợp lệ để nhận hàng
            if (header.getStatus() != PurchaseOrderHeader.Status.APPROVED && header.getStatus() != PurchaseOrderHeader.Status.PARTIALLY_RECEIVED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể nhập hàng cho đơn hàng đã được DUYỆT hoặc đã NHẬN MỘT PHẦN.");
            }

            boolean fullyReceived = true;

            // Dùng Map để truy cập Line hiệu quả hơn O(1)
            Map<Long, PurchaseOrderLine> poLinesMap = header.getLines().stream()
                    .collect(Collectors.toMap(PurchaseOrderLine::getPoLineId, line -> line));

            // Xử lý từng dòng nhận hàng gửi từ client
            for (PurchaseOrderReceiveLineDto receivedLineDto : receivedLines) {

                PurchaseOrderLine targetLine = poLinesMap.get(receivedLineDto.getPoLineId());
                if (targetLine == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy dòng PO với ID: " + receivedLineDto.getPoLineId());
                }

                BigDecimal receiveQty = receivedLineDto.getReceivedQuantity();
                BigDecimal currentReceived = targetLine.getReceivedQuantity();
                BigDecimal newReceivedTotal = currentReceived.add(receiveQty);

                // Kiểm tra số lượng đã nhận thực tế
                if (receiveQty.compareTo(BigDecimal.ZERO) <= 0) continue; // Bỏ qua nếu số lượng = 0

                // Nghiệp vụ: Ngăn chặn nhận quá số lượng đặt (Over-receiving)
                if (newReceivedTotal.compareTo(targetLine.getQuantity()) > 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Số lượng nhận vượt quá số lượng đặt hàng cho mặt hàng: " + targetLine.getItem().getName());
                }

                // Kích hoạt nghiệp vụ tồn kho (Side-effects)
                itemService.increaseStock(targetLine.getItem().getItemId(), receiveQty);

                // Tạo giao dịch tồn kho (StockTransaction)
                stockTransactionService.createTransaction(
                        targetLine.getItem(),
                        receiveQty,
                        targetLine.getUnitPrice(),
                        now,
                        Direction.IN,
                        SourceType.PURCHASE_RECEIPT,
                        header.getPoId()
                );

                // Cập nhật ReceivedQuantity trên dòng PO
                targetLine.setReceivedQuantity(newReceivedTotal);
            }

            // Cập nhật trạng thái Header
            // Kiểm tra sau khi xử lý tất cả các dòng PO
            for (PurchaseOrderLine line : header.getLines()) {
                if (line.getReceivedQuantity().compareTo(line.getQuantity()) < 0) {
                    fullyReceived = false;
                    break;
                }
            }

            if (fullyReceived) {
                header.setStatus(PurchaseOrderHeader.Status.RECEIVED);
            } else {
                // Nghiệp vụ: Cập nhật trạng thái PARTIALLY_RECEIVED nếu chưa đủ
                header.setStatus(PurchaseOrderHeader.Status.PARTIALLY_RECEIVED);
            }

            return mapper.toDto(header);
        });
    }

    @Transactional
    public PurchaseOrderHeaderReadDto closePurchaseOrder(Long poId) {
        return handleExceptions(() -> {
            PurchaseOrderHeader header = findHeaderEntityById(poId);
            // Nghiệp vụ: Không thể đóng đơn hàng ở trạng thái DRAFT
            if (header.getStatus() == PurchaseOrderHeader.Status.DRAFT) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đóng đơn hàng ở trạng thái DRAFT.");
            }
            header.setStatus(PurchaseOrderHeader.Status.CLOSED);
            return mapper.toDto(header);
        });
    }
}
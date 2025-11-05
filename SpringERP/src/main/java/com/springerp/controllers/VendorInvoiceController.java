package com.springerp.controllers;

import com.springerp.dtos.InvoiceCreateDto;
import com.springerp.dtos.InvoiceResponseDto;
import com.springerp.dtos.InvoiceUpdateDto;
import com.springerp.dtos.PurchaseOrderHeaderReadDto;
import com.springerp.mappers.InvoiceMapper;
import com.springerp.models.InvoiceHeader;
import com.springerp.services.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendor-invoices") // ✅ Đổi tên endpoint
@RequiredArgsConstructor
public class VendorInvoiceController { // ✅ Đổi tên class

    private final InvoiceService invoiceService;
    private final InvoiceMapper invoiceMapper;

    // --- 1. TẠO HÓA ĐƠN MUA (VENDOR INVOICE) ---

    /**
     * POST /api/v1/vendor-invoices
     * Tạo hóa đơn mua (Vendor Invoice) và thực hiện kiểm tra 3-Way Match.
     */
    @PostMapping
    public ResponseEntity<InvoiceResponseDto> createVendorInvoice(@Valid @RequestBody InvoiceCreateDto createDto) {
        // Chỉ chấp nhận tạo hóa đơn MUA
        if (createDto.getRefType() != InvoiceHeader.RefType.PURCHASE) {
            // Tránh sử dụng endpoint không đúng mục đích
            throw new IllegalArgumentException("Hóa đơn phải là loại PURCHASE (RefType: PURCHASE) cho endpoint này.");
        }

        InvoiceHeader savedInvoice = invoiceService.createVendorInvoice(createDto);
        return new ResponseEntity<>(invoiceMapper.toResponseDto(savedInvoice), HttpStatus.CREATED);
    }

    @PutMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponseDto> updateInvoice(@PathVariable Long invoiceId, @RequestBody InvoiceUpdateDto invoiceData) {
        System.out.println("Received Update DTO: " + invoiceData.toString());
        InvoiceResponseDto updatedInvoice = invoiceService.updateInvoice(invoiceId, invoiceData);
        return ResponseEntity.ok(updatedInvoice);
    }

    // --- 2. HÀM NGHIỆP VỤ (DUYỆT) ---

    /**
     * POST /api/v1/vendor-invoices/{invoiceId}/approve
     * Duyệt hóa đơn mua, chuyển trạng thái từ DRAFT sang APPROVED.
     */
    @PostMapping("/{invoiceId}/approve")
    public ResponseEntity<InvoiceResponseDto> approveInvoice(@PathVariable Long invoiceId) {
        InvoiceHeader approvedInvoice = invoiceService.approveInvoice(invoiceId);
        return ResponseEntity.ok(invoiceMapper.toResponseDto(approvedInvoice));
    }

    // --- 3. TRA CỨU (READ) ---

    /**
     * GET /api/v1/vendor-invoices/{invoiceId}
     * Lấy chi tiết một hóa đơn mua.
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponseDto> getInvoiceById(@PathVariable Long invoiceId) {
        InvoiceHeader invoice = invoiceService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(invoiceMapper.toResponseDto(invoice));
    }

    /**
     * GET /api/v1/vendor-invoices
     * Lấy danh sách tất cả hóa đơn mua (AP).
     */
    @GetMapping
    public ResponseEntity<List<InvoiceResponseDto>> getAllInvoices() {
        // Có thể thêm logic lọc theo RefType = PURCHASE tại đây nếu cần
        List<InvoiceHeader> invoices = invoiceService.getAllInvoices().stream()
                .filter(inv -> inv.getRefType() == InvoiceHeader.RefType.PURCHASE)
                .toList();

        List<InvoiceResponseDto> dtos = invoices.stream()
                .map(invoiceMapper::toResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // --- 4. XÓA (DELETE) ---

    /**
     * DELETE /api/v1/vendor-invoices/{invoiceId}
     * Xóa hóa đơn mua (Chỉ cho phép khi trạng thái là DRAFT).
     */
    @DeleteMapping("/{invoiceId}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long invoiceId) {
        invoiceService.deleteInvoice(invoiceId);
        return ResponseEntity.noContent().build();
    }

    /** Hủy đơn hàng: DRAFT/APPROVED -> CANCELED */
    @PostMapping("/{id}/cancel") // ✅ Bổ sung endpoint
    public ResponseEntity<InvoiceResponseDto> cancelPO(@PathVariable Long id) {
        InvoiceResponseDto canceledPO = invoiceService.cancelInvoice(id);
        return ResponseEntity.ok(canceledPO);
    }

    @GetMapping("/{invoiceId}/print")
    public ResponseEntity<byte[]> printInvoice(@PathVariable Long invoiceId) {
        try {
            // 1. Gọi Service để tạo PDF
            byte[] pdfBytes = invoiceService.generateInvoicePdf(invoiceId);

            // 2. Định cấu hình header phản hồi
            HttpHeaders headers = new HttpHeaders();
            // Thông báo cho trình duyệt biết đây là file đính kèm
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("hoa_don_" + invoiceId + ".pdf")
                    .build());
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            // Xử lý lỗi
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
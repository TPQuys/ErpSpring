package com.springerp.controllers;

import com.springerp.dtos.PurchaseOrderCreateDto;
import com.springerp.dtos.PurchaseOrderHeaderReadDto;
import com.springerp.services.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<PurchaseOrderHeaderReadDto> createPO(@RequestBody PurchaseOrderCreateDto dto) {
        PurchaseOrderHeaderReadDto createdPO = purchaseOrderService.createPurchaseOrder(dto);
        return new ResponseEntity<>(createdPO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderHeaderReadDto> updatePO(@PathVariable Long id, @RequestBody PurchaseOrderCreateDto dto) {
        PurchaseOrderHeaderReadDto updatedPO = purchaseOrderService.updatePurchaseOrder(id, dto);
        return ResponseEntity.ok(updatedPO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePO(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderHeaderReadDto> getPOById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderHeaderReadDto>> getAllPOs() {
        return ResponseEntity.ok(purchaseOrderService.findAll());
    }

    // --- CHUYỂN TRẠNG THÁI NGHIỆP VỤ ---

    /** Duyệt đơn hàng: DRAFT -> APPROVED */
    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrderHeaderReadDto> approvePO(@PathVariable Long id) {
        PurchaseOrderHeaderReadDto approvedPO = purchaseOrderService.approvePurchaseOrder(id);
        return ResponseEntity.ok(approvedPO);
    }

    /** Nhận hàng (Toàn bộ): APPROVED -> RECEIVED */
    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderHeaderReadDto> receiveFullGoods(@PathVariable Long id) {
        PurchaseOrderHeaderReadDto receivedPO = purchaseOrderService.receiveFullGoods(id);
        return ResponseEntity.ok(receivedPO);
    }

    /** Hủy đơn hàng: DRAFT/APPROVED -> CANCELED */
    @PostMapping("/{id}/cancel") // ✅ Bổ sung endpoint
    public ResponseEntity<PurchaseOrderHeaderReadDto> cancelPO(@PathVariable Long id) {
        PurchaseOrderHeaderReadDto canceledPO = purchaseOrderService.cancelPurchaseOrder(id);
        return ResponseEntity.ok(canceledPO);
    }

    /** Đóng đơn hàng: RECEIVED/CANCELED -> CLOSED */
    @PostMapping("/{id}/close")
    public ResponseEntity<PurchaseOrderHeaderReadDto> closePO(@PathVariable Long id) {
        PurchaseOrderHeaderReadDto closedPO = purchaseOrderService.closePurchaseOrder(id);
        return ResponseEntity.ok(closedPO);
    }
}
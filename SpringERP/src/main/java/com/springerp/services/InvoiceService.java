package com.springerp.services;

import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.springerp.dtos.InvoiceCreateDto;
import com.springerp.dtos.InvoiceLineDto;
import com.springerp.dtos.InvoiceResponseDto;
import com.springerp.dtos.InvoiceUpdateDto;
import com.springerp.mappers.InvoiceMapper;
import com.springerp.models.*;
import com.springerp.repositories.*;
import lombok.RequiredArgsConstructor; // ✅ Sử dụng RequiredArgsConstructor thay vì @Autowired từng cái
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException; // ✅ Sử dụng ResponseStatusException

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import org.thymeleaf.TemplateEngine;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;

@Service
@RequiredArgsConstructor // ✅ Dùng Lombok để inject dependencies qua constructor
public class InvoiceService {

    private final InvoiceHeaderRepository invoiceHeaderRepository;
    private final PurchaseOrderHeaderRepository poHeaderRepository;
    private final PurchaseOrderLineRepository poLineRepository;
    private final VendorRepository vendorRepository;
    private final ItemRepository itemRepository;
    private final InvoiceMapper invoiceMapper;
    // ===================================================================
    // I. LOGIC XỬ LÝ NGOẠI LỆ (TỪ VendorService)
    // ===================================================================

    @FunctionalInterface
    private interface ExceptionSupplier<T> {
        T get() throws Exception;
    }

    /**
     * Hàm bao bọc logic nghiệp vụ để thống nhất xử lý các ngoại lệ.
     */
    private <T> T handleExceptions(ExceptionSupplier<T> supplier) {
        try {
            return supplier.get();
        } catch (ResponseStatusException e) {
            throw e; // Ném lại các exception đã được định nghĩa
        } catch (Exception e) {
            // Chuyển đổi các RuntimeException/Checked Exception khác thành 500
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage(), e);
        }
    }

    /**
     * Hàm tìm kiếm Entity InvoiceHeader và ném ResponseStatusException NOT_FOUND.
     */
    private InvoiceHeader findInvoiceHeaderEntityById(Long id) {
        return handleExceptions(() ->
                invoiceHeaderRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Không tìm thấy Hóa đơn với ID: " + id))
        );
    }

    // ===================================================================
    // II. HÀM NGHIỆP VỤ CHÍNH: TẠO VÀ DUYỆT HÓA ĐƠN MUA
    // ===================================================================

    @Transactional
    public InvoiceHeader createVendorInvoice(InvoiceCreateDto createDto) {
        return handleExceptions(() -> {
            // 1. Kiểm tra PO và Vendor
            PurchaseOrderHeader poHeader = poHeaderRepository.findById(createDto.getRefId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Đơn hàng Mua (PO) không tồn tại."));

            if (!poHeader.getVendor().getVendorId().equals(createDto.getPartnerId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Nhà cung cấp trên Hóa đơn không khớp với Nhà cung cấp trên PO.");
            }

            // 2. Map DTO -> Header Entity
            InvoiceHeader newInvoice = invoiceMapper.toHeaderEntity(createDto);
            newInvoice.setRefType(InvoiceHeader.RefType.PURCHASE);
            newInvoice.setInvoiceStatus(InvoiceHeader.InvoiceStatus.DRAFT);

            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal totalTax = BigDecimal.ZERO;
            BigDecimal subTotal = BigDecimal.ZERO;

            // 3. Xử lý các dòng hóa đơn và kiểm tra 3-Way Match
            for (InvoiceLineDto lineDto : createDto.getLines()) {
                PurchaseOrderLine poLine = poLineRepository.findById(lineDto.getRefLineId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Dòng PO (RefLineId) không tồn tại: " + lineDto.getRefLineId()));

                Item item = itemRepository.findById(lineDto.getItemId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Mặt hàng (Item) không tồn tại: " + lineDto.getItemId()));

                BigDecimal quantityToInvoice = lineDto.getQuantity();

                // Tính số lượng TỐI ĐA có thể lập hóa đơn: (SL đã nhận - SL đã lập hóa đơn)
                BigDecimal maxInvoicableQty = poLine.getReceivedQuantity().subtract(poLine.getInvoicedQuantity());

                // KIỂM TRA 3-WAY MATCH: Số lượng
                if (quantityToInvoice.compareTo(maxInvoicableQty) > 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Lỗi khớp số lượng: Không thể lập hóa đơn quá " + maxInvoicableQty +
                                    " cho mặt hàng: " + item.getName()
                    );
                }

                // KIỂM TRA 3-WAY MATCH: Giá
                if (lineDto.getUnitPrice().compareTo(poLine.getUnitPrice()) != 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Đơn giá hóa đơn không khớp với đơn giá PO gốc.");
                }

                // 4. Tạo Invoice Line Entity và tính tổng
                InvoiceLine invoiceLine = invoiceMapper.toLineEntity(lineDto);
                invoiceLine.setInvoiceHeader(newInvoice);
                invoiceLine.setItem(item);

                // Tính toán tổng tiền Line
                BigDecimal lineTotal = lineDto.getQuantity().multiply(lineDto.getUnitPrice());
                BigDecimal lineTaxAmount = lineTotal.multiply(lineDto.getTaxRate());

                invoiceLine.setLineTotal(lineTotal);
                invoiceLine.setLineTaxAmount(lineTaxAmount);

                newInvoice.getLines().add(invoiceLine);

                // Cập nhật tổng Header
                subTotal = subTotal.add(lineTotal);
                totalTax = totalTax.add(lineTaxAmount);

                // 5. Cập nhật số lượng đã lập hóa đơn trên DÒNG PO GỐC
                poLine.setInvoicedQuantity(poLine.getInvoicedQuantity().add(quantityToInvoice));
                poLineRepository.save(poLine);
            }

            // 6. Cập nhật tổng tiền Header
            newInvoice.setSubTotal(subTotal);
            newInvoice.setTaxAmount(totalTax);
            newInvoice.setTotalAmount(subTotal.add(totalTax));

            updatePurchaseOrderStatus(poHeader);

            return invoiceHeaderRepository.save(newInvoice);
        });
    }
    @Transactional
    public InvoiceResponseDto updateInvoice(Long invoiceId, InvoiceUpdateDto updateDto) {
        return handleExceptions(() -> {
            InvoiceHeader header = getInvoiceById(invoiceId);

            // --- 1. KIỂM TRA NGHIỆP VỤ (KHÔNG THỂ CẬP NHẬT) ---
            if (header.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.PAID
                    || header.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.PARTIALLY_PAID
                    || header.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.CANCELED) {

                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Không thể cập nhật hóa đơn đã thanh toán hoặc đã hủy.");
            }

            // --- 2. CẬP NHẬT CÁC TRƯỜNG THÔNG TIN CHUNG (HEADER) ---

            // Ánh xạ các trường Header từ DTO
            header.setInvoiceDate(updateDto.getInvoiceDate());
            header.setInvoiceNumber(updateDto.getInvoiceNumber());
            header.setDueDate(updateDto.getDueDate());
            header.setNotes(updateDto.getNotes());


            // --- 3. CẬP NHẬT DÒNG HÀNG (LINES) ---

            // Chỉ cho phép thay đổi dòng hàng khi ở trạng thái DRAFT VÀ DTO có dữ liệu lines
            if (header.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.DRAFT && updateDto.getLines() != null) {

                // 1. Xóa tất cả các dòng cũ trong collection được Hibernate quản lý
                header.getLines().clear();

                // 2. TẠO CÁC DÒNG MỚI từ DTOs VÀ SỬ DỤNG MAPPER
                List<InvoiceLine> newLines = updateDto.getLines().stream()
                        .map(invoiceMapper::toLineEntity) // Ánh xạ từ DTO sang Entity Line
                        .peek(line -> line.setInvoiceHeader(header)) // Thiết lập mối quan hệ ngược lại
                        .toList(); // Java 16+ .toList() hoặc .collect(Collectors.toList())

                // 3. THÊM các dòng mới vào TẬP HỢP CŨ (giải quyết lỗi HibernateException)
                header.getLines().addAll(newLines);

                // 3c. Tính toán lại tổng tiền sau khi Lines thay đổi
                recalculateTotals(header);

            } else if (updateDto.getLines() != null && !updateDto.getLines().isEmpty()) {
                // Nếu trạng thái là SUBMITTED/APPROVED, KHÔNG cho phép sửa LINES
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Không thể sửa đổi dòng hàng khi hóa đơn đã được gửi hoặc duyệt.");
            }

            // --- 4. LƯU VÀ TRẢ VỀ ---
            invoiceHeaderRepository.save(header);

            return invoiceMapper.toResponseDto(header);
        });
    }
    private void recalculateTotals(InvoiceHeader header) {
        BigDecimal subTotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;

        for (InvoiceLine line : header.getLines()) {
            // Tính Line Total (Quantity * UnitPrice)
            BigDecimal lineTotal = line.getQuantity().multiply(line.getUnitPrice());

            // Tính Line Tax Amount
            BigDecimal lineTaxAmount = lineTotal.multiply(line.getTaxRate());

            line.setLineTotal(lineTotal);
            line.setLineTaxAmount(lineTaxAmount);

            subTotal = subTotal.add(lineTotal);
            taxAmount = taxAmount.add(lineTaxAmount);
        }

        header.setSubTotal(subTotal);
        header.setTaxAmount(taxAmount);
        header.setTotalAmount(subTotal.add(taxAmount));
    }

    @Transactional
    public InvoiceHeader approveInvoice(Long invoiceId) {
        return handleExceptions(() -> {
            InvoiceHeader invoice = findInvoiceHeaderEntityById(invoiceId);

            if (invoice.getInvoiceStatus() != InvoiceHeader.InvoiceStatus.DRAFT) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Chỉ hóa đơn DRAFT mới có thể được duyệt.");
            }

            invoice.setInvoiceStatus(InvoiceHeader.InvoiceStatus.APPROVED);
            return invoiceHeaderRepository.save(invoice);
        });
    }

    @Transactional // Có thể bỏ @Transactional nếu hàm này được gọi từ hàm @Transactional khác (như createVendorInvoice)
    protected void updatePurchaseOrderStatus(PurchaseOrderHeader poHeader) {

        List<PurchaseOrderLine> poLines = poHeader.getLines();

        // 2. Phân tích trạng thái hóa đơn của các dòng hàng
        boolean allLinesFullyInvoiced = true;
        boolean hasAnyInvoicedQuantity = false;

        for (PurchaseOrderLine line : poLines) {
            // Kiểm tra xem đã có bất kỳ số lượng nào được lập hóa đơn chưa
            if (line.getInvoicedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                hasAnyInvoicedQuantity = true;
            }

            // Kiểm tra xem số lượng đã nhận của dòng này đã được lập hóa đơn hết chưa
            if (line.getReceivedQuantity().compareTo(line.getInvoicedQuantity()) > 0) {
                // Nếu tìm thấy một dòng mà (SL Đã nhận > SL Đã lập hóa đơn)
                // thì PO này CHƯA được lập hóa đơn đầy đủ.
                allLinesFullyInvoiced = false;
            }
        }

        // 3. Quyết định trạng thái mới của PO Header
        if (allLinesFullyInvoiced && hasAnyInvoicedQuantity) {
            // Tất cả các dòng đều đã được lập hóa đơn hết số lượng đã nhận (>= Received)
            poHeader.setInvoiceStatus(PurchaseOrderHeader.InvoiceStatus.INVOICED);
        } else if (hasAnyInvoicedQuantity) {
            // Đã có số lượng được lập hóa đơn, nhưng chưa hoàn tất
            poHeader.setInvoiceStatus(PurchaseOrderHeader.InvoiceStatus.PARTIALLY_INVOICED);
        }
        poHeaderRepository.save(poHeader);
    }

    // ===================================================================
    // III. HÀM QUẢN LÝ CƠ BẢN (CRUD)
    // ===================================================================

    @Transactional(readOnly = true)
    public InvoiceHeader getInvoiceById(Long invoiceId) {
        return handleExceptions(() -> findInvoiceHeaderEntityById(invoiceId));
    }

    @Transactional(readOnly = true)
    public List<InvoiceHeader> getAllInvoices() {
        return handleExceptions(invoiceHeaderRepository::findAll);
    }

    @Transactional
    public void deleteInvoice(Long invoiceId) {
        handleExceptions(() -> {
            InvoiceHeader invoice = findInvoiceHeaderEntityById(invoiceId);

            if (invoice.getInvoiceStatus() != InvoiceHeader.InvoiceStatus.DRAFT) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Chỉ có thể xóa hóa đơn ở trạng thái DRAFT.");
            }

          updatePOQuantityAndStatus(invoice);
            invoiceHeaderRepository.delete(invoice);
            return null;
        });
    }

    @Transactional
    public InvoiceResponseDto cancelInvoice(Long invoiceID) {
        return handleExceptions(() -> {
            InvoiceHeader header = getInvoiceById(invoiceID);

            // 1. KIỂM TRA NGHIỆP VỤ (Đã thanh toán)
            if (header.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.PARTIALLY_PAID
                    || header.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.PAID
            ) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể hủy hóa đơn đã thanh toán.");
            }

            // Cập nhật trạng thái hóa đơn hiện tại
            header.setInvoiceStatus(InvoiceHeader.InvoiceStatus.CANCELED);

            // 2. ĐẢO NGƯỢC SỐ LƯỢNG ĐÃ LẬP HÓA ĐƠN TRÊN PO
           updatePOQuantityAndStatus(header);

            // 4. Bút toán Kế toán (Cần thực hiện logic đảo ngược bút toán AP/GL ở đây)
            // accountingService.reverseJournalEntries(header);

            return invoiceMapper.toResponseDto(header);
        });
    }


    // ===================================================================
    // IV. HÀM HỖ TRỢ (DÙNG CHO PAYMENT SERVICE)
    // ===================================================================

    private void updatePOQuantityAndStatus(InvoiceHeader header) {
        for (InvoiceLine line : header.getLines()) {
            // SỬA LỖI: Sử dụng orElseThrow để xử lý Optional an toàn
            PurchaseOrderLine poLine = poLineRepository.findById(line.getRefLineId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dòng PO gốc."));

            // Giảm số lượng đã lập hóa đơn trên PO đi số lượng của hóa đơn này
            poLine.setInvoicedQuantity(poLine.getInvoicedQuantity().subtract(line.getQuantity()));
            poLineRepository.save(poLine);
        }

        // 3. XỬ LÝ TRẠNG THÁI PO GỐC
        PurchaseOrderHeader purchaseOrderHeader = poHeaderRepository.findById(header.getRefId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy PO gốc."));

        // Tối ưu hóa: Thay vì duyệt list, chỉ cần kiểm tra xem còn hóa đơn ACTIVE nào không.

        // 💡 Bước 3.1: Tìm kiếm xem PO này còn hóa đơn nào CHƯA HỦY không
        boolean hasActiveInvoices = invoiceHeaderRepository
                .existsByRefIdAndInvoiceStatusNot(
                        header.getRefId(),
                        InvoiceHeader.InvoiceStatus.CANCELED
                );

        if (hasActiveInvoices) {
            // Nếu vẫn còn hóa đơn chưa hủy -> PO vẫn còn đang được lập hóa đơn (PARTIALLY_INVOICED)
            purchaseOrderHeader.setInvoiceStatus(PurchaseOrderHeader.InvoiceStatus.PARTIALLY_INVOICED);
        } else {
            // Nếu TẤT CẢ hóa đơn đã bị hủy -> Cần kiểm tra trạng thái hoàn thành khác.
            // Nếu tất cả các dòng PO đều đã được nhận hàng và chưa được lập hóa đơn đầy đủ (dưới góc độ thanh toán),
            // thì trạng thái có thể quay lại OPEN/NEW hoặc tùy thuộc vào logic nghiệp vụ của bạn.

            // Giả định nếu không còn hóa đơn nào -> Đặt lại trạng thái PO thành OPEN để có thể lập hóa đơn mới
            purchaseOrderHeader.setInvoiceStatus(PurchaseOrderHeader.InvoiceStatus.NONE);
        }

        poHeaderRepository.save(purchaseOrderHeader);
    }

    @Transactional
    public InvoiceHeader updatePaymentStatus(Long invoiceId, BigDecimal newTotalPaidAmount) {
        return handleExceptions(() -> {
            InvoiceHeader invoice = findInvoiceHeaderEntityById(invoiceId);

            if (newTotalPaidAmount.compareTo(invoice.getTotalAmount()) >= 0) {
                invoice.setInvoiceStatus(InvoiceHeader.InvoiceStatus.PAID);
            } else if (newTotalPaidAmount.compareTo(BigDecimal.ZERO) > 0) {
                invoice.setInvoiceStatus(InvoiceHeader.InvoiceStatus.PARTIALLY_PAID);
            } else {
                // Giữ trạng thái hiện tại nếu không có thanh toán mới (ví dụ: APPROVED)
                // Hoặc nếu nó bị ghi nợ lại về 0, chuyển về APPROVED nếu đang là PARTIALLY_PAID/PAID
                if (invoice.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.PARTIALLY_PAID ||
                        invoice.getInvoiceStatus() == InvoiceHeader.InvoiceStatus.PAID) {
                    // Nếu tổng tiền thanh toán về 0, chuyển về APPROVED (hoặc DRAFT tùy quy tắc)
                    invoice.setInvoiceStatus(InvoiceHeader.InvoiceStatus.APPROVED);
                }
            }

            return invoiceHeaderRepository.save(invoice);
        });
    }
    // Trong InvoiceService.java (Logic generateInvoicePdf)

    @Transactional
    public byte[] generateInvoicePdf(Long invoiceId) {

        InvoiceHeader invoiceData = getInvoiceById(invoiceId);
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {

            PdfWriter.getInstance(document, os);
            document.open();

            // 💡 BƯỚC 1: KHẮC PHỤC LỖI FONT TIẾNG VIỆT
            String fontPath = "fonts/arial.ttf";
            BaseFont baseFont = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

            Font titleFont = new Font(baseFont, 16, Font.BOLD);
            Font bodyFontBold = new Font(baseFont, 11, Font.BOLD);
            Font bodyFontNormal = new Font(baseFont, 11, Font.NORMAL);
            Font smallFont = new Font(baseFont, 9, Font.NORMAL);

            // --- 1. HEADER và THÔNG TIN CHUNG ---

            // Tiêu đề
            Paragraph title = new Paragraph("HÓA ĐƠN MUA HÀNG", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // Số PO gốc và Số Hóa đơn
            document.add(new Paragraph("Số Hóa đơn: " + invoiceData.getInvoiceNumber(), bodyFontBold));
            document.add(new Paragraph("Tham chiếu PO: " + invoiceData.getRefId(), bodyFontNormal));
            document.add(new Paragraph("Ngày Lập: " + invoiceData.getInvoiceDate()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), bodyFontNormal));

            document.add(Chunk.NEWLINE);

            // --- 2. THÔNG TIN VENDOR VÀ BUYER (Dùng Table 2 cột) ---

            Vendor vendor = vendorRepository.findById(invoiceData.getPartnerId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Vendor"));

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(10f);

            // Lấy thông tin Công ty bạn (Giả định có một Service/Config để lấy thông tin này)
            // CompanyInfo buyerInfo = companyInfoService.getOurCompanyInfo();


            // Cột 1: Thông tin Nhà Cung Cấp (Vendor)
            PdfPCell vendorCell = createInfoCell("NHÀ CUNG CẤP", vendor.getName(), vendor.getTaxCode(), vendor.getAddress(), bodyFontBold, bodyFontNormal);
            infoTable.addCell(vendorCell);

            document.add(infoTable);
            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE); // Tạo thêm khoảng trống

            // --- 3. CHI TIẾT DÒNG HÀNG ---

            PdfPTable table = createInvoiceLinesTable(invoiceData, baseFont);
            document.add(table);

            document.add(Chunk.NEWLINE);

            // --- 4. TÓM TẮT TỔNG TIỀN VÀ GHI CHÚ ---

            // Tóm tắt Tổng tiền
            addSummary(document, invoiceData.getSubTotal(), invoiceData.getTaxAmount(), invoiceData.getTotalAmount(), baseFont);

            document.add(Chunk.NEWLINE);

            // Ghi chú và Chữ ký
            document.add(new Paragraph("Ghi chú: " + (invoiceData.getNotes() != null ? invoiceData.getNotes() : ""), smallFont));

            document.add(Chunk.NEWLINE);
            document.add(createSignatureBlock(baseFont)); // Thêm khối chữ ký

            document.close();
            return os.toByteArray();

        } catch (DocumentException | IOException e) {
            System.err.println(e.getMessage());
            throw new RuntimeException("Lỗi khi tạo file PDF bằng OpenPDF.", e);
        }
    }

    // Hàm hỗ trợ tạo bảng chi tiết
    private PdfPTable createInvoiceLinesTable(InvoiceHeader invoiceData, BaseFont baseFont) throws DocumentException {
        // ... Logic tạo bảng chi tiết dòng hàng bằng PdfPTable của OpenPDF ...
        // (Đây là phần tốn thời gian nhất và cần thiết kế cẩn thận)
        Font headerFont = new Font(baseFont, 10, Font.BOLD);
        Font cellFont = new Font(baseFont, 10, Font.NORMAL);
        PdfPTable table = new PdfPTable(4); // 4 cột
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);

        table.addCell(new Phrase("Mặt hàng", headerFont));
        table.addCell(new Phrase("SL", headerFont));
        table.addCell(new Phrase("Đơn giá", headerFont));
        table.addCell(new Phrase("Thành tiền", headerFont));

        // Vòng lặp thêm dữ liệu dòng hàng
        for (InvoiceLine line : invoiceData.getLines()) {
            table.addCell(String.valueOf(line.getItem().getItemCode()));
            table.addCell(String.valueOf(line.getQuantity()));
            table.addCell(formatCurrency(line.getUnitPrice()));
            table.addCell(formatCurrency(line.getLineTotal().add(line.getLineTaxAmount())));
        }

        return table;
    }

    // Hàm hỗ trợ định dạng tiền tệ (cần tùy chỉnh)
    private String formatCurrency(BigDecimal amount) {
        return java.text.NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(amount);
    }

    // Hàm hỗ trợ thêm tóm tắt
    private void addSummary(Document document, BigDecimal subTotal, BigDecimal taxAmount, BigDecimal totalAmount, BaseFont baseFont) throws DocumentException {

        // Khởi tạo các Font cần thiết
        Font labelFont = new Font(baseFont, 11, Font.NORMAL);
        Font totalFont = new Font(baseFont, 12, Font.BOLD);

        // Sử dụng định dạng tiền tệ Việt Nam (có dấu phân cách hàng nghìn)
        DecimalFormat formatter = (DecimalFormat) NumberFormat.getInstance(new Locale("vi", "VN"));
        formatter.applyPattern("#,##0"); // Định dạng không có ký hiệu tiền tệ

        // Tạo bảng 2 cột cho tóm tắt
        // Chiều rộng tổng 40% trang, để có thể căn phải
        PdfPTable summaryContainer = new PdfPTable(1);
        summaryContainer.setWidthPercentage(40);

        // Đặt căn chỉnh cho Container (Căn phải)
        summaryContainer.setHorizontalAlignment(Element.ALIGN_RIGHT);

        // Tạo bảng chi tiết 2 cột (Nhãn | Giá trị)
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100); // Chiếm 100% của container (40% trang)
        summaryTable.setWidths(new float[]{6f, 4f}); // Cột nhãn rộng hơn cột giá trị

        // --- 1. Tổng Cộng (Chưa Thuế) ---
        addSummaryRow(summaryTable, "Tổng cộng (Chưa thuế):", formatter.format(subTotal) + " VND", labelFont, labelFont, false);

        // --- 2. Thuế VAT ---
        addSummaryRow(summaryTable, "Thuế VAT:", formatter.format(taxAmount) + " VND", labelFont, labelFont, false);

        // --- 3. TỔNG TIỀN PHẢI THANH TOÁN ---
        addSummaryRow(summaryTable, "TỔNG TIỀN THANH TOÁN:", formatter.format(totalAmount) + " VND", totalFont, totalFont, true);

        // Thêm bảng chi tiết vào container và thêm container vào document
        document.add(summaryContainer);

        // Cần thêm bảng chi tiết vào container cell (mẹo để căn phải)
        PdfPCell containerCell = new PdfPCell(summaryTable);
        containerCell.setBorder(0);
        summaryContainer.addCell(containerCell);

        document.add(summaryContainer);
    }

    /**
     * Hàm hỗ trợ thêm một dòng vào bảng tóm tắt.
     */
    private void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont, boolean isTotal) {

        // Cột Nhãn (Căn trái)
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(0);
        labelCell.setPadding(5f);
        labelCell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(labelCell);

        // Cột Giá trị (Căn phải)
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(0);
        valueCell.setPadding(5f);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        if (isTotal) {
            // Tạo đường kẻ đôi dưới Tổng cộng
            valueCell.setBorderWidthTop(1.5f);
            valueCell.setBorderWidthBottom(1.5f);
        }
        table.addCell(valueCell);
    }
    private PdfPCell createInfoCell(String title, String name, String taxCode, String address, Font titleFont, Font bodyFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5f);

        cell.addElement(new Paragraph(title, titleFont));
        cell.addElement(new Paragraph("Tên: " + name, bodyFont));
        cell.addElement(new Paragraph("MST: " + taxCode, bodyFont));
        if (address != null && !address.isEmpty()) {
            cell.addElement(new Paragraph("Địa chỉ: " + address, bodyFont));
        }
        return cell;
    }

    private PdfPTable createSignatureBlock(BaseFont baseFont) throws DocumentException {
        Font boldCenterFont = new Font(baseFont, 10, Font.BOLD);
        Font normalCenterFont = new Font(baseFont, 10, Font.NORMAL);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(30f);

        // Tiêu đề
        PdfPCell leftHeader = new PdfPCell(new Phrase("NGƯỜI LẬP", boldCenterFont));
        PdfPCell rightHeader = new PdfPCell(new Phrase("NGƯỜI KIỂM DUYỆT / KẾ TOÁN TRƯỞNG", boldCenterFont));

        leftHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        rightHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
        leftHeader.setBorder(Rectangle.NO_BORDER);
        rightHeader.setBorder(Rectangle.NO_BORDER);

        table.addCell(leftHeader);
        table.addCell(rightHeader);

        // Phần ký tên (khoảng trống)
        PdfPCell spaceCellLeft = new PdfPCell(new Phrase("(Ký và ghi rõ họ tên)", normalCenterFont));
        PdfPCell spaceCellRight = new PdfPCell(new Phrase("(Ký và đóng dấu)", normalCenterFont));

        spaceCellLeft.setPaddingTop(60f); // Tạo khoảng trống để ký
        spaceCellRight.setPaddingTop(60f);
        spaceCellLeft.setHorizontalAlignment(Element.ALIGN_CENTER);
        spaceCellRight.setHorizontalAlignment(Element.ALIGN_CENTER);
        spaceCellLeft.setBorder(Rectangle.NO_BORDER);
        spaceCellRight.setBorder(Rectangle.NO_BORDER);

        table.addCell(spaceCellLeft);
        table.addCell(spaceCellRight);

        return table;
    }
}
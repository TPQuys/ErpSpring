package com.springerp.exceptions;

// Sử dụng RuntimeException để không cần try-catch ở mọi nơi
public class NotFoundException extends RuntimeException {

    // Constructor đơn giản nhận message
    public NotFoundException(String message) {
        super(message);
    }

    // Constructor nhận ID cụ thể
    public NotFoundException(String entityName, Long id) {
        super(entityName + " với ID " + id + " không tồn tại.");
    }
}
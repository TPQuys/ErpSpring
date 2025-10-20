package com.springerp.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VendorDto {

    private Long vendorId;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 255, message = "Tên nhà cung cấp không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;

    @Email(message = "Email không đúng định dạng")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    private String email;

    private String address;

    @Size(max = 50, message = "Mã số thuế không được vượt quá 50 ký tự")
    private String taxCode;

    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    @Size(max = 50, message = "Mã nhà cung cấp không được vượt quá 50 ký tự")
    private String vendorCode;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    private Boolean isActive;

    @Size(max = 100, message = "Tên người liên hệ không được vượt quá 100 ký tự")
    private String contactPersonName;

    @Size(max = 20, message = "SĐT người liên hệ không được vượt quá 20 ký tự")
    private String contactPersonPhone;

    @Email(message = "Email người liên hệ không đúng định dạng")
    @Size(max = 255, message = "Email người liên hệ không được vượt quá 255 ký tự")
    private String contactPersonEmail;

    @Size(max = 100, message = "Điều khoản thanh toán không được vượt quá 100 ký tự")
    private String paymentTerms;

    private String notes;
}
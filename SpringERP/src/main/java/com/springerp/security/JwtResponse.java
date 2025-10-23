// Giả định: File com.springerp.security.JwtResponse.java đã được cập nhật

package com.springerp.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String jwtToken;
    private Long userId;
    private Long roleId;
    private String roleName;
}
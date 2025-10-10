package com.springerp.dtos;

import com.springerp.models.User;
import lombok.Data;

@Data
public class UserDto {
    private Long userId;
    private String username;
    private String email;
    private User.Status status;
    private RoleDto role;
}
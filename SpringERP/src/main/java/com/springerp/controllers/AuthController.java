package com.springerp.controllers;

import com.springerp.security.JwtRequest;
import com.springerp.security.JwtResponse;
import com.springerp.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public JwtResponse login(@RequestBody JwtRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public JwtResponse register(@RequestBody JwtRequest request) {
        return authService.register(request);
    }
}

package com.springerp.services;

import com.springerp.repositories.UserRepository;
import com.springerp.repositories.RoleRepository;
import com.springerp.security.JwtUtil;
import com.springerp.security.JwtRequest;
import com.springerp.security.JwtResponse;
import com.springerp.security.CustomUserDetailsService;
import com.springerp.models.User;
import com.springerp.models.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @FunctionalInterface
    private interface ExceptionSupplier<T> {
        T get() throws Exception;
    }

    private <T> T handleExceptions(ExceptionSupplier<T> supplier) {
        try {
            return supplier.get();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Đăng nhập thất bại: Tên tài khoản hoặc mật khẩu không chính xác" , e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi server", e);
        }
    }

    public JwtResponse login(JwtRequest request) {
        return handleExceptions(() -> {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Không tìm thấy người dùng sau khi xác thực."
                    ));

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());

            return new JwtResponse(
                    jwt,
                    user.getUserId(),
                    user.getRole().getRoleId(),
                    user.getRole().getRoleName()
            );
        });
    }

    public JwtResponse register(JwtRequest request) {
        return handleExceptions(() -> {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Tên đăng nhập '" + request.getUsername() + "' đã được sử dụng."
                );
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            Role role = roleRepository.findByRoleName("USER")
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Role mặc định 'USER' chưa được tạo trong hệ thống. Vui lòng liên hệ quản trị viên."
                    ));
            user.setRole(role);

            User savedUser = userRepository.save(user);

            UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());

            return new JwtResponse(
                    jwt,
                    savedUser.getUserId(),
                    savedUser.getRole().getRoleId(),
                    savedUser.getRole().getRoleName()
            );
        });
    }
}

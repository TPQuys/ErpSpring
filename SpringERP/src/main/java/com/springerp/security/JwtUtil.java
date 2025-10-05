package com.springerp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Secret key phải ≥ 256 bit (32 byte)
    private final String SECRET_KEY = "Xy9Pq2Lm4N8Rf7Gh3Jk1Uz5Vw6Sb0QaC";

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    private final long JWT_EXPIRATION = 1000 * 60 * 60 * 10; // 10 giờ

    // Lấy username từ token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Lấy claim từ token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parseToken(token);
        return claimsResolver.apply(claims);
    }

    // Parse token
    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)           // dùng Key thay vì String
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Tạo token mới
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256) // dùng key
                .compact();
    }

    // Validate token
    public boolean validateToken(String token, String username) {
        final String tokenUsername = extractUsername(token);
        return (tokenUsername.equals(username) && !isTokenExpired(token));
    }

    // Kiểm tra token hết hạn
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}

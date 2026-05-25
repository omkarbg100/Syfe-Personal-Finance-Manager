package com.example.syfe.controller;

import com.example.syfe.dto.AuthResponseDTO;
import com.example.syfe.dto.LoginRequestDTO;
import com.example.syfe.dto.RegisterRequestDTO;
import com.example.syfe.security.JwtTokenResolver;
import com.example.syfe.security.SessionAuthenticationFilter;
import com.example.syfe.service.AuthService;
import com.example.syfe.service.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtTokenResolver jwtTokenResolver;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request, HttpServletRequest servletRequest) {
        AuthResponseDTO response = authService.register(request);
        startSession(servletRequest, response.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, buildTokenCookie(response.getToken(), servletRequest).toString())
                .header("X-Auth-Token", response.getToken())
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request, HttpServletRequest servletRequest) {
        AuthResponseDTO response = authService.login(request);
        startSession(servletRequest, response.getUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildTokenCookie(response.getToken(), servletRequest).toString())
                .header("X-Auth-Token", response.getToken())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String token = jwtTokenResolver.resolve(request);
        if (token != null) {
            tokenBlacklistService.blacklist(token);
        }
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expireTokenCookie(request).toString())
                .build();
    }

    private void startSession(HttpServletRequest request, Long userId) {
        HttpSession existingSession = request.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }
        request.getSession(true).setAttribute(SessionAuthenticationFilter.USER_ID_SESSION_KEY, userId);
    }

    private ResponseCookie buildTokenCookie(String token, HttpServletRequest request) {
        boolean secure = isSecure(request);
        return ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();
    }

    private ResponseCookie expireTokenCookie(HttpServletRequest request) {
        boolean secure = isSecure(request);
        return ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .path("/")
                .maxAge(0)
                .build();
    }

    private boolean isSecure(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedSsl = request.getHeader("X-Forwarded-Ssl");
        return request.isSecure()
                || "https".equalsIgnoreCase(forwardedProto)
                || "on".equalsIgnoreCase(forwardedSsl);
    }
}

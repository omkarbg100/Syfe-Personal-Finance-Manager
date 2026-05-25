package com.example.syfe.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenResolver {

    public String resolve(HttpServletRequest request) {
        String token = resolveFromHeader(request, "Authorization");
        if (token != null) {
            return token;
        }

        token = resolveFromHeader(request, "X-Auth-Token");
        if (token != null) {
            return token;
        }

        token = resolveFromHeader(request, "X-Authorization");
        if (token != null) {
            return token;
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            String name = cookie.getName();
            if ("token".equals(name)
                    || "jwt".equals(name)
                    || "AUTH_TOKEN".equals(name)
                    || "access_token".equals(name)
                    || "accessToken".equals(name)) {
                return clean(cookie.getValue());
            }
        }

        return null;
    }

    private String resolveFromHeader(HttpServletRequest request, String headerName) {
        String value = request.getHeader(headerName);
        if (value == null || value.isBlank()) {
            return null;
        }
        return clean(value);
    }

    private String clean(String value) {
        String token = value.trim();
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return token.substring(7).trim();
        }
        return token;
    }
}

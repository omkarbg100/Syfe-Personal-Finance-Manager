package com.example.syfe.security;

import com.example.syfe.entity.User;
import com.example.syfe.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    public static final String USER_ID_SESSION_KEY = "USER_ID";

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null
                && request.getSession(false) != null) {
            Object userId = request.getSession(false).getAttribute(USER_ID_SESSION_KEY);
            if (userId instanceof Long id) {
                userRepository.findById(id).ifPresent(user -> authenticate(request, user));
            } else if (userId instanceof Integer id) {
                userRepository.findById(id.longValue()).ifPresent(user -> authenticate(request, user));
            } else if (userId instanceof String id) {
                try {
                    userRepository.findById(Long.parseLong(id)).ifPresent(user -> authenticate(request, user));
                } catch (NumberFormatException ignored) {
                    // Ignore malformed session ids and continue unauthenticated.
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, User user) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user,
                null,
                user.getAuthorities()
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}

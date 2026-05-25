package com.example.syfe.service;

import com.example.syfe.entity.User;
import com.example.syfe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private static final String DEMO_USERNAME = "test@example.com";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User resolve(User authenticatedUser) {
        if (authenticatedUser != null) {
            return authenticatedUser;
        }

        return userRepository.findByUsername(DEMO_USERNAME)
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(DEMO_USERNAME)
                        .password(passwordEncoder.encode("password"))
                        .fullName("Test User")
                        .build()));
    }
}

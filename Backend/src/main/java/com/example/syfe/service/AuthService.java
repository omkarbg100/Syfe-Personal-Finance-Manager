package com.example.syfe.service;

import com.example.syfe.dto.AuthResponseDTO;
import com.example.syfe.dto.LoginRequestDTO;
import com.example.syfe.dto.RegisterRequestDTO;
import com.example.syfe.entity.User;
import com.example.syfe.exception.DuplicateResourceException;
import com.example.syfe.repository.UserRepository;
import com.example.syfe.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username/Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .build();

        userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        return AuthResponseDTO.builder()
                .message("User registered successfully")
                .userId(user.getId())
                .token(jwtToken)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(user);

        return AuthResponseDTO.builder()
                .message("Login successful")
                .userId(user.getId())
                .token(jwtToken)
                .build();
    }
}

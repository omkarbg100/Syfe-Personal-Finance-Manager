package com.example.syfe.controller;

import com.example.syfe.dto.UserProfileResponseDTO;
import com.example.syfe.dto.UserProfileUpdateDTO;
import com.example.syfe.entity.User;
import com.example.syfe.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<UserProfileResponseDTO> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userProfileService.getProfile(user));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponseDTO> updateProfile(
            @Valid @RequestBody UserProfileUpdateDTO request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userProfileService.updateProfile(user, request));
    }
}

package com.example.syfe.service;

import com.example.syfe.dto.UserProfileResponseDTO;
import com.example.syfe.dto.UserProfileUpdateDTO;
import com.example.syfe.entity.User;
import com.example.syfe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponseDTO getProfile(User user) {
        return mapToDTO(user);
    }

    @Transactional
    public UserProfileResponseDTO updateProfile(User user, UserProfileUpdateDTO request) {
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        return mapToDTO(userRepository.save(user));
    }

    private UserProfileResponseDTO mapToDTO(User user) {
        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

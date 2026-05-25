package com.example.syfe.controller;

import com.example.syfe.dto.GoalRequestDTO;
import com.example.syfe.dto.GoalResponseDTO;
import com.example.syfe.dto.GoalUpdateDTO;
import com.example.syfe.entity.User;
import com.example.syfe.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalResponseDTO> createGoal(
            @Valid @RequestBody GoalRequestDTO request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(goalService.createGoal(request, user), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GoalResponseDTO>> getGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getGoals(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> getGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getGoal(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponseDTO> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalUpdateDTO request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.updateGoal(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        goalService.deleteGoal(id, user);
        return ResponseEntity.noContent().build();
    }
}

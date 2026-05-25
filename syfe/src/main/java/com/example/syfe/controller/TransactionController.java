package com.example.syfe.controller;

import com.example.syfe.dto.TransactionRequestDTO;
import com.example.syfe.dto.TransactionResponseDTO;
import com.example.syfe.dto.TransactionUpdateDTO;
import com.example.syfe.entity.User;
import com.example.syfe.service.CurrentUserService;
import com.example.syfe.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> createTransaction(
            @Valid @RequestBody TransactionRequestDTO request,
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(transactionService.createTransaction(request, currentUserService.resolve(user)), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponseDTO>> getTransactions(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
            
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date", "createdAt"));
        return ResponseEntity.ok(transactionService.getTransactions(currentUserService.resolve(user), startDate, endDate, categoryId, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateDTO request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request, currentUserService.resolve(user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        transactionService.deleteTransaction(id, currentUserService.resolve(user));
        return ResponseEntity.noContent().build();
    }
}

package com.example.syfe.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionUpdateDTO {

    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String category;

    private String description;

    private LocalDate date; // Accepted for compatibility but intentionally ignored.
}

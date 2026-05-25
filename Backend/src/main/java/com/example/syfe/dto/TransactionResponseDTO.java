package com.example.syfe.dto;

import com.example.syfe.enums.CategoryType;
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
public class TransactionResponseDTO {
    private Long id;
    private BigDecimal amount;
    private LocalDate date;
    private String category;
    private String description;
    private CategoryType type;
}

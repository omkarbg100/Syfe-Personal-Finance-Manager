package com.example.syfe.service;

import com.example.syfe.dto.MonthlyReportDTO;
import com.example.syfe.dto.YearlyReportDTO;
import com.example.syfe.entity.Transaction;
import com.example.syfe.entity.User;
import com.example.syfe.enums.CategoryType;
import com.example.syfe.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public MonthlyReportDTO getMonthlyReport(User user, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, startDate, endDate);

        BigDecimal totalIncome = calculateTotal(transactions, CategoryType.INCOME);
        BigDecimal totalExpenses = calculateTotal(transactions, CategoryType.EXPENSE);
        
        Map<String, BigDecimal> incomeByCategory = calculateByCategory(transactions, CategoryType.INCOME);
        Map<String, BigDecimal> expenseByCategory = calculateByCategory(transactions, CategoryType.EXPENSE);

        return MonthlyReportDTO.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(totalIncome.subtract(totalExpenses))
                .incomeByCategory(incomeByCategory)
                .expenseByCategory(expenseByCategory)
                .build();
    }

    @Transactional(readOnly = true)
    public YearlyReportDTO getYearlyReport(User user, int year) {
        List<Transaction> transactions = transactionRepository.findByUserAndYear(user, year);

        BigDecimal totalIncome = calculateTotal(transactions, CategoryType.INCOME);
        BigDecimal totalExpenses = calculateTotal(transactions, CategoryType.EXPENSE);

        return YearlyReportDTO.builder()
                .year(year)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(totalIncome.subtract(totalExpenses))
                .build();
    }

    private BigDecimal calculateTotal(List<Transaction> transactions, CategoryType type) {
        return transactions.stream()
                .filter(t -> t.getCategory().getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, BigDecimal> calculateByCategory(List<Transaction> transactions, CategoryType type) {
        return transactions.stream()
                .filter(t -> t.getCategory().getType() == type)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
    }
}

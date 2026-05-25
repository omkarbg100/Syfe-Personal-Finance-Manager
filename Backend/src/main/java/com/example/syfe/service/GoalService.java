package com.example.syfe.service;

import com.example.syfe.dto.GoalRequestDTO;
import com.example.syfe.dto.GoalResponseDTO;
import com.example.syfe.dto.GoalUpdateDTO;
import com.example.syfe.entity.SavingsGoal;
import com.example.syfe.entity.Transaction;
import com.example.syfe.entity.User;
import com.example.syfe.enums.CategoryType;
import com.example.syfe.exception.BadRequestException;
import com.example.syfe.exception.ResourceNotFoundException;
import com.example.syfe.repository.SavingsGoalRepository;
import com.example.syfe.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final SavingsGoalRepository goalRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public GoalResponseDTO createGoal(GoalRequestDTO request, User user) {
        validateGoalDates(request.getStartDate(), request.getTargetDate());

        SavingsGoal goal = SavingsGoal.builder()
                .goalName(request.getGoalName())
                .targetAmount(request.getTargetAmount())
                .targetDate(request.getTargetDate())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .user(user)
                .build();

        return mapToDTO(goalRepository.save(goal), user);
    }

    @Transactional(readOnly = true)
    public List<GoalResponseDTO> getGoals(User user) {
        return goalRepository.findByUser(user).stream()
                .map(goal -> mapToDTO(goal, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoalResponseDTO getGoal(Long id, User user) {
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        return mapToDTO(goal, user);
    }

    @Transactional
    public GoalResponseDTO updateGoal(Long id, GoalUpdateDTO request, User user) {
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (request.getTargetAmount() != null) {
            goal.setTargetAmount(request.getTargetAmount());
        }
        if (request.getTargetDate() != null) {
            validateGoalDates(goal.getStartDate(), request.getTargetDate());
            goal.setTargetDate(request.getTargetDate());
        }

        return mapToDTO(goalRepository.save(goal), user);
    }

    @Transactional
    public void deleteGoal(Long id, User user) {
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private GoalResponseDTO mapToDTO(SavingsGoal goal, User user) {
        List<Transaction> transactions = transactionRepository.findByUserAndDateGreaterThanEqual(user, goal.getStartDate());

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getCategory().getType() == CategoryType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentProgress = totalIncome.subtract(totalExpense);
        
        // Progress cannot be negative
        if (currentProgress.compareTo(BigDecimal.ZERO) < 0) {
            currentProgress = BigDecimal.ZERO;
        }

        BigDecimal remainingAmount = goal.getTargetAmount().subtract(currentProgress);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        double progressPercentage = 0.0;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPercentage = currentProgress
                    .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .doubleValue();
        }
        
        // Cap at 100%
        if (progressPercentage > 100.0) {
            progressPercentage = 100.0;
        }

        return GoalResponseDTO.builder()
                .id(goal.getId())
                .goalName(goal.getGoalName())
                .targetAmount(goal.getTargetAmount())
                .targetDate(goal.getTargetDate())
                .startDate(goal.getStartDate())
                .currentProgress(currentProgress)
                .progressPercentage(progressPercentage)
                .remainingAmount(remainingAmount)
                .build();
    }

    private void validateGoalDates(LocalDate startDate, LocalDate targetDate) {
        if (startDate != null && targetDate != null && startDate.isAfter(targetDate)) {
            throw new BadRequestException("Start date cannot be after target date");
        }
    }
}

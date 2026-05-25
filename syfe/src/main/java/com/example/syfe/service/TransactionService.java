package com.example.syfe.service;

import com.example.syfe.dto.TransactionRequestDTO;
import com.example.syfe.dto.TransactionResponseDTO;
import com.example.syfe.dto.TransactionUpdateDTO;
import com.example.syfe.entity.Category;
import com.example.syfe.entity.Transaction;
import com.example.syfe.entity.User;
import com.example.syfe.exception.ForbiddenAccessException;
import com.example.syfe.exception.ResourceNotFoundException;
import com.example.syfe.repository.CategoryRepository;
import com.example.syfe.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public TransactionResponseDTO createTransaction(TransactionRequestDTO request, User user) {
        Category category = findCategory(request.getCategory(), user);

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .category(category)
                .user(user)
                .build();

        return mapToDTO(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponseDTO> getTransactions(User user, LocalDate startDate, LocalDate endDate, Long categoryId, Pageable pageable) {
        return transactionRepository.findTransactionsWithFilters(user, startDate, endDate, categoryId, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public TransactionResponseDTO updateTransaction(Long id, TransactionUpdateDTO request, User user) {
        Transaction transaction = getTransactionAndVerifyOwnership(id, user);

        Category category = findCategory(request.getCategory(), user);
        
        transaction.setAmount(request.getAmount());
        transaction.setCategory(category);
        transaction.setDescription(request.getDescription());
        // Date cannot be updated as per business rules

        return mapToDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long id, User user) {
        Transaction transaction = getTransactionAndVerifyOwnership(id, user);
        transactionRepository.delete(transaction);
    }

    private Transaction getTransactionAndVerifyOwnership(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ForbiddenAccessException("You do not have permission to access this transaction");
        }
        return transaction;
    }

    private Category findCategory(String name, User user) {
        return categoryRepository.findByNameAndUser(name, user)
                .orElseGet(() -> categoryRepository.findByNameAndUserIsNull(name)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + name)));
    }

    private TransactionResponseDTO mapToDTO(Transaction transaction) {
        return TransactionResponseDTO.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .category(transaction.getCategory().getName())
                .description(transaction.getDescription())
                .type(transaction.getCategory().getType())
                .build();
    }
}

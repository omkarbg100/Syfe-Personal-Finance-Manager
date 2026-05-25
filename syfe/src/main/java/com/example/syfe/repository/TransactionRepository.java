package com.example.syfe.repository;

import com.example.syfe.entity.Transaction;
import com.example.syfe.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Page<Transaction> findByUser(User user, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND (:startDate IS NULL OR t.date >= :startDate) AND (:endDate IS NULL OR t.date <= :endDate) AND (:categoryId IS NULL OR t.category.id = :categoryId)")
    Page<Transaction> findTransactionsWithFilters(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("categoryId") Long categoryId, Pageable pageable);

    boolean existsByCategory_Id(Long categoryId);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date >= :startDate AND t.date <= :endDate")
    List<Transaction> findByUserAndDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND YEAR(t.date) = :year")
    List<Transaction> findByUserAndYear(@Param("user") User user, @Param("year") int year);
    
    List<Transaction> findByUserAndDateGreaterThanEqual(User user, LocalDate startDate);
}

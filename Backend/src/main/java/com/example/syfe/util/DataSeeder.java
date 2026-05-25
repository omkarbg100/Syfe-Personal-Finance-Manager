package com.example.syfe.util;

import com.example.syfe.entity.Category;
import com.example.syfe.entity.SavingsGoal;
import com.example.syfe.entity.Transaction;
import com.example.syfe.entity.User;
import com.example.syfe.enums.CategoryType;
import com.example.syfe.repository.CategoryRepository;
import com.example.syfe.repository.SavingsGoalRepository;
import com.example.syfe.repository.TransactionRepository;
import com.example.syfe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedDefaultCategories();
        seedDummyUserAndData();
    }

    private void seedDefaultCategories() {
        if (categoryRepository.findByNameAndUserIsNull("Salary").isEmpty()) {
            List<Category> defaultCategories = Arrays.asList(
                    Category.builder().name("Salary").type(CategoryType.INCOME).custom(false).build(),
                    Category.builder().name("Food").type(CategoryType.EXPENSE).custom(false).build(),
                    Category.builder().name("Rent").type(CategoryType.EXPENSE).custom(false).build(),
                    Category.builder().name("Transportation").type(CategoryType.EXPENSE).custom(false).build(),
                    Category.builder().name("Entertainment").type(CategoryType.EXPENSE).custom(false).build(),
                    Category.builder().name("Healthcare").type(CategoryType.EXPENSE).custom(false).build(),
                    Category.builder().name("Utilities").type(CategoryType.EXPENSE).custom(false).build()
            );
            categoryRepository.saveAll(defaultCategories);
        }
    }

    private void seedDummyUserAndData() {
        if (!userRepository.existsByUsername("test@example.com")) {
            User user = User.builder()
                    .username("test@example.com")
                    .password(passwordEncoder.encode("password"))
                    .fullName("Test User")
                    .build();
            userRepository.save(user);

            Category salaryCategory = categoryRepository.findByNameAndUserIsNull("Salary").orElseThrow();
            Category foodCategory = categoryRepository.findByNameAndUserIsNull("Food").orElseThrow();
            Category rentCategory = categoryRepository.findByNameAndUserIsNull("Rent").orElseThrow();

            Transaction t1 = Transaction.builder()
                    .amount(new BigDecimal("5000.00"))
                    .date(LocalDate.now().withDayOfMonth(1))
                    .description("Monthly Salary")
                    .category(salaryCategory)
                    .user(user)
                    .build();

            Transaction t2 = Transaction.builder()
                    .amount(new BigDecimal("1500.00"))
                    .date(LocalDate.now().withDayOfMonth(5))
                    .description("Apartment Rent")
                    .category(rentCategory)
                    .user(user)
                    .build();

            Transaction t3 = Transaction.builder()
                    .amount(new BigDecimal("250.00"))
                    .date(LocalDate.now().withDayOfMonth(10))
                    .description("Groceries")
                    .category(foodCategory)
                    .user(user)
                    .build();

            transactionRepository.saveAll(Arrays.asList(t1, t2, t3));

            SavingsGoal goal = SavingsGoal.builder()
                    .goalName("Vacation Fund")
                    .targetAmount(new BigDecimal("3000.00"))
                    .targetDate(LocalDate.now().plusMonths(6))
                    .startDate(LocalDate.now().withDayOfMonth(1))
                    .user(user)
                    .build();
            savingsGoalRepository.save(goal);
        }
    }
}

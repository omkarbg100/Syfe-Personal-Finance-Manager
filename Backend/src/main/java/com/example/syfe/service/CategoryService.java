package com.example.syfe.service;

import com.example.syfe.dto.CategoryRequestDTO;
import com.example.syfe.dto.CategoryResponseDTO;
import com.example.syfe.entity.Category;
import com.example.syfe.entity.User;
import com.example.syfe.exception.BadRequestException;
import com.example.syfe.exception.DuplicateResourceException;
import com.example.syfe.exception.ResourceNotFoundException;
import com.example.syfe.repository.CategoryRepository;
import com.example.syfe.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getCategories(User user) {
        return categoryRepository.findByUserOrUserIsNull(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request, User user) {
        if (categoryRepository.existsByNameAndUser(request.getName(), user) || 
            categoryRepository.findByNameAndUserIsNull(request.getName()).isPresent()) {
            throw new DuplicateResourceException("Category with this name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .custom(true)
                .user(user)
                .build();

        return mapToDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(String name, User user) {
        Category category = categoryRepository.findByNameAndUser(name, user)
                .orElseThrow(() -> new ResourceNotFoundException("Custom category not found or access denied"));

        if (!category.isCustom() || category.getUser() == null) {
            throw new BadRequestException("Default categories cannot be deleted");
        }

        if (transactionRepository.existsByCategory_Id(category.getId())) {
            throw new BadRequestException("Categories used in transactions cannot be deleted");
        }

        categoryRepository.delete(category);
    }

    public CategoryResponseDTO mapToDTO(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .custom(category.isCustom())
                .build();
    }
}

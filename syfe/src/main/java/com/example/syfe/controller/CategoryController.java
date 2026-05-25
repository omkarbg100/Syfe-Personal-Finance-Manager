package com.example.syfe.controller;

import com.example.syfe.dto.CategoryRequestDTO;
import com.example.syfe.dto.CategoryResponseDTO;
import com.example.syfe.entity.User;
import com.example.syfe.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getCategories(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.getCategories(user));
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @Valid @RequestBody CategoryRequestDTO request, 
            @AuthenticationPrincipal User user) {
        return new ResponseEntity<>(categoryService.createCategory(request, user), HttpStatus.CREATED);
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable String name, 
            @AuthenticationPrincipal User user) {
        categoryService.deleteCategory(name, user);
        return ResponseEntity.noContent().build();
    }
}

package com.example.syfe.controller;

import com.example.syfe.dto.MonthlyReportDTO;
import com.example.syfe.dto.YearlyReportDTO;
import com.example.syfe.entity.User;
import com.example.syfe.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly/{year}/{month}")
    public ResponseEntity<MonthlyReportDTO> getMonthlyReport(
            @PathVariable int year,
            @PathVariable int month,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getMonthlyReport(user, year, month));
    }

    @GetMapping("/yearly/{year}")
    public ResponseEntity<YearlyReportDTO> getYearlyReport(
            @PathVariable int year,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getYearlyReport(user, year));
    }
}

import { z } from "zod"

// Production Metrics Validation
export const productionMetricsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  product_category: z.string().min(1, "Product category is required"),
  stage: z.string().min(1, "Stage is required"),
  craftsperson_id: z.string().uuid("Invalid craftsperson ID").optional().nullable(),
  cycle_time: z.number().positive("Cycle time must be positive"),
  quality_score: z.number().min(0).max(100, "Quality score must be between 0 and 100"),
  efficiency_score: z.number().min(0).max(100, "Efficiency score must be between 0 and 100"),
  units_produced: z.number().int().min(0, "Units produced must be non-negative"),
  defects: z.number().int().min(0, "Defects must be non-negative").default(0),
  rework_count: z.number().int().min(0, "Rework count must be non-negative").default(0),
})

// Efficiency Metrics Validation
export const efficiencyMetricsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  process_type: z.string().min(1, "Process type is required"),
  location_id: z.string().uuid("Invalid location ID").optional().nullable(),
  throughput_rate: z.number().min(0, "Throughput rate must be non-negative"),
  resource_utilization: z.number().min(0).max(100, "Resource utilization must be between 0 and 100"),
  setup_time: z.number().min(0, "Setup time must be non-negative"),
  processing_time: z.number().min(0, "Processing time must be non-negative"),
  idle_time: z.number().min(0, "Idle time must be non-negative").default(0),
  bottleneck_identified: z.boolean().default(false),
  bottleneck_details: z.string().optional(),
})

// General Metrics Validation
export const generalMetricsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  metric_type: z.string().min(1, "Metric type is required"),
  metric_name: z.string().min(1, "Metric name is required"),
  metric_value: z.number(),
  metric_unit: z.string().optional(),
  comparison_value: z.number().optional(),
  trend_direction: z.enum(["up", "down", "stable"]).optional(),
})

// Analytics Alerts Validation
export const analyticsAlertsSchema = z.object({
  alert_type: z.string().min(1, "Alert type is required"),
  metric_name: z.string().min(1, "Metric name is required"),
  threshold_value: z.number(),
  comparison_operator: z.enum(["<", "<=", ">", ">=", "==", "!="], {
    errorMap: () => ({ message: "Invalid comparison operator" }),
  }),
  is_active: z.boolean().default(true),
  notification_channels: z.array(z.string()).default([]),
})

// Analytics Reports Validation
export const analyticsReportsSchema = z.object({
  report_type: z.string().min(1, "Report type is required"),
  report_name: z.string().min(1, "Report name is required"),
  date_range_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  date_range_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  filters: z.record(z.any()).optional(),
  generated_by: z.string().uuid("Invalid user ID").optional().nullable(),
})

// Analytics Report Items Validation
export const analyticsReportItemsSchema = z.object({
  metric_name: z.string().min(1, "Metric name is required"),
  metric_value: z.number(),
  metric_unit: z.string().optional(),
  comparison_value: z.number().optional(),
  trend_direction: z.enum(["up", "down", "stable"]).optional(),
})

// Query Parameters Validation
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
})

// Helper function to validate date range
export function validateDateRange(startDate: string | null, endDate: string | null) {
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start > end) {
      throw new Error("Start date must be before end date")
    }
  }
} 
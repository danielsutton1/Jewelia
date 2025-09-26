
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse the request body
  const body = event.body ? JSON.parse(event.body) : {};
  
  // Convert Next.js API route to Netlify function
  try {
    // Extract the handler from the route file
    import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";

// Map dataset names to Supabase tables and validation rules
const DATASET_CONFIG: Record<string, { table: string, required: string[], numeric?: string[], date?: string[], columnMapping?: Record<string, string> }> = {
  "accounts_payable": { table: "accounts_payable", required: ["Bill ID", "Vendor", "Date Issued", "Due Date", "Amount"], numeric: ["Amount", "Balance"], date: ["Date Issued", "Due Date"] },
  "accounts_receivable": { table: "accounts_receivable", required: ["Invoice ID", "Customer", "Date Issued", "Due Date", "Amount"], numeric: ["Amount", "Balance"], date: ["Date Issued", "Due Date"] },
  "cad_files": { table: "cad_files", required: ["Project ID", "Product Name", "CAD File Name", "File Link/Path", "Designer", "Date Uploaded"] },
  "consigned_items": { table: "consigned_items", required: ["Item ID", "Consignor ID", "SKU", "Name", "Category", "Value", "Status", "Date Consigned"] },
  "consignor_management": { table: "consignor_management", required: ["Consignor ID", "Name", "Contact", "Agreement Date", "Terms", "Status"] },
  "crm_data": { table: "customers", required: ["Full Name", "Email Address"] },
  "current_orders": { table: "current_orders", required: ["Order ID", "Customer", "Date", "Items", "Status"] },
  "diamonds": { table: "diamonds", required: ["ID", "Shape", "Carat", "Color", "Quality", "Cut", "Certificate", "Status"] },
  "ecommerce_integration_field_mapping": { table: "ecommerce_integration_field_mapping", required: ["Platform", "External Field", "Jewelia Field"] },
  "employee_schedules": { table: "employee_schedules", required: ["Employee ID", "Name", "Date", "Shift Start", "Shift End", "Role"] },
  "employee_tasks": { table: "employee_tasks", required: ["Task ID", "Employee ID", "Employee Name", "Task Description", "Start Date", "Due Date", "Status"] },
  "employees": { table: "employees", required: ["Employee ID", "Name", "Role", "Department", "Email", "Phone"] },
  "equipment_maintenance": { table: "equipment_maintenance", required: ["Equipment ID", "Name", "Type", "Location", "Last Maintenance", "Next Maintenance", "Status"] },
  "finished_inventory": { table: "finished_inventory", required: ["SKU", "Name", "Category", "Metal", "Weight", "Stones", "Quantity", "Cost", "Price", "Status"] },
  "inventory_data": { 
    table: "inventory_data", 
    required: ["SKU", "Description", "Category", "Price", "Stock", "Location"],
    numeric: ["Price", "Stock", "Carat"],
    columnMapping: {
      "Name": "Description",
      "Quantity": "Stock"
    }
  },
  "inventory_status": {
    table: "inventory_statuses",
    required: ["SKU", "Name", "Category", "Quantity", "Location", "Status", "Price"],
    numeric: ["Quantity", "Price"],
    // Optional fields: ["Last Counted", "Notes"]
  },
  "inventory_tags_barcodes": { table: "inventory_tags_barcodes", required: ["SKU", "Tag ID", "Barcode", "Location", "Status"] },
  "item_templates": { table: "item_templates", required: ["Code", "Name", "Category", "Materials", "Labor Codes", "Total Cost", "Base Price"] },
  "labor_codes": { table: "labor_codes", required: ["Code", "Name", "Description", "Time", "Estimate", "Cost", "Price"] },
  "loose_stones": { table: "loose_stones", required: ["SKU", "Name", "Type", "Shape", "Carat", "Color", "Clarity", "Cut", "Quantity", "Cost", "Price", "Status"] },
  "past_sales": { table: "past_sales", required: ["Sale ID", "Date", "Customer", "Product/SKU", "Quantity", "Price", "Total", "Salesperson", "Payment Method", "Status"] },
  "production_status": { table: "production_status", required: ["Product ID", "Name", "Current Stage", "Status", "Last Updated", "Responsible Employee"] },
  "products_in_production_pipeline": { table: "products_in_production_pipeline", required: ["Product ID", "Name", "Description", "Category", "Stage", "Assigned Employee", "Start Date", "Estimated Completion", "Status"] },
  "products": { table: "products", required: ["Product", "Category", "Price", "Stock", "Status", "SKU"] },
  "quality_control": { table: "quality_control", required: ["QC ID", "Product/SKU", "Date", "Inspector", "Result", "Status"] },
  "raw_materials": { table: "raw_materials", required: ["SKU", "Name", "Type", "Alloy", "Weight", "Thickness", "Quantity", "Cost", "Price", "Status"] },
  "repairs": { table: "repairs", required: ["Repair ID", "Customer", "Item", "Issue", "Status", "Technician", "Received", "Due", "Cost"] },
};

function isValidDate(val: any) {
  return !isNaN(Date.parse(val));
}

async function POST(request: Request, context: { params: { dataset: string } }) {
  const { dataset } = await context.params;
  // Debug logs
  console.log("context:", context);
  console.log("params:", context.params);
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Get cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-demo-auth-token')?.value || cookieStore.get('sb-demo-auth-token.0')?.value;

    // Initialize Supabase client manually
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials:", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      });
      return NextResponse.json({ 
        error: "Server configuration error: Missing Supabase credentials" 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
    });

    const config = DATASET_CONFIG[dataset];
    if (!config) {
      return NextResponse.json({ error: "Unknown dataset" }, { status: 400 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    let data: any[] = [];

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === "csv") {
      const csv = buffer.toString("utf-8");
      const [header, ...rows] = csv.split("\n").map(line => line.trim()).filter(Boolean);
      let columns = header.split(",").map(col => col.trim());
      console.log('[IMPORT] Parsed CSV headers:', columns);
      data = rows.map(row => {
        const values = row.split(",").map(val => val.trim());
        return Object.fromEntries(columns.map((col, i) => [col, values[i]]));
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Remove any fields with an empty string as the key
    data = data.map(row => {
      if (row[""] !== undefined) {
        const { "": _omit, ...rest } = row;
        return rest;
      }
      return row;
    });

    // Sanitize numeric fields: convert "" to null and ensure numbers
    if (config.numeric) {
      data = data.map(row => {
        const newRow = { ...row };
        for (const field of config.numeric!) {
          if (newRow[field] === "" || newRow[field] === undefined) {
            newRow[field] = null;
          } else {
            newRow[field] = Number(newRow[field]);
            if (isNaN(newRow[field])) newRow[field] = null;
          }
        }
        return newRow;
      });
    }

    // Apply column mapping if configured
    if (config.columnMapping) {
      // List of allowed columns in inventory_data table
      const allowed = [
        "SKU", "Description", "Category", "Price", "Stock", "Location",
        "Image", "Supplier", "GIA Number", "Carat", "Color", "Clarity", "Cut", "inventory_id"
      ];
      data = data.map(row => {
        const newRow: Record<string, any> = { ...row };
        // Apply mappings and remove originals
        for (const [csvCol, dbCol] of Object.entries(config.columnMapping!)) {
          if (row[csvCol] !== undefined) {
            newRow[dbCol] = row[csvCol];
            delete newRow[csvCol];
          }
        }
        // Remove any fields not in allowed columns
        Object.keys(newRow).forEach(key => {
          if (!allowed.includes(key)) delete newRow[key];
        });
        return newRow;
      });
    }

    // Add debug logging after parsing CSV and before validation
    console.log('[IMPORT] Using dataset config:', config);
    console.log('[IMPORT] Required fields:', config.required);

    // Validate rows
    const errors: { row: number, error: string }[] = [];
    const validRows: any[] = [];
    data.forEach((row, idx) => {
      // Check required fields
      for (const field of config.required) {
        if (!row[field] || row[field].toString().trim() === "") {
          errors.push({ row: idx + 2, error: `Missing required field: ${field}` });
          return;
        }
      }
      // Check numeric fields
      if (config.numeric) {
        for (const field of config.numeric) {
          if (row[field] && isNaN(Number(row[field]))) {
            errors.push({ row: idx + 2, error: `Field '${field}' must be a number` });
            return;
          }
        }
      }
      // Check date fields
      if (config.date) {
        for (const field of config.date) {
          if (row[field] && !isValidDate(row[field])) {
            errors.push({ row: idx + 2, error: `Field '${field}' must be a valid date` });
            return;
          }
        }
      }
      validRows.push(row);
    });

    if (validRows.length === 0) {
      return NextResponse.json({ error: "No valid rows to import", details: errors }, { status: 400 });
    }

    // Log row data and types before insert
    console.log('[IMPORT] Row data and types before insert:');
    data.forEach((row, idx) => {
      const types = Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v]));
      console.log(`Row ${idx + 1}:`, row, types);
    });

    // Insert valid rows
    console.log("Attempting to insert rows:", JSON.stringify(validRows, null, 2));
    const { data: inserted, error: insertError } = await supabase
      .from(config.table)
      .insert(validRows)
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ 
        error: "Failed to insert data", 
        details: insertError.message,
        supabaseError: insertError,
        attemptedRows: validRows
      }, { status: 500 });
    }

    const insertedCount = Array.isArray(inserted) ? inserted.length : 0;
    return NextResponse.json({ 
      success: true, 
      inserted: insertedCount, 
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ 
      error: "Failed to import file", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 

    // Handle the request based on the HTTP method
    const method = event.httpMethod;
    let response;
    
    switch (method) {
      case 'GET':
        response = await GET({ req: event, supabase });
        break;
      case 'POST':
        response = await POST({ req: event, supabase });
        break;
      case 'PUT':
        response = await PUT({ req: event, supabase });
        break;
      case 'DELETE':
        response = await DELETE({ req: event, supabase });
        break;
      case 'PATCH':
        response = await PATCH({ req: event, supabase });
        break;
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

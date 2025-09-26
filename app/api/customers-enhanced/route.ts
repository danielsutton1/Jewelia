import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withApiMonitoring, withSupabaseMonitoring, ApiContext } from '../../../lib/middleware/api-monitoring-simple';
import { ApiErrorHandler, createSuccessResponse } from '../../../lib/utils/api-error-handler';
import { logger } from '../../../lib/utils/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enhanced customers API with monitoring, logging, and error handling
async function customersHandler(request: NextRequest, context: ApiContext): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  try {
    logger.info('Fetching customers', {
      page,
      limit,
      search,
      status,
      userId: context.userId
    });

    // Build query with monitoring
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query with monitoring
    const result = await withSupabaseMonitoring(
      query,
      'customers',
      'SELECT',
      context.userId
    );
    
    const { data: customers, error, count } = result;

    if (error) {
      logger.error('Failed to fetch customers', error, {
        page,
        limit,
        search,
        status,
        userId: context.userId
      });

      return ApiErrorHandler.handleDatabaseError(
        error,
        'fetch_customers',
        request.nextUrl.pathname,
        request.method,
        context.userId
      );
    }

    // Log successful operation
    logger.info('Customers fetched successfully', {
      count: Array.isArray(customers) ? customers.length : 0,
      totalCount: count,
      page,
      limit,
      userId: context.userId
    });

    // Return success response
    return createSuccessResponse({
      customers: customers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, 'Customers fetched successfully');

  } catch (error) {
    logger.error('Unexpected error in customers API', error as Error, {
      page,
      limit,
      search,
      status,
      userId: context.userId
    });

    return ApiErrorHandler.handleGenericError(
      error,
      request.nextUrl.pathname,
      request.method,
      context.userId
    );
  }
}

// POST handler for creating customers
async function createCustomerHandler(request: NextRequest, context: ApiContext): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    logger.info('Creating new customer', {
      customerData: { email: body.email, full_name: body.full_name },
      userId: context.userId
    });

    // Validate required fields
    if (!body.email || !body.full_name) {
      const validationErrors = [];
      if (!body.email) validationErrors.push('Email is required');
      if (!body.full_name) validationErrors.push('Full name is required');

      return ApiErrorHandler.handleValidationError(
        validationErrors,
        request.nextUrl.pathname,
        request.method,
        context.userId
      );
    }

    // Check if customer already exists
    const { data: existingCustomer, error: checkError } = await withSupabaseMonitoring(
      supabase.from('customers').select('id').eq('email', body.email).single(),
      'customers',
      'SELECT',
      context.userId
    );

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error('Error checking existing customer', checkError, {
        email: body.email,
        userId: context.userId
      });

      return ApiErrorHandler.handleDatabaseError(
        checkError,
        'check_existing_customer',
        request.nextUrl.pathname,
        request.method,
        context.userId
      );
    }

    if (existingCustomer) {
      logger.warn('Customer already exists', {
        email: body.email,
        userId: context.userId
      });

      return ApiErrorHandler.handleDatabaseError(
        { code: '23505', message: 'Customer with this email already exists' },
        'create_customer',
        request.nextUrl.pathname,
        request.method,
        context.userId
      );
    }

    // Create new customer
    const { data: newCustomer, error: createError } = await withSupabaseMonitoring(
      supabase.from('customers').insert([body]).select().single(),
      'customers',
      'INSERT',
      context.userId
    );

    if (createError) {
      logger.error('Failed to create customer', createError, {
        customerData: { email: body.email, full_name: body.full_name },
        userId: context.userId
      });

      return ApiErrorHandler.handleDatabaseError(
        createError,
        'create_customer',
        request.nextUrl.pathname,
        request.method,
        context.userId
      );
    }

    // Log successful creation
    logger.info('Customer created successfully', {
      customerId: (newCustomer as any)?.id,
      email: (newCustomer as any)?.email,
      userId: context.userId
    });

    // Log business event
    logger.info('Business Event: Customer Created', {
      event: 'customer_created',
      customerId: (newCustomer as any)?.id,
      email: (newCustomer as any)?.email,
      userId: context.userId
    });

    return createSuccessResponse(newCustomer, 'Customer created successfully');

  } catch (error) {
    logger.error('Unexpected error creating customer', error as Error, {
      userId: context.userId
    });

    return ApiErrorHandler.handleGenericError(
      error,
      request.nextUrl.pathname,
      request.method,
      context.userId
    );
  }
}

// Export the enhanced handlers with monitoring
export const GET = withApiMonitoring(customersHandler);
export const POST = withApiMonitoring(createCustomerHandler); 
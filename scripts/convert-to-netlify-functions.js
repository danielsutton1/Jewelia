const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../app/api');
const functionsDir = path.join(__dirname, '../netlify/functions');

function convertApiRouteToFunction(apiPath, relativePath) {
  const routeContent = fs.readFileSync(apiPath, 'utf8');
  const functionPath = path.join(functionsDir, relativePath.replace(/\[([^\]]+)\]/g, ':$1'));
  
  // Create the function directory if it doesn't exist
  const functionDir = path.dirname(functionPath);
  if (!fs.existsSync(functionDir)) {
    fs.mkdirSync(functionDir, { recursive: true });
  }

  // Convert the route handler to a Netlify function
  const functionContent = `
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
    ${routeContent
      .replace(/export async function GET/g, 'async function GET')
      .replace(/export async function POST/g, 'async function POST')
      .replace(/export async function PUT/g, 'async function PUT')
      .replace(/export async function DELETE/g, 'async function DELETE')
      .replace(/export async function PATCH/g, 'async function PATCH')
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
`;

  fs.writeFileSync(functionPath + '.js', functionContent);
}

function processApiRoutes(dir, relativePath = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processApiRoutes(filePath, path.join(relativePath, file));
    } else if (file === 'route.ts' || file === 'route.js') {
      convertApiRouteToFunction(filePath, relativePath);
    }
  });
}

// Start the conversion process
processApiRoutes(apiDir); 
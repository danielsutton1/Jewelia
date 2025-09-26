"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/components/ui/utils";

interface CodeExamplesProps {
  selectedEndpoint: string
}

const codeExamples = {
  "list-inventory": {
    curl: `curl -X GET "https://api.jeweliacrm.com/v1/inventory" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    javascript: `import axios from 'axios';

const response = await axios.get('https://api.jeweliacrm.com/v1/inventory', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  params: {
    page: 1,
    limit: 10,
    category: 'cat_rings'
  }
});

console.log(response.data);`,
    python: `import requests

response = requests.get(
    'https://api.jeweliacrm.com/v1/inventory',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    params={
        'page': 1,
        'limit': 10,
        'category': 'cat_rings'
    }
)

print(response.json())`,
    ruby: `require 'net/http'
require 'uri'
require 'json'

uri = URI('https://api.jeweliacrm.com/v1/inventory')
uri.query = URI.encode_www_form({
  page: 1,
  limit: 10,
  category: 'cat_rings'
})

request = Net::HTTP::Get.new(uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end

puts JSON.parse(response.body)`,
    php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.jeweliacrm.com/v1/inventory?page=1&limit=10&category=cat_rings",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response, true);
print_r($data);`,
  },
  "get-inventory": {
    curl: `curl -X GET "https://api.jeweliacrm.com/v1/inventory/inv_12345" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    javascript: `import axios from 'axios';

const inventoryId = 'inv_12345';
const response = await axios.get(\`https://api.jeweliacrm.com/v1/inventory/\${inventoryId}\`, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`,
    python: `import requests

inventory_id = 'inv_12345'
response = requests.get(
    f'https://api.jeweliacrm.com/v1/inventory/{inventory_id}',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)

print(response.json())`,
    ruby: `require 'net/http'
require 'uri'
require 'json'

inventory_id = 'inv_12345'
uri = URI("https://api.jeweliacrm.com/v1/inventory/#{inventory_id}")

request = Net::HTTP::Get.new(uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end

puts JSON.parse(response.body)`,
    php: `<?php

$inventoryId = 'inv_12345';
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.jeweliacrm.com/v1/inventory/{$inventoryId}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response, true);
print_r($data);`,
  },
  // Other endpoints would have similar code examples
}

export function CodeExamples({ selectedEndpoint }: CodeExamplesProps) {
  const examples = codeExamples[selectedEndpoint as keyof typeof codeExamples] || codeExamples["list-inventory"]
  const [copiedLanguage, setCopiedLanguage] = useState<string | null>(null)

  const handleCopy = async (language: string, code: string) => {
    await copyToClipboard(code);
    setCopiedLanguage(language);
    setTimeout(() => setCopiedLanguage(null), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Examples</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="javascript">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="ruby">Ruby</TabsTrigger>
            <TabsTrigger value="php">PHP</TabsTrigger>
          </TabsList>

          {Object.entries(examples).map(([language, code]) => (
            <TabsContent key={language} value={language} className="relative">
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(language, code)} className="h-8 w-8 p-0">
                  {copiedLanguage === language ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code className="text-sm">{code}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

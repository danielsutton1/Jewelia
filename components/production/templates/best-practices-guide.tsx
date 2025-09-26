"use client"

import { useState } from "react"

export function BestPracticesGuide() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Mock data for best practices
  const bestPractices = [
    {
      id: "bp1",
      category: "general",
      title: "Creating Effective Templates",
      content: `
        <p>Effective production templates are clear, comprehensive, and adaptable. Follow these guidelines:</p>
        <ul>
          <li><strong>Be specific:</strong> Provide detailed descriptions for each step</li>
          <li><strong>Use consistent terminology:</strong> Maintain consistent language across all templates</li>
          <li><strong>Include visuals:</strong> Add images or diagrams where helpful</li>
          <li><strong>Consider skill levels:</strong> Clearly indicate required expertise for each step</li>
          <li><strong>Test thoroughly:</strong> Validate templates in real production scenarios before finalizing</li>
        </ul>
      `,
      author: "Sarah Johnson",
      lastUpdated: "2023-06-15",
    },
    {
      id: "bp2",
      category: "process",
      title: "Optimizing Process Steps",
      content: `
        <p>Well-designed process steps improve efficiency and reduce errors:</p>
        <ul>
          <li><strong>Break down complex tasks:</strong> Divide complicated processes into smaller, manageable steps</li>
          <li>...</li>
        </ul>
      `,
      author: "Sarah Johnson",
      lastUpdated: "2023-06-15",
    },
    {
      id: "bp3",
      category: "development",
      title: "Coding Standards",
      content: `
        <p>Adhering to coding standards ensures maintainability and collaboration:</p>
        <ul>
          <li><strong>Follow naming conventions:</strong> Use descriptive and consistent names for variables and functions</li>
          <li><strong>Write clear comments:</strong> Explain complex logic and decisions</li>
          <li><strong>Keep functions short:</strong> Aim for single responsibility functions</li>
        </ul>
      `,
      author: "David Lee",
      lastUpdated: "2023-07-01",
    },
    {
      id: "bp4",
      category: "testing",
      title: "Effective Testing Strategies",
      content: `
        <p>Comprehensive testing is crucial for reliable software:</p>
        <ul>
          <li><strong>Write unit tests:</strong> Test individual components in isolation</li>
          <li><strong>Perform integration tests:</strong> Verify interactions between different parts of the system</li>
          <li><strong>Conduct user acceptance testing (UAT):</strong> Ensure the software meets user requirements</li>
        </ul>
      `,
      author: "Emily Chen",
      lastUpdated: "2023-07-15",
    },
    {
      id: "bp5",
      category: "deployment",
      title: "Streamlined Deployment Process",
      content: `
        <p>A well-defined deployment process minimizes downtime and errors:</p>
        <ul>
          <li><strong>Automate deployments:</strong> Use tools like Jenkins or GitLab CI/CD</li>
          <li><strong>Implement rollback strategies:</strong> Have a plan to revert to a previous version if necessary</li>
          <li><strong>Monitor deployments:</strong> Track performance and errors after deployment</li>
        </ul>
      `,
      author: "Michael Brown",
      lastUpdated: "2023-08-01",
    },
    {
      id: "bp6",
      category: "security",
      title: "Security Best Practices",
      content: `
        <p>Security should be a top priority throughout the development lifecycle:</p>
        <ul>
          <li><strong>Validate user input:</strong> Prevent injection attacks</li>
          <li><strong>Use secure authentication and authorization:</strong> Protect sensitive data</li>
          <li><strong>Keep software up to date:</strong> Patch vulnerabilities promptly</li>
        </ul>
      `,
      author: "Jessica Wilson",
      lastUpdated: "2023-08-15",
    },
    {
      id: "bp7",
      category: "performance",
      title: "Performance Optimization Techniques",
      content: `
        <p>Optimizing performance improves user experience and reduces resource consumption:</p>
        <ul>
          <li><strong>Optimize database queries:</strong> Use indexes and avoid unnecessary data retrieval</li>
          <li><strong>Cache frequently accessed data:</strong> Reduce database load</li>
          <li><strong>Minimize network requests:</strong> Bundle and compress assets</li>
        </ul>
      `,
      author: "Kevin Garcia",
      lastUpdated: "2023-09-01",
    },
    {
      id: "bp8",
      category: "accessibility",
      title: "Accessibility Guidelines",
      content: `
        <p>Making software accessible to everyone is essential:</p>
        <ul>
          <li><strong>Provide alternative text for images:</strong> Help users with visual impairments understand the content</li>
          <li><strong>Use semantic HTML:</strong> Structure content logically</li>
          <li><strong>Ensure sufficient color contrast:</strong> Make text readable for users with low vision</li>
        </ul>
      `,
      author: "Ashley Rodriguez",
      lastUpdated: "2023-09-15",
    },
    {
      id: "bp9",
      category: "documentation",
      title: "Comprehensive Documentation",
      content: `
        <p>Good documentation is crucial for maintainability and knowledge sharing:</p>
        <ul>
          <li><strong>Document code thoroughly:</strong> Explain the purpose and usage of each function and class</li>
          <li><strong>Create user guides:</strong> Help users understand how to use the software</li>
          <li><strong>Maintain API documentation:</strong> Provide clear instructions for integrating with the software</li>
        </ul>
      `,
      author: "Brian Martinez",
      lastUpdated: "2023-10-01",
    },
    {
      id: "bp10",
      category: "collaboration",
      title: "Effective Collaboration Practices",
      content: `
        <p>Collaboration is key to successful software development:</p>
        <ul>
          <li><strong>Use version control:</strong> Track changes and collaborate effectively</li>
          <li><strong>Conduct code reviews:</strong> Ensure code quality and share knowledge</li>
          <li><strong>Communicate effectively:</strong> Keep everyone informed about progress and issues</li>
        </ul>
      `,
      author: "Stephanie Hernandez",
      lastUpdated: "2023-10-15",
    }
  ];
}

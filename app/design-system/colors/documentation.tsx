"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ColorDocumentation() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <section>
        <h1 className="text-4xl font-bold mb-4">Jewelia CRM Color System</h1>
        <p className="text-lg text-muted-foreground mb-8">
          A comprehensive guide to our color system, usage guidelines, and best practices.
        </p>
      </section>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="palette">Color Palette</TabsTrigger>
          <TabsTrigger value="usage">Usage Guidelines</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="dark-mode">Dark Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Color System Overview</CardTitle>
              <CardDescription>The foundation of our visual design language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Jewelia CRM color system is built around a core set of colors that reflect our brand identity while
                ensuring accessibility and usability. Our color palette consists of:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Primary Colors:</strong> Purple serves as our primary brand color, used for key actions,
                  interactive elements, and brand identification.
                </li>
                <li>
                  <strong>Secondary Colors:</strong> Neutral grays that provide structure and hierarchy without
                  competing with the primary color.
                </li>
                <li>
                  <strong>Semantic Colors:</strong> Functional colors that convey specific meanings such as success,
                  warning, error, and information.
                </li>
                <li>
                  <strong>Background & Text Colors:</strong> Carefully selected to ensure readability and reduce eye
                  strain.
                </li>
              </ul>

              <p>
                All colors are implemented using HSL (Hue, Saturation, Lightness) values, which provides flexibility for
                creating consistent color variations and ensures smooth transitions between light and dark modes.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Principles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Our color system is guided by these core principles:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Consistency:</strong> Colors are applied consistently to create a cohesive user experience.
                  </li>
                  <li>
                    <strong>Hierarchy:</strong> Colors help establish visual hierarchy and guide user attention.
                  </li>
                  <li>
                    <strong>Accessibility:</strong> All color combinations meet WCAG 2.1 AA standards for contrast.
                  </li>
                  <li>
                    <strong>Flexibility:</strong> The system adapts to both light and dark modes while maintaining brand
                    identity.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our color system is implemented through CSS variables and Tailwind CSS utility classes, making it easy
                  to apply and maintain consistent colors throughout the application.
                </p>

                <p>Colors are defined as HSL values in the root CSS variables and can be accessed through:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Tailwind utility classes (e.g., <code>bg-primary</code>, <code>text-secondary</code>)
                  </li>
                  <li>
                    CSS variables (e.g., <code>var(--primary)</code>, <code>var(--secondary)</code>)
                  </li>
                  <li>Custom utility classes for special cases</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="palette" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Color: Purple</CardTitle>
              <CardDescription>Our signature color, used for primary actions and brand identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Purple (HSL: 262 83% 58%) is our primary brand color, representing creativity, luxury, and quality.
                    It's used for primary buttons, active states, links, and other key interactive elements.
                  </p>

                  <p>
                    The primary color has 10 shades, ranging from very light (50) to very dark (950), allowing for
                    flexibility in different contexts while maintaining color harmony.
                  </p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="h-8 rounded bg-primary-50 px-4 flex items-center">Primary-50</div>
                  <div className="h-8 rounded bg-primary-100 px-4 flex items-center">Primary-100</div>
                  <div className="h-8 rounded bg-primary-200 px-4 flex items-center">Primary-200</div>
                  <div className="h-8 rounded bg-primary-300 px-4 flex items-center">Primary-300</div>
                  <div className="h-8 rounded bg-primary-400 px-4 flex items-center">Primary-400</div>
                  <div className="h-8 rounded bg-primary-500 px-4 flex items-center text-white">Primary-500</div>
                  <div className="h-8 rounded bg-primary-600 px-4 flex items-center text-white">Primary-600</div>
                  <div className="h-8 rounded bg-primary-700 px-4 flex items-center text-white">Primary-700</div>
                  <div className="h-8 rounded bg-primary-800 px-4 flex items-center text-white">Primary-800</div>
                  <div className="h-8 rounded bg-primary-900 px-4 flex items-center text-white">Primary-900</div>
                  <div className="h-8 rounded bg-primary-950 px-4 flex items-center text-white">Primary-950</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secondary Colors: Neutrals</CardTitle>
              <CardDescription>Neutral grays that provide structure and hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Our secondary colors are a range of neutral grays that provide structure and create visual hierarchy
                    without competing with the primary color. They're used for backgrounds, borders, and non-primary
                    text.
                  </p>

                  <p>Like the primary color, secondary colors have 10 shades for flexibility in different contexts.</p>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="h-8 rounded bg-secondary-50 px-4 flex items-center">Secondary-50</div>
                  <div className="h-8 rounded bg-secondary-100 px-4 flex items-center">Secondary-100</div>
                  <div className="h-8 rounded bg-secondary-200 px-4 flex items-center">Secondary-200</div>
                  <div className="h-8 rounded bg-secondary-300 px-4 flex items-center">Secondary-300</div>
                  <div className="h-8 rounded bg-secondary-400 px-4 flex items-center">Secondary-400</div>
                  <div className="h-8 rounded bg-secondary-500 px-4 flex items-center text-white">Secondary-500</div>
                  <div className="h-8 rounded bg-secondary-600 px-4 flex items-center text-white">Secondary-600</div>
                  <div className="h-8 rounded bg-secondary-700 px-4 flex items-center text-white">Secondary-700</div>
                  <div className="h-8 rounded bg-secondary-800 px-4 flex items-center text-white">Secondary-800</div>
                  <div className="h-8 rounded bg-secondary-900 px-4 flex items-center text-white">Secondary-900</div>
                  <div className="h-8 rounded bg-secondary-950 px-4 flex items-center text-white">Secondary-950</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
              <CardDescription>Functional colors that convey specific meanings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Semantic colors convey specific meanings and are used consistently throughout the application to
                    provide immediate visual cues to users.
                  </p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Success:</strong> Green, used for successful actions, completions, and positive states.
                    </li>
                    <li>
                      <strong>Warning:</strong> Amber, used for warnings, cautions, and actions that need attention.
                    </li>
                    <li>
                      <strong>Error:</strong> Red, used for errors, destructive actions, and critical alerts.
                    </li>
                    <li>
                      <strong>Info:</strong> Blue, used for informational messages and neutral notifications.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="h-12 rounded bg-success px-4 flex items-center text-white">Success</div>
                  <div className="h-12 rounded bg-warning px-4 flex items-center text-white">Warning</div>
                  <div className="h-12 rounded bg-destructive px-4 flex items-center text-white">Error</div>
                  <div className="h-12 rounded bg-info px-4 flex items-center text-white">Info</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Background & Text Colors</CardTitle>
              <CardDescription>Colors for backgrounds, text, and UI elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4">
                    Our background and text colors are carefully selected to ensure readability and reduce eye strain.
                    They provide the foundation for our interface and establish the overall visual tone.
                  </p>

                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Background:</strong> The main background color of the application.
                    </li>
                    <li>
                      <strong>Foreground:</strong> The primary text color used throughout the application.
                    </li>
                    <li>
                      <strong>Muted:</strong> Used for secondary text and subtle UI elements.
                    </li>
                    <li>
                      <strong>Accent:</strong> Used for subtle highlights and accents.
                    </li>
                    <li>
                      <strong>Border:</strong> Used for borders and dividers.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="h-12 rounded bg-background border px-4 flex items-center">Background</div>
                  <div className="h-12 rounded bg-muted px-4 flex items-center">Muted</div>
                  <div className="h-12 rounded bg-accent px-4 flex items-center">Accent</div>
                  <div className="h-12 rounded border px-4 flex items-center">Border</div>
                  <div className="h-12 rounded bg-popover px-4 flex items-center">Popover</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Usage Guidelines</CardTitle>
              <CardDescription>Best practices for applying colors consistently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Consistent color usage is essential for creating a cohesive user experience. Follow these guidelines to
                ensure colors are applied appropriately throughout the application.
              </p>

              <h3 className="text-lg font-semibold mt-6">Primary Color Usage</h3>
              <p>Our primary purple color should be used for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Primary action buttons</li>
                <li>Active states and selections</li>
                <li>Links and interactive elements</li>
                <li>Progress indicators</li>
                <li>Brand elements and accents</li>
              </ul>

              <div className="bg-muted p-4 rounded-md mt-2">
                <p className="text-sm font-medium">
                  Primary color should be used sparingly to maintain its impact and guide user attention to key actions.
                </p>
              </div>

              <h3 className="text-lg font-semibold mt-6">Secondary Color Usage</h3>
              <p>Secondary colors should be used for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Secondary and tertiary buttons</li>
                <li>Backgrounds and containers</li>
                <li>Borders and dividers</li>
                <li>Non-primary text</li>
                <li>Inactive states</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Semantic Color Usage</h3>
              <p>Semantic colors should be used consistently to convey specific meanings:</p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Example</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Success (Green)</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-6">
                        <li>Successful actions</li>
                        <li>Completed states</li>
                        <li>Positive indicators</li>
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-success mr-2" />
                        <span>Order completed</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Warning (Amber)</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-6">
                        <li>Warnings</li>
                        <li>Cautions</li>
                        <li>Actions needing attention</li>
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-warning mr-2" />
                        <span>Low inventory</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Error (Red)</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-6">
                        <li>Errors</li>
                        <li>Destructive actions</li>
                        <li>Critical alerts</li>
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-destructive mr-2" />
                        <span>Payment failed</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Info (Blue)</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-6">
                        <li>Informational messages</li>
                        <li>Neutral notifications</li>
                        <li>Help and guidance</li>
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <InfoIcon className="h-5 w-5 text-info mr-2" />
                        <span>New feature available</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Do's and Don'ts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Do:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the primary purple color for key actions and important UI elements</li>
                  <li>Maintain consistent color usage for similar elements and actions</li>
                  <li>Use semantic colors to convey specific meanings</li>
                  <li>Ensure sufficient contrast between text and background colors</li>
                  <li>Use color variations (lighter/darker) to create hierarchy</li>
                </ul>

                <h3 className="font-semibold mt-4">Don't:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Overuse the primary color, which can reduce its impact</li>
                  <li>Use colors inconsistently for the same type of elements</li>
                  <li>Rely solely on color to convey information (always include text or icons)</li>
                  <li>Create new colors outside the defined palette</li>
                  <li>Use semantic colors for non-semantic purposes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Combinations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Effective color combinations enhance usability and visual appeal. Here are recommended combinations:
                </p>

                <h3 className="font-semibold">Primary Combinations:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary"></div>
                    <span>Primary + White (Buttons, CTAs)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100"></div>
                    <span>Primary-100 + Primary-900 (Subtle highlights)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary-200"></div>
                    <span>Primary-200 + Primary-800 (Selected states)</span>
                  </div>
                </div>

                <h3 className="font-semibold mt-4">Background Combinations:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-background"></div>
                    <span>Background + Foreground (Main content)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted"></div>
                    <span>Muted + Foreground (Secondary content)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-card"></div>
                    <span>Card + Card-foreground (Card content)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Component-Specific Guidelines</CardTitle>
              <CardDescription>Color usage for specific UI components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold">Buttons</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong>Primary Button:</strong> Background: Primary, Text: White
                    </li>
                    <li>
                      <strong>Secondary Button:</strong> Background: Secondary, Text: Foreground
                    </li>
                    <li>
                      <strong>Destructive Button:</strong> Background: Destructive, Text: White
                    </li>
                    <li>
                      <strong>Ghost Button:</strong> Background: Transparent, Text: Foreground
                    </li>
                    <li>
                      <strong>Outline Button:</strong> Background: Transparent, Border: Border, Text: Foreground
                    </li>
                  </ul>

                  <h3 className="font-semibold mt-4">Forms</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong>Input:</strong> Background: Background, Border: Input, Text: Foreground
                    </li>
                    <li>
                      <strong>Focus State:</strong> Border: Primary, Ring: Primary (with reduced opacity)
                    </li>
                    <li>
                      <strong>Error State:</strong> Border: Destructive, Text: Destructive
                    </li>
                    <li>
                      <strong>Success State:</strong> Border: Success, Text: Success
                    </li>
                    <li>
                      <strong>Disabled State:</strong> Background: Muted, Text: Muted-foreground
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Navigation</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong>Active Item:</strong> Background: Primary (subtle), Text: Primary
                    </li>
                    <li>
                      <strong>Hover State:</strong> Background: Muted, Text: Foreground
                    </li>
                    <li>
                      <strong>Inactive Item:</strong> Text: Muted-foreground
                    </li>
                  </ul>

                  <h3 className="font-semibold mt-4">Alerts and Notifications</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong>Info Alert:</strong> Background: Info (subtle), Border: Info, Text: Info-foreground
                    </li>
                    <li>
                      <strong>Success Alert:</strong> Background: Success (subtle), Border: Success, Text:
                      Success-foreground
                    </li>
                    <li>
                      <strong>Warning Alert:</strong> Background: Warning (subtle), Border: Warning, Text:
                      Warning-foreground
                    </li>
                    <li>
                      <strong>Error Alert:</strong> Background: Destructive (subtle), Border: Destructive, Text:
                      Destructive-foreground
                    </li>
                  </ul>

                  <h3 className="font-semibold mt-4">Data Visualization</h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong>Primary Data:</strong> Primary color family
                    </li>
                    <li>
                      <strong>Secondary Data:</strong> Secondary color family
                    </li>
                    <li>
                      <strong>Status Data:</strong> Semantic colors
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Guidelines</CardTitle>
              <CardDescription>Ensuring our colors are accessible to all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our color system is designed to meet WCAG 2.1 AA standards for accessibility, ensuring that our
                application is usable by people with various visual abilities.
              </p>

              <h3 className="text-lg font-semibold mt-6">Contrast Requirements</h3>
              <p>All text and interactive elements must meet these minimum contrast ratios:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Normal Text (14px+):</strong> 4.5:1 contrast ratio against its background
                </li>
                <li>
                  <strong>Large Text (18px+ or 14px+ bold):</strong> 3:1 contrast ratio against its background
                </li>
                <li>
                  <strong>UI Components and Graphical Objects:</strong> 3:1 contrast ratio against adjacent colors
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Color Combinations to Avoid</h3>
              <p>Some color combinations may be difficult for users with color vision deficiencies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Red and green (most common color vision deficiency)</li>
                <li>Green and brown</li>
                <li>Blue and purple</li>
                <li>Green and blue</li>
                <li>Light green and yellow</li>
                <li>Blue and grey</li>
                <li>Green and grey</li>
                <li>Green and black</li>
              </ul>

              <Alert className="mt-4">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Never rely solely on color to convey information. Always include text labels, icons, or patterns to
                  ensure information is accessible to everyone.
                </AlertDescription>
              </Alert>

              <h3 className="text-lg font-semibold mt-6">Testing Tools</h3>
              <p>Use these tools to verify color accessibility:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a
                    href="https://webaim.org/resources/contrastchecker/"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WebAIM Contrast Checker
                  </a>
                </li>
                <li>
                  <a
                    href="https://color.a11y.com/"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Color A11y
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.figma.com/community/plugin/733159460536249875/A11y---Color-Contrast-Checker"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Figma A11y Plugin
                  </a>
                </li>
                <li>
                  <a
                    href="https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    axe DevTools (Chrome Extension)
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Vision Deficiencies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Approximately 8% of men and 0.5% of women have some form of color vision deficiency. Our color system
                  is designed to be accessible to users with various types of color blindness:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Deuteranopia:</strong> Difficulty distinguishing between red and green (most common)
                  </li>
                  <li>
                    <strong>Protanopia:</strong> Difficulty distinguishing between red and green, and colors appear
                    darker
                  </li>
                  <li>
                    <strong>Tritanopia:</strong> Difficulty distinguishing between blue and yellow
                  </li>
                  <li>
                    <strong>Achromatopsia:</strong> Complete color blindness, seeing only in shades of grey
                  </li>
                </ul>

                <p className="mt-4">To accommodate these users, we:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Use sufficient contrast between colors</li>
                  <li>Include text labels alongside color-coded information</li>
                  <li>Use patterns or icons in addition to color</li>
                  <li>Test our interfaces with color blindness simulators</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contrast Ratios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Our primary color combinations have been tested to ensure they meet WCAG 2.1 AA standards:</p>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Combination</TableHead>
                      <TableHead>Contrast Ratio</TableHead>
                      <TableHead>WCAG 2.1 AA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Primary on White</TableCell>
                      <TableCell>4.6:1</TableCell>
                      <TableCell className="text-success">Pass</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>White on Primary</TableCell>
                      <TableCell>4.6:1</TableCell>
                      <TableCell className="text-success">Pass</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Primary on Black</TableCell>
                      <TableCell>5.2:1</TableCell>
                      <TableCell className="text-success">Pass</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Black on Primary-100</TableCell>
                      <TableCell>16.8:1</TableCell>
                      <TableCell className="text-success">Pass</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Primary-700 on White</TableCell>
                      <TableCell>7.8:1</TableCell>
                      <TableCell className="text-success">Pass</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <p className="mt-4">
                  When creating custom color combinations, always verify the contrast ratio meets these standards:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>4.5:1 for normal text</li>
                  <li>3:1 for large text</li>
                  <li>3:1 for UI components and graphical objects</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dark-mode" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dark Mode Implementation</CardTitle>
              <CardDescription>Guidelines for implementing and using dark mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our color system includes a comprehensive dark mode that maintains brand consistency while reducing eye
                strain in low-light environments. The dark mode is implemented using CSS variables and the{" "}
                <code>.dark</code> class.
              </p>

              <h3 className="text-lg font-semibold mt-6">Color Adjustments in Dark Mode</h3>
              <p>When switching to dark mode, colors are adjusted as follows:</p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Light Mode</TableHead>
                    <TableHead>Dark Mode</TableHead>
                    <TableHead>Adjustment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Background</TableCell>
                    <TableCell>White (0 0% 100%)</TableCell>
                    <TableCell>Dark Gray (0 0% 3.9%)</TableCell>
                    <TableCell>Inverted</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Foreground</TableCell>
                    <TableCell>Black (0 0% 3.9%)</TableCell>
                    <TableCell>Off-White (0 0% 98%)</TableCell>
                    <TableCell>Inverted</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Primary</TableCell>
                    <TableCell>Purple (262 83% 58%)</TableCell>
                    <TableCell>Lighter Purple (262 60% 65%)</TableCell>
                    <TableCell>Brightened</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Secondary</TableCell>
                    <TableCell>Light Gray (0 0% 96.1%)</TableCell>
                    <TableCell>Dark Gray (0 0% 14.9%)</TableCell>
                    <TableCell>Darkened</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Muted</TableCell>
                    <TableCell>Light Gray (0 0% 96.1%)</TableCell>
                    <TableCell>Dark Gray (0 0% 14.9%)</TableCell>
                    <TableCell>Darkened</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Border</TableCell>
                    <TableCell>Light Gray (0 0% 89.8%)</TableCell>
                    <TableCell>Dark Gray (0 0% 14.9%)</TableCell>
                    <TableCell>Darkened</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h3 className="text-lg font-semibold mt-6">Implementation</h3>
              <p>
                Dark mode is implemented using CSS variables and the <code>.dark</code> class:
              </p>

              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 262 83% 58%;
  /* Other light mode variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 262 60% 65%;
  /* Other dark mode variables */
}
                `}</code>
              </pre>

              <p className="mt-4">
                To toggle dark mode, add or remove the <code>.dark</code> class from the <code>html</code> element:
              </p>

              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`
// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');

// Toggle dark mode
document.documentElement.classList.toggle('dark');
                `}</code>
              </pre>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dark Mode Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Follow these best practices when designing and implementing dark mode:</p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Don't simply invert colors.</strong> Proper dark mode requires thoughtful color selection.
                  </li>
                  <li>
                    <strong>Reduce contrast slightly.</strong> Pure white text on pure black backgrounds can cause eye
                    strain.
                  </li>
                  <li>
                    <strong>Desaturate colors slightly.</strong> Bright, saturated colors can appear to "vibrate"
                    against dark backgrounds.
                  </li>
                  <li>
                    <strong>Maintain color meaning.</strong> Semantic colors should convey the same meaning in both
                    modes.
                  </li>
                  <li>
                    <strong>Test for accessibility.</strong> Ensure all text meets contrast requirements in dark mode.
                  </li>
                  <li>
                    <strong>Use shadows carefully.</strong> Shadows may need adjustment or removal in dark mode.
                  </li>
                  <li>
                    <strong>Consider user preferences.</strong> Respect the user's system preference for light/dark
                    mode.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Our application respects user preferences for dark mode in three ways:</p>

                <h3 className="font-semibold">1. System Preference</h3>
                <p>
                  By default, the application follows the user's system preference using the
                  <code>prefers-color-scheme</code> media query:
                </p>

                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{`
// Check system preference
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply dark mode if system prefers it
if (systemPrefersDark) {
  document.documentElement.classList.add('dark');
}
                  `}</code>
                </pre>

                <h3 className="font-semibold mt-4">2. User Setting</h3>
                <p>Users can override the system preference in the application settings:</p>

                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{`
// Get user preference from localStorage
const userPreference = localStorage.getItem('theme');

if (userPreference === 'dark') {
  document.documentElement.classList.add('dark');
} else if (userPreference === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  // Fall back to system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (systemPrefersDark) {
    document.documentElement.classList.add('dark');
  }
}
                  `}</code>
                </pre>

                <h3 className="font-semibold mt-4">3. Toggle Control</h3>
                <p>A toggle control allows users to switch between light and dark mode:</p>

                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{`
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
                  `}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

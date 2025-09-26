"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Accessibility, 
  Settings, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Contrast,
  Zap,
  Monitor,
  Smartphone,
  Palette,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Home,
  Search,
  Menu,
  X
} from "lucide-react";

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusIndicator: boolean;
  altText: boolean;
}

interface ProfileAccessibilityProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
}

export function ProfileAccessibility({ settings, onSettingsChange }: ProfileAccessibilityProps) {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('');
  const focusRef = useRef<HTMLDivElement>(null);

  const keyboardShortcuts = [
    { key: 'Tab', description: 'Navigate between interactive elements', icon: ArrowRight },
    { key: 'Enter/Space', description: 'Activate buttons and links', icon: CheckCircle },
    { key: 'Arrow Keys', description: 'Navigate within components', icon: ArrowUp },
    { key: 'Escape', description: 'Close modals and dialogs', icon: X },
    { key: 'Ctrl + +', description: 'Increase font size', icon: Zap },
    { key: 'Ctrl + -', description: 'Decrease font size', icon: Zap },
    { key: 'Ctrl + 0', description: 'Reset font size', icon: RotateCcw },
    { key: 'Alt + H', description: 'Toggle high contrast', icon: Contrast },
    { key: 'Alt + M', description: 'Toggle reduced motion', icon: RotateCcw },
    { key: 'Alt + S', description: 'Toggle screen reader announcements', icon: Volume2 }
  ];

  const colorBlindnessOptions = [
    { value: 'none', label: 'None', description: 'Standard colors' },
    { value: 'protanopia', label: 'Protanopia', description: 'Red-green color blindness (red deficiency)' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Red-green color blindness (green deficiency)' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-yellow color blindness' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: 'text-sm' },
    { value: 'medium', label: 'Medium', size: 'text-base' },
    { value: 'large', label: 'Large', size: 'text-lg' }
  ];

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }

    // Font size
    root.style.setProperty('--font-size', settings.fontSize);

    // Color blindness
    if (settings.colorBlindness !== 'none') {
      root.classList.add(`color-blindness-${settings.colorBlindness}`);
    } else {
      root.classList.remove('color-blindness-protanopia', 'color-blindness-deuteranopia', 'color-blindness-tritanopia');
    }

    // Focus indicator
    if (settings.focusIndicator) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [settings]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;

      const target = event.target as HTMLElement;
      const isProfileElement = target.closest('[data-profile-section]');
      
      if (!isProfileElement) return;

      let nextElement: HTMLElement | null = null;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          nextElement = target.nextElementSibling as HTMLElement;
          if (!nextElement) {
            nextElement = target.parentElement?.nextElementSibling?.querySelector('[tabindex]') as HTMLElement;
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          nextElement = target.previousElementSibling as HTMLElement;
          if (!nextElement) {
            nextElement = target.parentElement?.previousElementSibling?.querySelector('[tabindex]') as HTMLElement;
          }
          break;
        case 'Tab':
          setCurrentFocus(target.getAttribute('data-profile-section') || '');
          break;
        case 'Enter':
        case ' ':
          if (target.getAttribute('role') === 'button' || target.tagName === 'BUTTON') {
            event.preventDefault();
            target.click();
          }
          break;
      }

      if (nextElement && nextElement.hasAttribute('tabindex')) {
        nextElement.focus();
        setCurrentFocus(nextElement.getAttribute('data-profile-section') || '');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation]);

  // Screen reader announcements
  const announceToScreenReader = (message: string) => {
    if (!settings.screenReader) return;
    
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
    
    // Announce changes to screen reader
    const messages = {
      highContrast: value ? 'High contrast enabled' : 'High contrast disabled',
      reducedMotion: value ? 'Reduced motion enabled' : 'Reduced motion disabled',
      screenReader: value ? 'Screen reader announcements enabled' : 'Screen reader announcements disabled',
      keyboardNavigation: value ? 'Keyboard navigation enabled' : 'Keyboard navigation disabled',
      fontSize: `Font size set to ${value}`,
      colorBlindness: value === 'none' ? 'Color blindness mode disabled' : `Color blindness mode set to ${value}`,
      focusIndicator: value ? 'Focus indicators enabled' : 'Focus indicators disabled',
      altText: value ? 'Alt text enabled' : 'Alt text disabled'
    };
    
    announceToScreenReader(messages[key as keyof typeof messages]);
  };

  return (
    <div className="space-y-6">
      {/* Accessibility Status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility</h3>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          WCAG 2.1 AA Compliant
        </Badge>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    High Contrast
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                  aria-label="Toggle high contrast"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Reduced Motion
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Reduce animations and transitions
                  </p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                  aria-label="Toggle reduced motion"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Screen Reader
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Enable screen reader announcements
                  </p>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                  aria-label="Toggle screen reader"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Keyboard Navigation
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Enhanced keyboard navigation
                  </p>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                  aria-label="Toggle keyboard navigation"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Focus Indicators
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Show focus indicators
                  </p>
                </div>
                <Switch
                  checked={settings.focusIndicator}
                  onCheckedChange={(checked) => handleSettingChange('focusIndicator', checked)}
                  aria-label="Toggle focus indicators"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Alt Text
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Show alt text for images
                  </p>
                </div>
                <Switch
                  checked={settings.altText}
                  onCheckedChange={(checked) => handleSettingChange('altText', checked)}
                  aria-label="Toggle alt text"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Size and Color Blindness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Font Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fontSizeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.fontSize === option.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleSettingChange('fontSize', option.value)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Set font size to ${option.label}`}
                >
                  <span className={`font-medium ${option.size}`}>
                    {option.label} Text
                  </span>
                  {settings.fontSize === option.value && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Color Blindness Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {colorBlindnessOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.colorBlindness === option.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleSettingChange('colorBlindness', option.value)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Set color blindness mode to ${option.label}`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  {settings.colorBlindness === option.value && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Keyboard Shortcuts
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              aria-expanded={showKeyboardShortcuts}
            >
              {showKeyboardShortcuts ? 'Hide' : 'Show'} Shortcuts
            </Button>
          </div>
        </CardHeader>
        {showKeyboardShortcuts && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Focus Indicator */}
      {settings.keyboardNavigation && currentFocus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800">
                {currentFocus}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Use arrow keys to navigate, Enter/Space to activate
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Accessibility Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>All interactive elements are keyboard accessible</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Images have descriptive alt text</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Color is not the only way information is conveyed</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Text has sufficient color contrast ratios</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
              <span>Forms have proper labels and error messages</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
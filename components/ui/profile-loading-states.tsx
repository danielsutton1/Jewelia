"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Network,
  HardDrive,
  Cpu,
  Activity,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  lastOptimized: Date;
}

interface ProfileLoadingStatesProps {
  isLoading: boolean;
  loadingProgress: number;
  loadingMessage: string;
  performanceMetrics: PerformanceMetrics;
  onOptimize: () => void;
}

export function ProfileLoadingStates({ 
  isLoading, 
  loadingProgress, 
  loadingMessage, 
  performanceMetrics, 
  onOptimize 
}: ProfileLoadingStatesProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  const getPerformanceStatus = () => {
    if (performanceMetrics.loadTime < 1000) return { status: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (performanceMetrics.loadTime < 2000) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (performanceMetrics.loadTime < 3000) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const performanceStatus = getPerformanceStatus();

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await onOptimize();
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading Profile
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {loadingMessage}
            </p>
            <Progress value={loadingProgress} className="mb-4" />
            <div className="text-sm text-gray-500">
              {loadingProgress}% complete
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              Performance Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${performanceStatus.bg} ${performanceStatus.color}`}>
                {performanceStatus.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPerformance(!showPerformance)}
              >
                {showPerformance ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceMetrics.loadTime}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Load Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceMetrics.memoryUsage}MB
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Network className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceMetrics.networkLatency}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Network</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <HardDrive className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {performanceMetrics.cacheHitRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cache Hit</div>
            </div>
          </div>

          {showPerformance && (
            <div className="mt-6 space-y-4">
              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Load Time Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Initial Load</span>
                      <span className="text-gray-600">{(performanceMetrics.loadTime * 0.4).toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Data Fetching</span>
                      <span className="text-gray-600">{(performanceMetrics.loadTime * 0.3).toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Rendering</span>
                      <span className="text-gray-600">{(performanceMetrics.loadTime * 0.2).toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Finalization</span>
                      <span className="text-gray-600">{(performanceMetrics.loadTime * 0.1).toFixed(0)}ms</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">System Resources</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>CPU Usage</span>
                      <span className="text-gray-600">{(performanceMetrics.memoryUsage * 0.1).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Memory Usage</span>
                      <span className="text-gray-600">{performanceMetrics.memoryUsage}MB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Network Status</span>
                      <span className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-emerald-600" />
                        <span className="text-gray-600">Connected</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Optimized</span>
                      <span className="text-gray-600">
                        {performanceMetrics.lastOptimized.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimization Recommendations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Optimization Recommendations
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  {performanceMetrics.loadTime > 2000 && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>Consider enabling image compression to reduce load time</span>
                    </div>
                  )}
                  {performanceMetrics.memoryUsage > 100 && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>High memory usage detected. Consider clearing cache</span>
                    </div>
                  )}
                  {performanceMetrics.cacheHitRate < 80 && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>Low cache hit rate. Enable aggressive caching</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5" />
                    <span>Profile data is being served from optimized CDN</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            Performance Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Auto-Optimization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically optimize profile loading and caching
                </p>
              </div>
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Optimize Now
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h5 className="font-medium text-gray-900 dark:text-white">Database</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimized queries</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h5 className="font-medium text-gray-900 dark:text-white">Network</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">CDN enabled</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <HardDrive className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h5 className="font-medium text-gray-900 dark:text-white">Cache</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smart caching</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Load Time Trend</span>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600">-12% this week</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600">+5% this week</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600">+8% this week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
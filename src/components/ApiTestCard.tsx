"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/services/api";

export default function ApiTestCard() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only run health check on the client
    apiClient.checkHealth()
      .then(() => console.log("API is healthy"))
      .catch(err => console.error("API health check failed:", err));
  }, []);

  const testConnection = async () => {
    setApiStatus('loading');
    setError(null);
    
    try {
      const response = await apiClient.testConnection();
      setApiData(response);
      setApiStatus('success');
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Don't render anything until component is mounted to prevent hydration errors
  if (!isMounted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>
            Test the connection to the rForms FastAPI backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>
          Test the connection to the rForms FastAPI backend
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {apiStatus === 'idle' && (
          <p className="text-sm text-muted-foreground">Click the button below to test the API connection.</p>
        )}
        
        {apiStatus === 'loading' && (
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="ml-2">Testing connection...</span>
          </div>
        )}
        
        {apiStatus === 'success' && apiData && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="font-semibold">{apiData.message}</p>
              <p className="text-sm text-muted-foreground">Status: {apiData.status}</p>
            </div>
            
            {apiData.data?.metrics && (
              <div>
                <h3 className="text-sm font-medium mb-2">Sample Metrics:</h3>
                <ul className="space-y-1">
                  {apiData.data.metrics.map((metric: any) => (
                    <li key={metric.id} className="text-sm px-3 py-1 bg-muted/50 rounded-sm">
                      {metric.name} ({metric.type})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {apiStatus === 'error' && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <p className="font-semibold">Connection failed</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Make sure the FastAPI server is running at http://localhost:8000</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={testConnection}
          disabled={apiStatus === 'loading'}
          className="w-full"
        >
          {apiStatus === 'loading' ? 'Testing...' : 'Test API Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
} 
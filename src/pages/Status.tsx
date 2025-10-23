import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  lastChecked: string;
  uptime: string;
}

interface Incident {
  id: number;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  startTime: string;
  updates: {
    time: string;
    message: string;
  }[];
}

const Status = () => {
  const { t } = useTranslation();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const services: ServiceStatus[] = [
    {
      name: 'Web Application',
      status: 'operational',
      lastChecked: '2 minutes ago',
      uptime: '99.98%'
    },
    {
      name: 'API Services',
      status: 'operational',
      lastChecked: '1 minute ago',
      uptime: '99.95%'
    },
    {
      name: 'Authentication',
      status: 'operational',
      lastChecked: '3 minutes ago',
      uptime: '99.99%'
    },
    {
      name: 'Real-time Chat',
      status: 'operational',
      lastChecked: '2 minutes ago',
      uptime: '99.92%'
    },
    {
      name: 'File Storage',
      status: 'operational',
      lastChecked: '4 minutes ago',
      uptime: '99.97%'
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      lastChecked: '1 minute ago',
      uptime: '99.96%'
    },
    {
      name: 'Email Notifications',
      status: 'operational',
      lastChecked: '5 minutes ago',
      uptime: '99.94%'
    },
    {
      name: 'Database',
      status: 'operational',
      lastChecked: '2 minutes ago',
      uptime: '99.99%'
    }
  ];

  const incidents: Incident[] = [
    // No active incidents - uncomment to show example
    // {
    //   id: 1,
    //   title: 'Intermittent API Delays',
    //   status: 'monitoring',
    //   severity: 'minor',
    //   description: 'Some users may experience slower response times when loading events.',
    //   startTime: '2 hours ago',
    //   updates: [
    //     {
    //       time: '30 minutes ago',
    //       message: 'We have identified the issue and implemented a fix. Monitoring for stability.'
    //     },
    //     {
    //       time: '2 hours ago',
    //       message: 'We are investigating reports of slower API response times.'
    //     }
    //   ]
    // }
  ];

  const maintenanceSchedule = [
    {
      title: 'Database Optimization',
      date: 'Feb 20, 2024',
      time: '2:00 AM - 4:00 AM EST',
      impact: 'Minimal - Brief interruptions possible',
      status: 'scheduled'
    }
  ];

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      operational: { variant: 'default' as const, label: 'Operational', className: 'bg-green-500' },
      degraded: { variant: 'secondary' as const, label: 'Degraded', className: 'bg-yellow-500' },
      outage: { variant: 'destructive' as const, label: 'Outage', className: 'bg-red-500' },
      maintenance: { variant: 'outline' as const, label: 'Maintenance', className: 'bg-blue-500' }
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: Incident['severity']) => {
    const variants = {
      minor: { variant: 'secondary' as const, label: 'Minor' },
      major: { variant: 'default' as const, label: 'Major' },
      critical: { variant: 'destructive' as const, label: 'Critical' }
    };
    const config = variants[severity];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getIncidentStatusBadge = (status: Incident['status']) => {
    const labels = {
      investigating: 'Investigating',
      identified: 'Identified',
      monitoring: 'Monitoring',
      resolved: 'Resolved'
    };
    return <Badge variant="outline">{labels[status]}</Badge>;
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">System Status</h1>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {allOperational ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <h2 className="text-2xl font-semibold">All Systems Operational</h2>
                  <p className="text-muted-foreground">Everything is running smoothly</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div>
                  <h2 className="text-2xl font-semibold">Some Systems Affected</h2>
                  <p className="text-muted-foreground">We're working to resolve any issues</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {incidents.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
            <CardDescription>Current issues affecting our services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {incidents.map(incident => (
                <div key={incident.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{incident.title}</h3>
                      <p className="text-sm text-muted-foreground">{incident.startTime}</p>
                    </div>
                    <div className="flex gap-2">
                      {getSeverityBadge(incident.severity)}
                      {getIncidentStatusBadge(incident.status)}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{incident.description}</p>
                  <div className="space-y-3">
                    <h4 className="font-medium">Updates:</h4>
                    {incident.updates.map((update, index) => (
                      <div key={index} className="bg-accent p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">{update.time}</p>
                        <p className="text-sm text-muted-foreground">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Current status of all platform services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Checked {service.lastChecked}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(service.status)}
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.uptime} uptime
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {maintenanceSchedule.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scheduled Maintenance</CardTitle>
            <CardDescription>Upcoming planned maintenance windows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceSchedule.map((maintenance, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold">{maintenance.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {maintenance.date} • {maintenance.time}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Impact:</span> {maintenance.impact}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Uptime History (Last 90 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Uptime</span>
              <span className="text-2xl font-bold text-green-500">99.96%</span>
            </div>
            <div className="flex gap-1 h-12 items-end">
              {Array.from({ length: 90 }).map((_, i) => {
                const height = 95 + Math.random() * 5;
                const isIncident = Math.random() < 0.02;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      isIncident ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: ${height.toFixed(2)}% uptime`}
                  />
                );
              })}
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-muted-foreground">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-muted-foreground">Incident</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Subscribe to status updates via{' '}
          <Button variant="link" className="px-1">
            RSS
          </Button>
          {' '}or{' '}
          <Button variant="link" className="px-1">
            Email
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Status;

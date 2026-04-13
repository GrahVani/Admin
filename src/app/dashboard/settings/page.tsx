"use client";

import React, { useState, Suspense } from "react";
import { 
  Shield, Bell, Database, Users, CreditCard, 
  Clock, Moon, Sun, Globe, Mail, Key, 
  FileText, Image, LayoutGrid, Layers, 
  ChevronRight, Lock, UserCircle, Zap,
  Save, Undo, CheckCircle, AlertTriangle,
  Info, HelpCircle, Lightbulb, Settings2,
  RefreshCw, ExternalLink, Upload, Trash2,
  Eye, EyeOff, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Tooltip, TooltipContent, TooltipIndicator, FieldLabel } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Settings Sections Configuration
const settingsSections = [
  {
    id: "general",
    label: "General",
    icon: Settings2,
    tooltip: "Platform-wide general settings including branding and default values",
    description: "Configure platform branding, default values, and system preferences"
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    tooltip: "Authentication, authorization, and security policies",
    description: "Manage passwords, MFA, session policies, and access controls"
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    tooltip: "Email and in-app notification preferences",
    description: "Configure email templates, notification channels, and alert rules"
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Moon,
    tooltip: "Theme, branding, and visual customization",
    description: "Customize colors, logos, and UI themes"
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Layers,
    tooltip: "Third-party service integrations and API keys",
    description: "Manage external services, webhooks, and API configurations"
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    tooltip: "Payment gateway and billing settings",
    description: "Configure payment processors, taxes, and invoicing"
  },
];

// Section Components with Tooltips

function SectionHeader({ title, description, icon: Icon, tooltip }: { 
  title: string; 
  description: string; 
  icon: any;
  tooltip: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Tooltip content={tooltip} position="top">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center cursor-help">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
        </Tooltip>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ 
  label, 
  description, 
  tooltip,
  children,
  icon: Icon,
  required = false
}: { 
  label: string; 
  description?: string; 
  tooltip: string;
  children: React.ReactNode;
  icon?: any;
  required?: boolean;
}) {
  return (
    <div className="py-4 border-b border-slate-700/50 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-slate-400" />}
            <Tooltip content={tooltip} position="top">
              <label className="text-sm font-medium text-slate-200 cursor-help">
                {label}
                {required && <span className="text-rose-400 ml-1">*</span>}
              </label>
            </Tooltip>
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-1 ml-6">{description}</p>
          )}
        </div>
        <div className="shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="glass-card p-6">
      <SectionHeader 
        title="General Settings"
        description="Platform-wide configuration and defaults"
        icon={Settings2}
        tooltip="Configure fundamental platform settings that affect all users"
      />
      
      <div className="space-y-2">
        <SettingRow 
          label="Platform Name" 
          description="Display name across the admin panel and emails"
          tooltip="The name users will see in emails, headers, and browser tabs"
          icon={Globe}
          required
        >
          <Input 
            defaultValue="Grahvani Platform"
            className="w-64"
            placeholder="Enter platform name"
          />
        </SettingRow>

        <SettingRow 
          label="Support Email" 
          description="Contact email for user support"
          tooltip="Users will receive support responses from this email address"
          icon={Mail}
        >
          <Input 
            type="email"
            defaultValue="support@grahvani.com"
            className="w-64"
            placeholder="support@example.com"
          />
        </SettingRow>

        <SettingRow 
          label="Default Timezone" 
          description="System default timezone for all dates"
          tooltip="This timezone will be used as default for all users and scheduled operations"
          icon={Clock}
        >
          <Select defaultValue="Asia/Kolkata">
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
              <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow 
          label="Date Format" 
          description="Preferred date display format"
          tooltip="Choose how dates are displayed throughout the platform"
          icon={Clock}
        >
          <Select defaultValue="DD/MM/YYYY">
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow 
          label="Maintenance Mode" 
          description="Temporarily disable user access"
          tooltip="When enabled, only admin users can access the platform"
          icon={AlertTriangle}
        >
          <Tooltip content="Toggle maintenance mode - users will see a maintenance page" position="left">
            <Switch />
          </Tooltip>
        </SettingRow>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
        <Tooltip content="Discard unsaved changes" position="bottom">
          <Button variant="ghost" leftIcon={Undo}>Reset</Button>
        </Tooltip>
        <Tooltip content="Save all changes to general settings" position="bottom">
          <Button 
            onClick={handleSave} 
            isLoading={saving}
            leftIcon={saved ? CheckCircle : Save}
            variant={saved ? "gold" : "primary"}
          >
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText("sk_live_1234567890abcdef");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Authentication */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Authentication"
          description="Login and session security settings"
          icon={Key}
          tooltip="Configure how users authenticate and manage their sessions"
        />
        
        <div className="space-y-2">
          <SettingRow 
            label="Multi-Factor Authentication" 
            description="Require 2FA for admin accounts"
            tooltip="Administrators must verify with a second factor when logging in"
            icon={Shield}
          >
            <Tooltip content="Enable MFA requirement for all admin users" position="left">
              <Switch defaultChecked />
            </Tooltip>
          </SettingRow>

          <SettingRow 
            label="Session Timeout" 
            description="Auto-logout after inactivity"
            tooltip="Users will be automatically logged out after this period of inactivity"
            icon={Clock}
          >
            <Select defaultValue="30">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow 
            label="Password Policy" 
            description="Minimum password requirements"
            tooltip="Users must create passwords meeting these minimum standards"
            icon={Lock}
          >
            <Select defaultValue="strong">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (8 chars)</SelectItem>
                <SelectItem value="medium">Medium (10 chars, mixed)</SelectItem>
                <SelectItem value="strong">Strong (12 chars, symbols)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="API Keys"
          description="Manage API access keys"
          icon={Key}
          tooltip="API keys for programmatic access to platform services"
        />
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">Production API Key</span>
                <Badge variant="success">Active</Badge>
              </div>
              <Tooltip content="Regenerate this key (invalidates old key)" position="left">
                <Button variant="ghost" size="sm" leftIcon={RefreshCw}>Regenerate</Button>
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value="sk_live_1234567890abcdef"
                  readOnly
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-400"
                />
              </div>
              <Tooltip content={showPassword ? "Hide key" : "Show key"} position="bottom">
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Tooltip>
              <Tooltip content={copied ? "Copied!" : "Copy to clipboard"} position="bottom">
                <button 
                  onClick={copyApiKey}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </Tooltip>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              Created: Dec 1, 2024 • Last used: 2 hours ago
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Need a new key for a specific service?
            </p>
            <Tooltip content="Create additional API keys with custom permissions" position="bottom">
              <Button size="sm" leftIcon={Key}>Create New Key</Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader 
            title="Security Audit Log"
            description="Recent security-related events"
            icon={FileText}
            tooltip="Log of all security events and configuration changes"
          />
          <Tooltip content="View complete audit history" position="bottom">
            <Button variant="ghost" size="sm" leftIcon={ExternalLink}>View All</Button>
          </Tooltip>
        </div>
        
        <div className="space-y-2">
          {[
            { action: "Password policy updated", user: "Admin", time: "2 hours ago", type: "config" },
            { action: "API key regenerated", user: "System", time: "1 day ago", type: "security" },
            { action: "MFA enabled for admin", user: "Admin", time: "3 days ago", type: "security" },
            { action: "Session timeout changed", user: "Admin", time: "1 week ago", type: "config" },
          ].map((event, i) => (
            <Tooltip 
              key={i}
              content={`${event.type === "security" ? "Security event" : "Configuration change"}: ${event.action}`}
              position="top"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-help transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    event.type === "security" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {event.type === "security" ? <Shield className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{event.action}</p>
                    <p className="text-xs text-slate-500">by {event.user}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{event.time}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [channels, setChannels] = useState({
    email: true,
    push: false,
    slack: true,
  });

  const [events, setEvents] = useState({
    newUser: true,
    paymentFailed: true,
    highLatency: true,
    securityAlert: true,
    dailyReport: false,
  });

  return (
    <div className="space-y-6">
      {/* Channels */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Notification Channels"
          description="Configure how you receive alerts"
          icon={Bell}
          tooltip="Choose which methods are used to deliver notifications"
        />
        
        <div className="space-y-2">
          <SettingRow 
            label="Email Notifications" 
            description="Send alerts to admin email"
            tooltip="Notifications will be sent to the configured admin email address"
            icon={Mail}
          >
            <Tooltip content={channels.email ? "Disable email notifications" : "Enable email notifications"} position="left">
              <Switch checked={channels.email} onCheckedChange={(v) => setChannels(c => ({ ...c, email: v }))} />
            </Tooltip>
          </SettingRow>

          <SettingRow 
            label="Push Notifications" 
            description="Browser push notifications"
            tooltip="Receive real-time notifications in your browser"
            icon={Zap}
          >
            <Tooltip content="Enable browser push notifications" position="left">
              <Switch checked={channels.push} onCheckedChange={(v) => setChannels(c => ({ ...c, push: v }))} />
            </Tooltip>
          </SettingRow>

          <SettingRow 
            label="Slack Integration" 
            description="Send alerts to Slack channel"
            tooltip="Notifications will be posted to your configured Slack channel"
            icon={Layers}
          >
            <Tooltip content="Enable Slack notifications (configure webhook first)" position="left">
              <Switch checked={channels.slack} onCheckedChange={(v) => setChannels(c => ({ ...c, slack: v }))} />
            </Tooltip>
          </SettingRow>
        </div>
      </div>

      {/* Event Subscriptions */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Event Subscriptions"
          description="Choose which events trigger notifications"
          icon={Bell}
          tooltip="Select which system events should send you alerts"
        />
        
        <div className="space-y-2">
          {[
            { key: "newUser", label: "New User Registration", desc: "When a new user signs up", icon: UserCircle },
            { key: "paymentFailed", label: "Payment Failed", desc: "When subscription payment fails", icon: CreditCard },
            { key: "highLatency", label: "High Latency Alert", desc: "When service latency exceeds threshold", icon: Zap },
            { key: "securityAlert", label: "Security Alert", desc: "Failed logins, suspicious activity", icon: Shield },
            { key: "dailyReport", label: "Daily Summary Report", desc: "Daily metrics and statistics", icon: FileText },
          ].map((event) => (
            <SettingRow 
              key={event.key}
              label={event.label} 
              description={event.desc}
              tooltip={`Notify me when ${event.label.toLowerCase()} occurs`}
              icon={event.icon}
            >
              <Switch 
                checked={events[event.key as keyof typeof events]} 
                onCheckedChange={(v) => setEvents(e => ({ ...e, [event.key]: v }))} 
              />
            </SettingRow>
          ))}
        </div>
      </div>

      {/* Email Templates */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader 
            title="Email Templates"
            description="Customize notification emails"
            icon={Mail}
            tooltip="Edit the content and style of automated emails"
          />
          <Tooltip content="Preview all email templates" position="bottom">
            <Button variant="ghost" size="sm" leftIcon={Eye}>Preview</Button>
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Welcome Email", type: "User Onboarding" },
            { name: "Password Reset", type: "Security" },
            { name: "Payment Receipt", type: "Billing" },
            { name: "Account Suspended", type: "Admin" },
          ].map((template) => (
            <Tooltip 
              key={template.name}
              content={`Edit ${template.name} template - ${template.type}`}
              position="top"
            >
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{template.name}</p>
                    <p className="text-xs text-slate-500">{template.type}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("amber");

  const colors = [
    { name: "Amber", value: "amber", color: "bg-amber-500" },
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Emerald", value: "emerald", color: "bg-emerald-500" },
    { name: "Violet", value: "violet", color: "bg-violet-500" },
    { name: "Rose", value: "rose", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Theme"
          description="Choose your preferred appearance"
          icon={Moon}
          tooltip="Select light or dark mode for the admin panel"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Tooltip content="Use system preference for light/dark mode" position="top">
            <button 
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === "system" ? "border-amber-500 bg-amber-500/10" : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center mb-3">
                <LayoutGrid className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-medium text-slate-200">System</p>
              <p className="text-xs text-slate-500">Follows device settings</p>
            </button>
          </Tooltip>

          <Tooltip content="Always use dark mode for better low-light viewing" position="top">
            <button 
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === "dark" ? "border-amber-500 bg-amber-500/10" : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center mb-3">
                <Moon className="w-5 h-5 text-slate-300" />
              </div>
              <p className="font-medium text-slate-200">Dark</p>
              <p className="text-xs text-slate-500">Easy on the eyes</p>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Accent Color */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Accent Color"
          description="Primary brand color for buttons and highlights"
          icon={Zap}
          tooltip="Change the primary accent color used throughout the UI"
        />
        
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <Tooltip key={c.value} content={`Use ${c.name} as accent color`} position="top">
              <button
                onClick={() => setAccentColor(c.value)}
                className={`w-12 h-12 rounded-xl ${c.color} transition-all ${
                  accentColor === c.value ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110" : "hover:scale-105"
                }`}
              />
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Branding"
          description="Customize platform branding"
          icon={Image}
          tooltip="Upload custom logos and configure brand appearance"
        />
        
        <div className="space-y-6">
          <div>
            <Tooltip content="Upload your organization logo (PNG or SVG, max 2MB)" position="top">
              <label className="block text-sm font-medium text-slate-200 mb-2 cursor-help">
                Organization Logo
              </label>
            </Tooltip>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Image className="w-8 h-8 text-slate-500" />
              </div>
              <div className="flex gap-2">
                <Tooltip content="Upload new logo image" position="bottom">
                  <Button size="sm" leftIcon={Upload}>Upload</Button>
                </Tooltip>
                <Tooltip content="Remove current logo" position="bottom">
                  <Button size="sm" variant="ghost" leftIcon={Trash2} className="text-rose-400 hover:text-rose-300">
                    Remove
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          <div>
            <Tooltip content="Upload favicon for browser tabs (ICO or PNG)" position="top">
              <label className="block text-sm font-medium text-slate-200 mb-2 cursor-help">
                Favicon
              </label>
            </Tooltip>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700" />
              <Button size="sm" variant="ghost" leftIcon={Upload}>Change</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  const integrations = [
    { name: "Stripe", icon: CreditCard, status: "connected", desc: "Payment processing" },
    { name: "SendGrid", icon: Mail, status: "connected", desc: "Email delivery" },
    { name: "Slack", icon: Layers, status: "configured", desc: "Team notifications" },
    { name: "AWS S3", icon: Database, status: "not_configured", desc: "File storage" },
  ];

  return (
    <div className="space-y-6">
      {/* Connected Services */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Connected Services"
          description="Third-party integrations and API connections"
          icon={Layers}
          tooltip="Manage connections to external services and APIs"
        />
        
        <div className="grid gap-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Tooltip 
                key={integration.name}
                content={`${integration.name}: ${integration.status === "connected" ? "Active and working" : integration.status === "configured" ? "Configured but not tested" : "Not yet set up"}`}
                position="top"
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{integration.name}</p>
                      <p className="text-xs text-slate-500">{integration.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      integration.status === "connected" ? "success" : 
                      integration.status === "configured" ? "warning" : "secondary"
                    }>
                      {integration.status.replace("_", " ")}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Webhooks */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader 
            title="Webhooks"
            description="Configure webhook endpoints"
            icon={Globe}
            tooltip="Receive real-time events via HTTP POST to your endpoints"
          />
          <Tooltip content="Create a new webhook endpoint" position="bottom">
            <Button size="sm" leftIcon={Zap}>Add Webhook</Button>
          </Tooltip>
        </div>
        
        <div className="space-y-3">
          {[
            { url: "https://api.example.com/webhooks/payments", events: ["payment.success", "payment.failed"], active: true },
            { url: "https://api.example.com/webhooks/users", events: ["user.created", "user.deleted"], active: true },
          ].map((webhook, i) => (
            <Tooltip 
              key={i}
              content={`Receives: ${webhook.events.join(", ")}`}
              position="top"
            >
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-help">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${webhook.active ? "bg-emerald-500" : "bg-slate-500"}`} />
                    <code className="text-sm text-slate-300">{webhook.url}</code>
                  </div>
                  <Tooltip content="Edit webhook configuration" position="left">
                    <Button variant="ghost" size="sm">Configure</Button>
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 ml-5">
                  {webhook.events.map((e) => (
                    <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                  ))}
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      {/* Payment Gateway */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Payment Gateway"
          description="Configure payment processing"
          icon={CreditCard}
          tooltip="Set up and manage your payment processor integration"
        />
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Stripe</p>
                  <p className="text-xs text-slate-500">Connected • Payments active</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>

          <SettingRow 
            label="Test Mode" 
            description="Use test keys for transactions"
            tooltip="When enabled, all transactions use Stripe test environment"
            icon={Shield}
          >
            <Tooltip content="Toggle between test and live payment mode" position="left">
              <Switch />
            </Tooltip>
          </SettingRow>

          <SettingRow 
            label="Auto-invoice" 
            description="Generate invoices automatically"
            tooltip="Automatically create PDF invoices for successful payments"
            icon={FileText}
          >
            <Tooltip content="Enable automatic invoice generation" position="left">
              <Switch defaultChecked />
            </Tooltip>
          </SettingRow>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Tax Settings"
          description="Configure tax rates and regions"
          icon={Globe}
          tooltip="Set up tax rates for different regions and jurisdictions"
        />
        
        <div className="space-y-4">
          <SettingRow 
            label="Enable Tax" 
            description="Apply tax to all transactions"
            tooltip="When enabled, configured tax rates will be applied to subscriptions"
            icon={Globe}
          >
            <Tooltip content="Enable tax calculation on all payments" position="left">
              <Switch />
            </Tooltip>
          </SettingRow>

          <SettingRow 
            label="Default Tax Rate" 
            description="Applied when no specific rate exists"
            tooltip="This percentage will be used for regions without specific tax rates"
            icon={Zap}
          >
            <div className="relative w-32">
              <Input 
                type="number" 
                defaultValue="18"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Currency */}
      <div className="glass-card p-6">
        <SectionHeader 
          title="Currency"
          description="Default currency for pricing"
          icon={Globe}
          tooltip="Primary currency used for all billing and subscriptions"
        />
        
        <SettingRow 
          label="Default Currency" 
          description="Used for all prices and billing"
          tooltip="All prices will be displayed in this currency"
          icon={CreditCard}
        >
          <Select defaultValue="INR">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
              <SelectItem value="USD">US Dollar ($)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="GBP">British Pound (£)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </div>
    </div>
  );
}

// Main Settings Page
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");

  const ActiveComponent = {
    general: GeneralSettings,
    security: SecuritySettings,
    notifications: NotificationSettings,
    appearance: AppearanceSettings,
    integrations: IntegrationsSettings,
    billing: BillingSettings,
  }[activeSection] || GeneralSettings;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="lg:w-64 shrink-0">
        <div className="glass-card p-2 sticky top-6">
          <div className="flex items-center gap-2 mb-4 px-3">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h1 className="font-semibold text-slate-100">Settings</h1>
          </div>
          
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Tooltip 
                  key={section.id}
                  content={section.tooltip}
                  position="right"
                >
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-help ${
                      isActive 
                        ? "bg-amber-500 text-slate-900" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : ""}`} />
                    {section.label}
                  </button>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Help Card */}
        <div className="glass-card p-4 mt-4 sticky top-[calc(100%+1rem)]">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-200">Need Help?</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Learn about configuration options and best practices.
          </p>
          <Tooltip content="Open settings documentation" position="bottom">
            <a 
              href="#"
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              View Documentation
            </a>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        }>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
}

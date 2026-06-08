"use client";

import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Settings, Bell, Shield, Server, Save, Upload, Globe, Clock, Lock, Mail, Smartphone, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const SETTINGS_KEY = "ctms_settings";

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "system", label: "System", icon: Server },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-[#3B4252]" : "bg-gray-300"
      )}
    >
      <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", enabled ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4252] appearance-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function loadSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSettings(settings: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [companyName, setCompanyName] = useState("CTMS Corp");
  const [timezone, setTimezone] = useState("UTC-5 (Eastern Time)");
  const [language, setLanguage] = useState("English");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(true);
  const [ticketAssigned, setTicketAssigned] = useState(true);
  const [slaWarning, setSlaWarning] = useState(true);
  const [slaBreach, setSlaBreach] = useState(true);
  const [minLength, setMinLength] = useState("8");
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      if (saved.companyName !== undefined) setCompanyName(saved.companyName);
      if (saved.timezone !== undefined) setTimezone(saved.timezone);
      if (saved.language !== undefined) setLanguage(saved.language);
      if (saved.emailEnabled !== undefined) setEmailEnabled(saved.emailEnabled);
      if (saved.smsEnabled !== undefined) setSmsEnabled(saved.smsEnabled);
      if (saved.whatsappEnabled !== undefined) setWhatsappEnabled(saved.whatsappEnabled);
      if (saved.ticketCreated !== undefined) setTicketCreated(saved.ticketCreated);
      if (saved.ticketAssigned !== undefined) setTicketAssigned(saved.ticketAssigned);
      if (saved.slaWarning !== undefined) setSlaWarning(saved.slaWarning);
      if (saved.slaBreach !== undefined) setSlaBreach(saved.slaBreach);
      if (saved.minLength !== undefined) setMinLength(saved.minLength);
      if (saved.requireUppercase !== undefined) setRequireUppercase(saved.requireUppercase);
      if (saved.requireNumbers !== undefined) setRequireNumbers(saved.requireNumbers);
      if (saved.mfaEnabled !== undefined) setMfaEnabled(saved.mfaEnabled);
      if (saved.sessionTimeout !== undefined) setSessionTimeout(saved.sessionTimeout);
      if (saved.backupEnabled !== undefined) setBackupEnabled(saved.backupEnabled);
      if (saved.backupFrequency !== undefined) setBackupFrequency(saved.backupFrequency);
      if (saved.maintenanceMode !== undefined) setMaintenanceMode(saved.maintenanceMode);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      saveSettings({
        companyName, timezone, language,
        emailEnabled, smsEnabled, whatsappEnabled,
        ticketCreated, ticketAssigned, slaWarning, slaBreach,
        minLength, requireUppercase, requireNumbers,
        mfaEnabled, sessionTimeout,
        backupEnabled, backupFrequency, maintenanceMode,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        description="Configure system settings and preferences"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#3B4252] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E3544] transition-colors disabled:opacity-50"
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] overflow-hidden">
          <div className="flex border-b border-[#D8DDE3]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.id
                      ? "border-[#3B4252] text-[#3B4252]"
                      : "border-transparent text-[#6B7280] hover:text-[#1F2937] hover:border-[#D8DDE3]"
                  )}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "general" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
                <motion.div variants={item}>
                  <InputField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Enter company name" />
                </motion.div>
                <motion.div variants={item}>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Company Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[#F4F6F8] border border-[#D8DDE3] flex items-center justify-center">
                      <Upload size={20} className="text-[#6B7280]" />
                    </div>
                    <button className="px-4 py-2 border border-[#D8DDE3] rounded-lg text-sm font-medium text-[#3B4252] hover:bg-[#F4F6F8] transition-colors">
                      Upload Logo
                    </button>
                  </div>
                </motion.div>
                <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Timezone" value={timezone} onChange={setTimezone} options={["UTC-5 (Eastern Time)", "UTC-6 (Central Time)", "UTC-7 (Mountain Time)", "UTC-8 (Pacific Time)", "UTC+0 (GMT)"]} />
                  <SelectField label="Language" value={language} onChange={setLanguage} options={["English", "Spanish", "French", "German", "Chinese"]} />
                </motion.div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Globe size={16} /> Notification Channels</h4>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-[#6B7280]" />
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">Email Notifications</p>
                          <p className="text-xs text-[#6B7280]">Send notifications via email</p>
                        </div>
                      </div>
                      <Toggle enabled={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className="text-[#6B7280]" />
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">SMS Notifications</p>
                          <p className="text-xs text-[#6B7280]">Send notifications via SMS</p>
                        </div>
                      </div>
                      <Toggle enabled={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare size={18} className="text-[#6B7280]" />
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">WhatsApp Notifications</p>
                          <p className="text-xs text-[#6B7280]">Send notifications via WhatsApp</p>
                        </div>
                      </div>
                      <Toggle enabled={whatsappEnabled} onChange={() => setWhatsappEnabled(!whatsappEnabled)} />
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Bell size={16} /> Event Notifications</h4>
                  <div className="space-y-3 pl-6">
                    {[
                      { label: "Ticket Created", desc: "When a new ticket is created", enabled: ticketCreated, onChange: () => setTicketCreated(!ticketCreated) },
                      { label: "Ticket Assigned", desc: "When a ticket is assigned to you", enabled: ticketAssigned, onChange: () => setTicketAssigned(!ticketAssigned) },
                      { label: "SLA Warning", desc: "When a ticket approaches SLA deadline", enabled: slaWarning, onChange: () => setSlaWarning(!slaWarning) },
                      { label: "SLA Breach", desc: "When a ticket breaches SLA", enabled: slaBreach, onChange: () => setSlaBreach(!slaBreach) },
                    ].map((n) => (
                      <div key={n.label} className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">{n.label}</p>
                          <p className="text-xs text-[#6B7280]">{n.desc}</p>
                        </div>
                        <Toggle enabled={n.enabled} onChange={n.onChange} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Lock size={16} /> Password Policy</h4>
                  <div className="space-y-4 pl-6">
                    <InputField label="Minimum Password Length" value={minLength} onChange={setMinLength} type="number" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#1F2937]">Require uppercase letters</span>
                        <Toggle enabled={requireUppercase} onChange={() => setRequireUppercase(!requireUppercase)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#1F2937]">Require numbers</span>
                        <Toggle enabled={requireNumbers} onChange={() => setRequireNumbers(!requireNumbers)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Shield size={16} /> Multi-Factor Authentication</h4>
                  <div className="pl-6">
                    <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">Enable MFA</p>
                        <p className="text-xs text-[#6B7280]">Require two-factor authentication for all users</p>
                      </div>
                      <Toggle enabled={mfaEnabled} onChange={() => setMfaEnabled(!mfaEnabled)} />
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Clock size={16} /> Session Management</h4>
                  <div className="pl-6">
                    <SelectField label="Session Timeout (minutes)" value={sessionTimeout} onChange={setSessionTimeout} options={["15", "30", "60", "120", "240"]} />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "system" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><Server size={16} /> Backup Settings</h4>
                  <div className="space-y-4 pl-6">
                    <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">Automatic Backup</p>
                        <p className="text-xs text-[#6B7280]">Enable automatic system backups</p>
                      </div>
                      <Toggle enabled={backupEnabled} onChange={() => setBackupEnabled(!backupEnabled)} />
                    </div>
                    {backupEnabled && (
                      <SelectField label="Backup Frequency" value={backupFrequency} onChange={setBackupFrequency} options={["Hourly", "Daily", "Weekly", "Monthly"]} />
                    )}
                  </div>
                </motion.div>
                <motion.div variants={item}>
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Maintenance</h4>
                  <div className="pl-6">
                    <div className="flex items-center justify-between p-3 bg-[#F4F6F8] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">Maintenance Mode</p>
                        <p className="text-xs text-[#6B7280]">Temporarily disable system access for maintenance</p>
                      </div>
                      <Toggle enabled={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                    </div>
                    {maintenanceMode && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">System is in maintenance mode. Only administrators can access the system.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}

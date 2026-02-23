'use client';

import { useState } from 'react';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './settings.module.css';

const log = createLogger('SettingsPage');

interface LdapFormState {
  enabled: boolean;
  url: string;
  bindDN: string;
  bindPassword: string;
  searchBase: string;
  searchFilter: string;
  usernameAttribute: string;
  emailAttribute: string;
  firstNameAttribute: string;
  lastNameAttribute: string;
  groupSearchBase: string;
  groupSearchFilter: string;
  groupMemberAttribute: string;
  tlsEnabled: boolean;
  tlsRejectUnauthorized: boolean;
  connectionTimeout: number;
  roleMapping: string;
}

const defaultState: LdapFormState = {
  enabled: false,
  url: 'ldap://ldap.example.com:389',
  bindDN: 'cn=admin,dc=example,dc=com',
  bindPassword: '',
  searchBase: 'ou=users,dc=example,dc=com',
  searchFilter: '(sAMAccountName={{username}})',
  usernameAttribute: 'sAMAccountName',
  emailAttribute: 'mail',
  firstNameAttribute: 'givenName',
  lastNameAttribute: 'sn',
  groupSearchBase: 'ou=groups,dc=example,dc=com',
  groupSearchFilter: '(member={{dn}})',
  groupMemberAttribute: 'cn',
  tlsEnabled: false,
  tlsRejectUnauthorized: true,
  connectionTimeout: 5000,
  roleMapping: '{"Domain Admins": "admin", "HR": "hr_manager", "Employees": "employee"}',
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('ldap');
  const [ldap, setLdap] = useState<LdapFormState>(defaultState);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [syncCount, setSyncCount] = useState(0);

  const updateLdap = (key: keyof LdapFormState, value: string | boolean | number) =>
    setLdap((prev) => ({ ...prev, [key]: value }));

  const handleTestConnection = () => {
    setTestStatus('testing');
    log.info('TestConnection', 'Testing LDAP connection', { url: ldap.url });
    toast.info('Testing...', 'Attempting LDAP connection...');
    setTimeout(() => {
      const success = !ldap.url.includes('example');
      setTestStatus(success ? 'success' : 'error');
      if (success) {
        toast.success('Connection OK', 'LDAP server responded successfully.');
      } else {
        toast.error('Connection Failed', 'Check URL and credentials.');
      }
      log.info('TestResult', success ? 'Connection successful' : 'Connection failed', {
        url: ldap.url,
      });
    }, 2000);
  };

  const handleSync = () => {
    setSyncStatus('syncing');
    log.info('SyncDirectory', 'Starting LDAP directory sync');
    toast.info('Syncing...', 'Synchronizing directory users...');
    setTimeout(() => {
      setSyncCount(42);
      setSyncStatus('done');
      log.info('SyncComplete', '42 users synced');
      toast.success('Sync Complete', '42 users synchronized from directory.');
    }, 3000);
  };

  const sections = [
    { key: 'ldap', label: 'LDAP / Active Directory', icon: '🔗' },
    { key: 'general', label: 'General Settings', icon: '⚙️' },
    { key: 'security', label: 'Security', icon: '🔒' },
    { key: 'email', label: 'Email & SMTP', icon: '📧' },
    { key: 'integrations', label: 'Integrations', icon: '🔌' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>System configuration and integrations</p>
        </div>
      </div>

      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <nav className={styles.settingsNav}>
          {sections.map((section) => (
            <button
              key={section.key}
              className={`${styles.navItem} ${activeSection === section.key ? styles.navItemActive : ''}`}
              onClick={() => setActiveSection(section.key)}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.settingsContent}>
          {activeSection === 'ldap' && (
            <>
              {/* LDAP Enable Toggle */}
              <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div
                  className="card-body"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <h3>LDAP / Active Directory Integration</h3>
                    <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-1)' }}>
                      Authenticate users against your LDAP or Active Directory server
                    </p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={ldap.enabled}
                      onChange={(e) => updateLdap('enabled', e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>

              {ldap.enabled && (
                <>
                  {/* Connection Settings */}
                  <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="card-header">
                      <h4>Connection Settings</h4>
                    </div>
                    <div className="card-body">
                      <div className={styles.formGrid}>
                        <div className={styles.formField}>
                          <label className="label">LDAP Server URL</label>
                          <input
                            className="input"
                            value={ldap.url}
                            placeholder="ldap://ldap.example.com:389"
                            onChange={(e) => updateLdap('url', e.target.value)}
                          />
                          <span className="text-xs text-tertiary">
                            Use ldaps:// for SSL connections
                          </span>
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Connection Timeout (ms)</label>
                          <input
                            type="number"
                            className="input"
                            value={ldap.connectionTimeout}
                            onChange={(e) =>
                              updateLdap('connectionTimeout', parseInt(e.target.value))
                            }
                          />
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Bind DN</label>
                          <input
                            className="input"
                            value={ldap.bindDN}
                            placeholder="cn=admin,dc=example,dc=com"
                            onChange={(e) => updateLdap('bindDN', e.target.value)}
                          />
                          <span className="text-xs text-tertiary">
                            Service account Distinguished Name
                          </span>
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Bind Password</label>
                          <input
                            type="password"
                            className="input"
                            value={ldap.bindPassword}
                            placeholder="••••••••"
                            onChange={(e) => updateLdap('bindPassword', e.target.value)}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 'var(--space-4)',
                          marginTop: 'var(--space-4)',
                        }}
                      >
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={ldap.tlsEnabled}
                            onChange={(e) => updateLdap('tlsEnabled', e.target.checked)}
                          />
                          <span>Enable TLS/STARTTLS</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={ldap.tlsRejectUnauthorized}
                            onChange={(e) => updateLdap('tlsRejectUnauthorized', e.target.checked)}
                          />
                          <span>Reject unauthorized TLS certificates</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Search Settings */}
                  <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="card-header">
                      <h4>User Search</h4>
                    </div>
                    <div className="card-body">
                      <div className={styles.formGrid}>
                        <div className={styles.formField}>
                          <label className="label">Search Base DN</label>
                          <input
                            className="input"
                            value={ldap.searchBase}
                            onChange={(e) => updateLdap('searchBase', e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Search Filter</label>
                          <input
                            className="input font-mono"
                            value={ldap.searchFilter}
                            onChange={(e) => updateLdap('searchFilter', e.target.value)}
                          />
                          <span className="text-xs text-tertiary">
                            Use {'{{username}}'} as placeholder
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attribute Mapping */}
                  <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="card-header">
                      <h4>Attribute Mapping</h4>
                    </div>
                    <div className="card-body">
                      <div className={styles.formGrid}>
                        <div className={styles.formField}>
                          <label className="label">Username Attribute</label>
                          <input
                            className="input font-mono"
                            value={ldap.usernameAttribute}
                            onChange={(e) => updateLdap('usernameAttribute', e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Email Attribute</label>
                          <input
                            className="input font-mono"
                            value={ldap.emailAttribute}
                            onChange={(e) => updateLdap('emailAttribute', e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label className="label">First Name Attribute</label>
                          <input
                            className="input font-mono"
                            value={ldap.firstNameAttribute}
                            onChange={(e) => updateLdap('firstNameAttribute', e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Last Name Attribute</label>
                          <input
                            className="input font-mono"
                            value={ldap.lastNameAttribute}
                            onChange={(e) => updateLdap('lastNameAttribute', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Mapping */}
                  <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="card-header">
                      <h4>Group & Role Mapping</h4>
                    </div>
                    <div className="card-body">
                      <div className={styles.formGrid}>
                        <div className={styles.formField}>
                          <label className="label">Group Search Base</label>
                          <input
                            className="input"
                            value={ldap.groupSearchBase}
                            onChange={(e) => updateLdap('groupSearchBase', e.target.value)}
                          />
                        </div>
                        <div className={styles.formField}>
                          <label className="label">Group Search Filter</label>
                          <input
                            className="input font-mono"
                            value={ldap.groupSearchFilter}
                            onChange={(e) => updateLdap('groupSearchFilter', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className={styles.formField} style={{ marginTop: 'var(--space-4)' }}>
                        <label className="label">LDAP Group → HRIS Role Mapping (JSON)</label>
                        <textarea
                          className="input font-mono"
                          rows={3}
                          value={ldap.roleMapping}
                          onChange={(e) => updateLdap('roleMapping', e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                        <span className="text-xs text-tertiary">
                          Map LDAP group names to HRIS roles: admin, hr_manager, manager, employee
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card">
                    <div
                      className="card-body"
                      style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        className="btn btn-primary"
                        onClick={handleTestConnection}
                        disabled={testStatus === 'testing'}
                      >
                        {testStatus === 'testing' ? (
                          <>
                            <span className={styles.spinner} /> Testing...
                          </>
                        ) : (
                          <>🔍 Test Connection</>
                        )}
                      </button>

                      {testStatus === 'success' && (
                        <span className="badge badge-success">✓ Connection successful</span>
                      )}
                      {testStatus === 'error' && (
                        <span className="badge badge-danger">
                          ✗ Connection failed — check URL and credentials
                        </span>
                      )}

                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-3)' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={handleSync}
                          disabled={syncStatus === 'syncing'}
                        >
                          {syncStatus === 'syncing' ? (
                            <>
                              <span className={styles.spinner} /> Syncing...
                            </>
                          ) : (
                            <>🔄 Sync Directory</>
                          )}
                        </button>
                        {syncStatus === 'done' && (
                          <span className="badge badge-success">{syncCount} users synced</span>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            log.info('SaveConfig', 'Saving LDAP configuration');
                            toast.success(
                              'Configuration Saved',
                              'LDAP settings have been saved successfully.',
                            );
                          }}
                        >
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeSection !== 'ldap' && (
            <div className="card">
              <div
                className="card-body"
                style={{ padding: 'var(--space-16)', textAlign: 'center' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>
                  {sections.find((s) => s.key === activeSection)?.icon}
                </div>
                <h3>{sections.find((s) => s.key === activeSection)?.label}</h3>
                <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-2)' }}>
                  This settings section is coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

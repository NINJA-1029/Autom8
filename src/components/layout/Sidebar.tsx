import React from 'react';
import { 
  BookOpen, 
  Settings as SettingsIcon, 
  Cpu, 
  HelpCircle, 
  Sparkles, 
  TrendingUp, 
  LayoutDashboard,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedModuleId: string | null;
  onSelectModule: (id: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  selectedModuleId,
  onSelectModule,
  theme,
  toggleTheme
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learn', label: 'Learn Modules', icon: BookOpen },
    { id: 'simulators', label: 'Simulators', icon: Cpu },
    { id: 'practice', label: 'Practice & Quiz', icon: HelpCircle },
    { id: 'ai-tutor', label: 'AI Tutor', icon: Sparkles },
    { id: 'progress', label: 'My Progress', icon: TrendingUp }
  ];

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-color), #818cf8)',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          A
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Automata</h1>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Academy v1.0</span>
        </div>
      </div>

      {/* Menu Navigation */}
      <div style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                onSelectModule(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Theme Toggle & Footer */}
      <div style={{
        padding: '20px 16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};

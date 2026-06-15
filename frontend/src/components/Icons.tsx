import React from 'react';

interface IconProps {
  size?: number;
  children?: React.ReactNode;
}

const LIcon: React.FC<IconProps> = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'block', flexShrink: 0 }}>
    {children}
  </svg>
);

export const LIconInbox: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></LIcon>;
export const LIconBox: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></LIcon>;
export const LIconMap: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/></LIcon>;
export const LIconGauge: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></LIcon>;
export const LIconUsers: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></LIcon>;
export const LIconSettings: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></LIcon>;
export const LIconSearch: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></LIcon>;
export const LIconPlus: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M5 12h14M12 5v14"/></LIcon>;
export const LIconRefresh: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></LIcon>;
export const LIconCheck: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M20 6 9 17l-5-5"/></LIcon>;
export const LIconShield: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></LIcon>;
export const LIconClose: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M18 6 6 18"/><path d="M6 6l12 12"/></LIcon>;
export const LIconEdit: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></LIcon>;
export const LIconTrash: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></LIcon>;
export const LIconAlert: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></LIcon>;
export const LIconClock: React.FC<Omit<IconProps, 'children'>> = (p) => <LIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></LIcon>;

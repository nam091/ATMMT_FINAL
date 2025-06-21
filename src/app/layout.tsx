import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'RoleAccess App',
  description: 'Application for managing roles with Keycloak integration.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Ngăn chặn lỗi khi định nghĩa lại custom element
              if (typeof window !== 'undefined' && window.customElements) {
                const originalDefine = window.customElements.define;
                window.customElements.define = function(name, constructor, options) {
                  if (customElements.get(name)) {
                    console.warn(\`Custom element with name '\${name}' has already been defined. Skipping definition.\`);
                    return;
                  }
                  return originalDefine.call(this, name, constructor, options);
                };
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <ClientLayoutWrapper>
        {children}
        </ClientLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Model Studio",
  description: "Test saree & dress image generation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen">{children}</body>
    </html>
  );
}

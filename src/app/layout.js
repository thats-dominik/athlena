import "./styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <title>Athlena</title>
      </head>
      <body>{children}</body>
    </html>
  );
}

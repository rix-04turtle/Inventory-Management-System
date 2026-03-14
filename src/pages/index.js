import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Welcome to Inventory Management System
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Please select your role to continue
          </p>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
            <a
              href="/user/signUp?role=ADMIN"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              ADMIN
            </a>
            <a
              href="/user/signUp?role=RETAILER"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              RETAILER
            </a>
            <a
              href="/user/signUp?role=CUSTOMER"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              CUSTOMER
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

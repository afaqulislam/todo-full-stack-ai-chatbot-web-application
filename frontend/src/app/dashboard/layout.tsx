import React from "react";
import DashboardNavbar from "@/src/components/dashboard-navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            <DashboardNavbar />

            {/* main scroll container */}
            <main className="flex-1 overflow-y-auto pt-16 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

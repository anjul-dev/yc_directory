import Navbar from "@/components/Navbar";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="font-work-sans">
            <Navbar />

            {children}
            <SpeedInsights />
        </main>
    )
}
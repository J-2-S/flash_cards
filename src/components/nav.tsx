'use client'
import { ReactElement } from "react";
import { usePathname } from "next/navigation";

export default function NavMenu(): ReactElement {
   const pathname = usePathname();

   const linkClass = (path: string) =>
      pathname === path
         ? "bg-gray-900 text-white"
         : "text-gray-300 hover:bg-gray-700 hover:text-white";

   return (
      <nav className="bg-gray-800 text-white shadow-md px-4 h-screen w-64 flex flex-col justify-between py-6">
         {/* Top Section */}
         <ul className="flex flex-col gap-4 text-lg">
            <li>
               <a
                  href="/"
                  className={`block px-4 py-2 rounded-md shadow-md transition-all ${linkClass("/")}`}
               >
                  Home
               </a>
            </li>
            <li>
               <a
                  href="/about"
                  className={`block px-4 py-2 rounded-md shadow-md transition-all ${linkClass("/about")}`}
               >
                  About
               </a>
            </li>
         </ul>

         {/* Bottom Section */}
         <ul className="flex flex-col gap-4 text-lg">
            <li>
               <a
                  href="/settings"
                  className={`block px-4 py-2 rounded-md shadow-md transition-all ${linkClass("/settings")}`}
               >
                  Settings
               </a>
            </li>
         </ul>
      </nav>
   );
}


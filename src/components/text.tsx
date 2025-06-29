import { ReactElement, ReactNode } from "react";

type HeaderProps = {
   children: ReactNode;
};

export function Header({ children }: HeaderProps): ReactElement {
   return (
      <header className="bg-gradient-to-r from-pink-800 to-purple-800 text-white shadow-md py-6 px-4 rounded-b-lg">
         <div className="text-center text-3xl font-semibold tracking-wide drop-shadow">
            {children}
         </div>
      </header>
   );
}


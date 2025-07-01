import { CSSProperties, ReactElement, ReactNode } from "react";

type HeaderProps = {
   children: ReactNode;
};

export function Header({ children }: HeaderProps): ReactElement {
   return (
      <header className="bg-gradient-to-r from-pink-800 via-purple-800 to-pink-800 text-white shadow-md py-6 px-4 animated-gradient">
         <div className="text-center text-3xl font-semibold tracking-wide drop-shadow">
            <PrettyText size="xl">{children}</PrettyText>
         </div>
      </header>
   );
}

type PrettyTextProps = {
   children: ReactNode;
   size?: "sm" | "normal" | "lg" | "xl" | "2xl";
   style?: CSSProperties
};

export function PrettyText({ children, style, size = "normal" }: PrettyTextProps): ReactElement {
   const sizeClasses: Record<string, string> = {
      sm: "text-xl",
      normal: "text-3xl",
      lg: "text-4xl",
      xl: "text-5xl",
      "2xl": "text-6xl",
   };

   return (
      <h1
         className={`
        ${sizeClasses[size] || sizeClasses.normal}
        font-extrabold 
        uppercase 
        tracking-widest 
        text-white  
        drop-shadow-md
        select-none
      `}
         style={style}
      >
         {children}
      </h1>
   );
}


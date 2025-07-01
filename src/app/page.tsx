
import { Header, PrettyText } from "@/components/text";
import fs from "fs"
export default function Home() {
   const decks: string[] = []; // Temp data
   console.log(fs.readdirSync("."));
   return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
         <div className="shrink-0">
            <Header>Home</Header>
         </div>

         <div className="flex justify-center items-start flex-1 overflow-hidden p-6">
            <div className="w-full max-w-2xl h-full bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
               <div className="mb-4 shrink-0">
                  <PrettyText>Decks</PrettyText>
               </div>

               {/* Scrollable deck list, fills remaining vertical space */}
               <div className="overflow-y-auto flex-1 rounded-md border border-gray-700 bg-gray-700 p-4 space-y-4">
                  {decks.map((item, index) => (
                     <div
                        key={index}
                        className="bg-gray-600 rounded-md p-3 shadow hover:bg-gray-500 transition"
                     >
                        <PrettyText size="sm">{item}</PrettyText>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}


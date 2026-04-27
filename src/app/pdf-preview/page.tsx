import React from "react";
import { PremiumMenuTemplate } from "@/components/ui/PremiumMenuTemplate";

export const dynamic = "force-dynamic";

const mockItems = [
  { id: 1, category: "shake-mix", title: "Produto Principal", desc: "Descrição atraente do produto principal", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+1" },
  { id: 2, category: "casquinha", title: "Produto Clássico", desc: "Clássico que todos adoram", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+2" },
  { id: 3, category: "sundae", title: "Sobremesa Especial", desc: "Uma delícia refrescante", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+3" },
  { id: 4, category: "top-mix", title: "Produto Exclusivo", desc: "Sabor inconfundível", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+4" },
  { id: 5, category: "shake-mix", title: "Lançamento", desc: "A novidade do momento", img: "https://placehold.co/400x400/eeeeee/999999?text=Produto+5" }
];

export default function PDFPreview() {
  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center py-10">
      <div className="shadow-2xl">
        <PremiumMenuTemplate items={mockItems} />
      </div>
    </div>
  );
}

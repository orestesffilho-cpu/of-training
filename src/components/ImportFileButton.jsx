import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ImportFileButton({ label = "Importar arquivo" }) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  function handleFileClick() {
    // Alerta informativo: a leitura automatizada em nuvem proprietária foi substituída por inserção local
    toast.info("A importação direta por arquivo foi desativada. Use o botão 'Novo' para gerenciar seus dados locais com segurança.");
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl gap-1.5 opacity-60 hover:opacity-100"
        disabled={loading}
        onClick={handleFileClick}
      >
        <Upload className="h-4 w-4" />
        {label}
      </Button>
    </>
  );
}
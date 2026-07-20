import { PageHeader } from "@/components/page-header";
import { ComunicadosClient } from "@/components/comunicados/comunicados-client";
import { personasComunicados } from "@/data/comunicados-personas";

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Comunicados"
        subtitle="Genera comunicados de cumpleaños y aniversarios listos para pegar en correo"
        tags={["RH", "Marketing interno"]}
      />

      <ComunicadosClient personas={personasComunicados} />
    </div>
  );
}

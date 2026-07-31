import { PageHeader } from "@/components/page-header";
import { ComunicadosClient } from "@/components/comunicados/comunicados-client";
import { personasAniversarios } from "@/data/comunicados-personas-aniversarios";
import { personasCumpleanos } from "@/data/comunicados-personas-cumpleanos";

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Comunicados"
        subtitle="Genera comunicados de cumpleaños y aniversarios listos para pegar en correo"
        tags={["RH", "Marketing interno"]}
      />

      <ComunicadosClient
        personasCumpleanos={personasCumpleanos}
        personasAniversarios={personasAniversarios}
      />
    </div>
  );
}

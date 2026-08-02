import { redirect } from "next/navigation";
import { buildWhatsAppUrl } from "../../lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const nome = valueOf(params.nome);
  const data = valueOf(params.data);
  const ocasiao = valueOf(params.ocasiao);
  const origem = valueOf(params.origem) ?? "site";
  const mensagem = valueOf(params.mensagem);

  const parts = [
    mensagem || "Ola, quero consultar disponibilidade para um passeio privativo no Lago Paranoa.",
    nome ? `Nome: ${nome}` : null,
    data ? `Data desejada: ${data}` : null,
    ocasiao ? `Ocasiao: ${ocasiao}` : null,
    `Origem: ${origem}`,
  ].filter(Boolean);

  redirect(buildWhatsAppUrl(parts.join("\n")));
}

// SENIOR (2026-07-31, feedback do Alvaro: "as outras paginas estao sem
// personalidade"): restilizado pro mesmo padrao dark/neon da Home (campos
// escuros com borda sutil, botao solido neon) - a logica (GET pro /go/falar,
// que redireciona pro WhatsApp com os dados preenchidos) continua identica,
// so a casca visual mudou.
export function WhatsAppLeadForm() {
  return (
    <section
      aria-labelledby="lead-title"
      className="rounded-2xl border border-white/10 bg-abyss-card p-8 md:p-10"
    >
      <h3 id="lead-title" className="font-display text-2xl font-extrabold text-white">
        Consultar disponibilidade
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Envie as informações iniciais e continue a conversa pelo WhatsApp oficial.
      </p>

      <form action="/go/falar" method="get" className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="origem" value="formulario_site" />

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-bold text-white/70">Nome</span>
          <input
            name="nome"
            autoComplete="name"
            placeholder="Seu nome"
            className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/40 focus:border-neon"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-bold text-white/70">Data desejada</span>
          <input
            name="data"
            type="date"
            className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-neon [color-scheme:dark]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-bold text-white/70">Ocasião</span>
          <select
            name="ocasiao"
            defaultValue=""
            className="min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-white outline-none focus:border-neon [color-scheme:dark]"
          >
            <option value="" disabled>
              Selecione
            </option>
            <option>Aniversário</option>
            <option>Casal</option>
            <option>Família</option>
            <option>Pôr do sol</option>
            <option>Ensaio fotográfico</option>
            <option>Outro</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-bold text-white/70">Mensagem</span>
          <textarea
            name="mensagem"
            placeholder="Conte rapidamente o que você está planejando."
            rows={3}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-neon"
          />
        </label>

        <button
          type="submit"
          className="mt-2 min-h-13 rounded-full bg-neon text-sm font-extrabold uppercase tracking-widest text-abyss transition hover:scale-[1.02] hover:brightness-110"
        >
          Continuar no WhatsApp
        </button>

        <p className="text-xs text-white/45">
          O envio abre o WhatsApp. A próxima etapa da API registrará lead, origem e consentimento.
        </p>
      </form>
    </section>
  );
}

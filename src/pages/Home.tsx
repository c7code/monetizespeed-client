import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoWhite from '../assets/TUDO NO AZUL-06.png'; // Assuming this is a white/transparent logo

export default function Home() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden font-sans selection:bg-blue-500/30">
            {/* ===== NAVBAR ===== */}
            <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <img src={logoWhite} alt="Tudo no Azul" className="h-16 object-contain" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-zinc-400">
                        <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
                        <a href="#whatsapp" className="hover:text-white transition-colors">WhatsApp</a>
                        <a href="#agenda" className="hover:text-white transition-colors">Agenda</a>
                        <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-[14px] font-medium text-zinc-300 hover:text-white transition-colors">
                            Entrar
                        </Link>
                        <Link
                            to="/register"
                            className="text-[14px] font-semibold bg-blue-600 text-white rounded-lg px-5 py-2 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                        >
                            Começar agora
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Glow effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 -right-64 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                        {/* Text */}
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Novo: Integração WhatsApp
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
                                Controle financeiro simples com integração WhatsApp e agenda diária
                            </h1>

                            <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                                Centralize seus gastos, acompanhe metas e organize sua rotina em um só lugar. 
                                Registre despesas direto do WhatsApp e mantenha sua agenda sob controle.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center bg-blue-600 text-white rounded-lg px-8 py-3.5 text-base font-semibold hover:bg-blue-500 transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                                >
                                    Criar minha conta
                                </Link>
                                <a
                                    href="#recursos"
                                    className="inline-flex items-center justify-center bg-white/5 border border-white/10 text-white rounded-lg px-8 py-3.5 text-base font-medium hover:bg-white/10 transition-all"
                                >
                                    Ver recursos
                                </a>
                            </div>

                            <div className="mt-10 flex items-center gap-4 text-sm text-zinc-500 font-medium">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">M</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">C</div>
                                    <div className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                                </div>
                                <div>
                                    <p className="text-white font-semibold">+5.000 usuários ativos</p>
                                    <p className="text-xs">Crescendo diariamente</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Mockups */}
                        <div className="relative isolate">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-500/10 rounded-3xl blur-3xl -z-10" />
                            
                            <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-2xl relative z-10">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <p className="text-xs text-zinc-400 font-medium mb-1">Saldo</p>
                                        <p className="text-2xl font-bold text-blue-400">R$ 8.420,00</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <p className="text-xs text-zinc-400 font-medium mb-1">Gastos do mês</p>
                                        <p className="text-2xl font-bold text-white">R$ 3.275,00</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                    <p className="text-xs text-zinc-400 font-medium mb-4">Próximos compromissos</p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white font-medium">Consulta médica</span>
                                            <span className="text-blue-400">Hoje 16:00</span>
                                        </div>
                                        <div className="h-px w-full bg-white/5" />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-300">Reunião financeira</span>
                                            <span className="text-zinc-500">Amanhã 09:30</span>
                                        </div>
                                        <div className="h-px w-full bg-white/5" />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-300">Renovar seguro</span>
                                            <span className="text-zinc-500">Terça 14:00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== RECURSOS ===== */}
            <section id="recursos" className="py-24 border-t border-white/5 bg-[#09090b]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Recursos que aceleram sua organização</h2>
                    <p className="text-zinc-400 text-lg mb-16">Tudo que você precisa para dominar suas finanças.</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 text-left hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Registro de gastos</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Categorize despesas, defina limites e acompanhe gráficos de desempenho de forma automática.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 text-left hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Metas e alertas</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Crie metas mensais por categoria e receba alertas proativos ao se aproximar do limite estipulado.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 text-left hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
                            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Relatórios inteligentes</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Relatórios automáticos por período, categoria e conta. Totalmente exportáveis e fáceis de ler.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHATSAPP INTEGRAÇÃO ===== */}
            <section id="whatsapp" className="py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full px-4 py-1.5 mb-6">
                                💬 Integração WhatsApp
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
                                Integração com<br />WhatsApp
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                                Envie uma mensagem como "Almoço 35.90" e o gasto entra automaticamente no sistema. Responda com categorias, anexos e notas sem sair da conversa com nossa Inteligência Artificial.
                            </p>
                            <div className="flex gap-4">
                                <Link to="/register" className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-500 transition-colors">
                                    Conectar meu WhatsApp
                                </Link>
                                <a href="#agenda" className="bg-transparent border border-white/10 text-white rounded-lg px-6 py-3 font-medium hover:bg-white/5 transition-colors">
                                    Conhecer a agenda
                                </a>
                            </div>
                        </div>

                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <div className="bg-blue-600/20 border border-blue-500/20 text-zinc-200 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%]">
                                        <p>Almoço 35.90</p>
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 text-zinc-300 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[80%]">
                                        <p className="text-blue-400 font-medium mb-1">✓ Confirmado!</p>
                                        <p>Despesa de <strong>R$ 35,90</strong> registrada em <strong>Alimentação</strong>.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-blue-600/20 border border-blue-500/20 text-zinc-200 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%]">
                                        <p>Quanto eu gastei com alimentação?</p>
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/5 text-zinc-300 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[80%]">
                                        <p>Você gastou <strong>R$ 450,00</strong> com Alimentação este mês.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== AGENDA DIÁRIA ===== */}
            <section id="agenda" className="py-24 border-t border-white/5 bg-[#09090b]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Agenda diária integrada</h2>
                        <p className="text-zinc-400 text-lg">Compromissos, tarefas e lembretes conectados às suas finanças.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                            <h3 className="text-lg font-bold text-white mb-6">Próximos eventos</h3>
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium text-white">Revisão de orçamento</span>
                                    </div>
                                    <span className="text-xs text-zinc-500">Seg 10:00</span>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                        <span className="text-sm font-medium text-zinc-400">Reunião com contador</span>
                                    </div>
                                    <span className="text-xs text-zinc-500">Qua 15:30</span>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium text-white">Pagar fatura cartão</span>
                                    </div>
                                    <span className="text-xs text-zinc-500">Sex 12:00</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-white mb-8">Progresso semanal</h3>
                            
                            <div className="mb-8">
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-zinc-400">Tarefas concluídas</span>
                                    <span className="text-blue-400 font-bold">64%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[64%] rounded-full" />
                                </div>
                                <p className="text-xs text-zinc-500 mt-3 border-b border-white/5 pb-6">16 de 25 tarefas concluídas</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-zinc-400">Meta semanal</span>
                                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> No prazo</span>
                                </div>
                                <p className="text-3xl font-bold text-white">R$ 2.500</p>
                                <p className="text-xs text-zinc-500 mt-1">de R$ 3.000 planejados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== DEPOIMENTOS ===== */}
            <section id="depoimentos" className="py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">O que dizem nossos usuários</h2>
                        <p className="text-zinc-400 text-lg">Resultados práticos e rotina organizada.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">M</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Mariana Souza</h4>
                                    <p className="text-xs text-zinc-500">Empreendedora</p>
                                </div>
                            </div>
                            <div className="flex gap-1 text-yellow-500 mb-4 text-sm">
                                ★★★★★
                            </div>
                            <p className="text-zinc-400 text-sm italic leading-relaxed">
                                "Registro meus gastos pelo WhatsApp em segundos. Economia real todos os meses graças à visão geral do dashboard."
                            </p>
                        </div>
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">C</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Carlos Lima</h4>
                                    <p className="text-xs text-zinc-500">Autônomo</p>
                                </div>
                            </div>
                            <div className="flex gap-1 text-yellow-500 mb-4 text-sm">
                                ★★★★★
                            </div>
                            <p className="text-zinc-400 text-sm italic leading-relaxed">
                                "A agenda integrada me salvou de esquecer pagamentos importantes. Nunca mais paguei multas por atraso."
                            </p>
                        </div>
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">A</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Ana Pereira</h4>
                                    <p className="text-xs text-zinc-500">Analista Financeira</p>
                                </div>
                            </div>
                            <div className="flex gap-1 text-yellow-500 mb-4 text-sm">
                                ★★★★★
                            </div>
                            <p className="text-zinc-400 text-sm italic leading-relaxed">
                                "Relatórios claros, metas fáceis de acompanhar e integração sem esforço. A melhor ferramenta financeira que já usei."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section id="faq" className="py-24 border-t border-white/5 bg-[#09090b]/50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Perguntas frequentes</h2>
                        <p className="text-zinc-400 text-lg">Tire suas dúvidas sobre o Tudo no Azul.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Como funciona o registro de gastos pelo WhatsApp?", a: "Basta adicionar nosso número aos seus contatos e enviar uma mensagem com o valor e a descrição. Nossa Inteligência Artificial interpreta a mensagem e registra automaticamente na categoria correta." },
                            { q: "Posso definir limites de gastos por categoria?", a: "Sim! Você pode definir orçamentos mensais para alimentação, transporte, lazer e muito mais. O app avisa quando você estiver perto do limite." },
                            { q: "Os dados são seguros?", a: "Totalmente. Utilizamos criptografia de ponta a ponta e não compartilhamos seus dados financeiros com terceiros." },
                            { q: "Preciso instalar algum aplicativo?", a: "O Tudo no Azul é um Web App que você pode acessar pelo navegador, e nossa integração principal funciona diretamente no seu WhatsApp. Não há obrigação de instalar apps pesados." },
                            { q: "Quanto custa usar o Tudo no Azul?", a: "Oferecemos um plano gratuito com recursos essenciais e planos premium para quem busca recursos avançados de IA e relatórios ilimitados." }
                        ].map((item, i) => (
                            <div key={i} className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden transition-all">
                                <button 
                                    className="w-full px-6 py-5 flex justify-between items-center text-left text-white font-medium hover:bg-white/[0.02]"
                                    onClick={() => toggleFaq(i)}
                                >
                                    {item.q}
                                    <svg className={`w-5 h-5 text-zinc-500 transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="grid sm:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full px-3 py-1 mb-6">
                                    <span className="text-base">✨</span> Comece agora
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Comece em minutos</h2>
                                <p className="text-zinc-400 mb-8 leading-relaxed">Cadastre-se e conecte seu WhatsApp para registrar seus gastos.</p>
                                
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-400">
                                    <span className="flex items-center gap-1"><span className="text-blue-500">✓</span> Cadastro gratuito</span>
                                    <span className="flex items-center gap-1"><span className="text-blue-500">✓</span> Sem cartão de crédito</span>
                                    <span className="flex items-center gap-1"><span className="text-blue-500">✓</span> Setup em 2 minutos</span>
                                </div>
                            </div>
                            
                            <div>
                                <div className="space-y-4">
                                    <input 
                                        type="email" 
                                        placeholder="Seu melhor e-mail" 
                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                    <Link 
                                        to="/register"
                                        className="w-full inline-flex justify-center items-center bg-blue-600 text-white font-semibold rounded-xl px-4 py-4 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Criar conta gratuita
                                    </Link>
                                    <p className="text-center text-[10px] text-zinc-600 mt-4">
                                        Ao criar uma conta, você concorda com nossos Termos de Serviço
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-12 border-t border-white/5 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
                        <div className="md:col-span-1">
                            <div className="mb-4">
                                <img src={logoWhite} alt="Tudo no Azul" className="h-14 object-contain" />
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Controle financeiro simples e eficiente. Integração WhatsApp e agenda diária em um só lugar.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-semibold mb-6">Produto</h4>
                            <ul className="space-y-4 text-sm text-zinc-500">
                                <li><a href="#recursos" className="hover:text-blue-400 transition-colors">Recursos</a></li>
                                <li><a href="#whatsapp" className="hover:text-blue-400 transition-colors">WhatsApp</a></li>
                                <li><a href="#agenda" className="hover:text-blue-400 transition-colors">Agenda</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-semibold mb-6">Suporte</h4>
                            <ul className="space-y-4 text-sm text-zinc-500">
                                <li><a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                                <li><a href="#depoimentos" className="hover:text-blue-400 transition-colors">Depoimentos</a></li>
                                <li><a href="mailto:contato@tudonoazul.com" className="hover:text-blue-400 transition-colors">Contato</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
                        <p>© {new Date().getFullYear()} Tudo no Azul. Todos os direitos reservados.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-zinc-400 transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-zinc-400 transition-colors">Termos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

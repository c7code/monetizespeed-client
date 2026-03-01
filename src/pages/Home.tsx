import { Link } from 'react-router-dom'
import logo from '../assets/TUDO NO AZUL-03.png'
import logoWhite from '../assets/TUDO NO AZUL-06.png'
import appMockup from '../assets/app-mockup.png'

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* ===== NAVBAR ===== */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-28">
                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="Tudo no Azul" className="h-36" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 ml-8">
                        <a href="#vantagens" className="hover:text-blue-600 transition-colors">Vantagens</a>
                        <a href="#recursos" className="hover:text-blue-600 transition-colors">Recursos</a>
                        <a href="#numeros" className="hover:text-blue-600 transition-colors">Números</a>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-2"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-medium bg-blue-600 text-white rounded-full px-5 py-2 hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-95"
                        >
                            Criar Conta
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
                <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -left-40 w-[400px] h-[400px] bg-cyan-200/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* Text */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-4 py-1.5 mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                Novo: Lance gastos por foto e áudio!
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                                Gestão Financeira
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                    Inteligente no App
                                </span>
                            </h1>

                            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Controle seus gastos com inteligência artificial. Envie fotos de recibos ou grave áudios
                                e deixe a IA lançar suas transações automaticamente.
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full px-8 py-3.5 text-base font-semibold hover:bg-blue-700 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-95"
                                >
                                    Começar Grátis
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 rounded-full px-8 py-3.5 text-base font-semibold hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95"
                                >
                                    Já tenho conta
                                </Link>
                            </div>
                        </div>

                        {/* Phone Mockup */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl blur-2xl scale-110" />
                                <img
                                    src={appMockup}
                                    alt="App Tudo no Azul"
                                    className="relative w-72 sm:w-80 lg:w-96 drop-shadow-2xl rounded-3xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== VANTAGENS ===== */}
            <section id="vantagens" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            A Vantagem do Nosso
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> App Nativo</span>
                        </h2>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                            Gerencie suas finanças com ferramentas inteligentes direto no seu celular
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ),
                                title: 'Lançamento por Foto',
                                desc: 'Tire uma foto do recibo e a IA extrai automaticamente os dados da transação.'
                            },
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                ),
                                title: 'Lançamento por Áudio',
                                desc: 'Diga o que gastou e o sistema registra tudo — mãos livres!'
                            },
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                title: 'Dashboard Completo',
                                desc: 'Visualize entradas, saídas, orçamentos e categorias em tempo real.'
                            },
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                ),
                                title: 'Dados Criptografados',
                                desc: 'Seus dados financeiros protegidos com criptografia de ponta a ponta.'
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group relative bg-gray-50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== RECURSOS / EXPERIÊNCIA PREMIUM ===== */}
            <section id="recursos" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left side — features */}
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                                Experiência Premium no
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> Android</span>
                            </h2>
                            <p className="text-gray-500 text-lg mb-10">
                                Nosso app nativo oferece funcionalidades exclusivas com inteligência artificial
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        iconBg: 'bg-blue-100 text-blue-600',
                                        title: 'Integração com Câmera',
                                        desc: 'Escaneie recibos, notas fiscais e boletos — o GPT-4o Vision faz o resto.'
                                    },
                                    {
                                        iconBg: 'bg-cyan-100 text-cyan-600',
                                        title: 'Comando por Voz',
                                        desc: 'Grave um áudio dizendo "Gastei R$ 50 no almoço" e a transação é criada na hora.'
                                    },
                                    {
                                        iconBg: 'bg-emerald-100 text-emerald-600',
                                        title: 'Orçamentos & Metas',
                                        desc: 'Defina limites por categoria e acompanhe o progresso em tempo real.'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side — phone */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-blue-600/20">
                                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                                <img
                                    src={appMockup}
                                    alt="App Tudo no Azul"
                                    className="relative w-56 sm:w-64 drop-shadow-xl rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== NÚMEROS ===== */}
            <section id="numeros" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
                        {/* Decorations */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative grid sm:grid-cols-3 gap-10 text-center text-white">
                            {[
                                { value: '+50.000', label: 'Transações registradas' },
                                { value: 'R$ 12 MI+', label: 'Em gastos organizados' },
                                { value: '4.9/5', label: 'Nota dos usuários' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-4xl sm:text-5xl font-extrabold">{stat.value}</p>
                                    <p className="mt-2 text-blue-200 text-sm font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEGURANÇA ===== */}
            <section className="py-20 lg:py-28 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Dados criptografados e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">100% seguros</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                        Utilizamos criptografia de ponta e servidores seguros para proteger todas as suas informações financeiras.
                        Seus dados nunca são compartilhados com terceiros.
                    </p>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Pronto para colocar suas finanças
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> no azul?</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Comece agora — é grátis, rápido e sem cartão de crédito.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full px-8 py-3.5 text-base font-semibold hover:bg-blue-700 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-95"
                        >
                            Criar Conta Grátis
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 rounded-full px-8 py-3.5 text-base font-semibold hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95"
                        >
                            Fazer Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center">
                            <img src={logoWhite} alt="Tudo no Azul" className="h-24" />
                        </div>

                        <div className="flex gap-6 text-sm">
                            <a href="#vantagens" className="hover:text-white transition-colors">Vantagens</a>
                            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
                            <a href="#numeros" className="hover:text-white transition-colors">Números</a>
                        </div>

                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} Tudo no Azul. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

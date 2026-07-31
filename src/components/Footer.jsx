import React from 'react';

export default function Footer() {
  return (
    <footer className="app-main-footer">
      <div className="container app-footer-container">
        {/* 1. Logo Centralizado */}
        <div className="footer-logo-wrap">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            title="TravelGPT - Voltar ao Topo"
          >
            <img src="/logo.png" alt="TravelGPT Logo" className="footer-logo-img" />
          </a>
        </div>

        {/* 2. Apresentação do Assistente */}
        <p className="footer-about-text">
          O <strong>TravelGPT</strong> é o seu assistente inteligente de viagens. Unimos tecnologia avançada à análise de informações públicas e atualizadas da internet para criar roteiros personalizados, dicas exclusivas e recomendações sob medida para a sua próxima experiência pelo mundo.
        </p>

        {/* 3. Bloco em Grid Elegante com Avisos Legais e Precisão */}
        <div className="footer-disclaimer-grid">
          <div className="footer-disclaimer-card">
            <strong>Aviso Legal:</strong> O TravelGPT é uma plataforma independente de tecnologia e curadoria para turismo. Não possuímos qualquer vínculo, associação, patrocínio ou representação direta com a OpenAI, criadora e proprietária das marcas registradas ChatGPT e GPT.
          </div>

          <div className="footer-disclaimer-card">
            <strong>Precisão das Informações:</strong> As informações sobre atrações, itinerários, preços, hospedagens e horários são compiladas a partir de fontes públicas disponíveis na web e podem sofrer alterações sem aviso prévio. Recomendamos a confirmação dos dados diretamente com os fornecedores e estabelecimentos locais antes de sua viagem.
          </div>
        </div>

        {/* 4. Copyright Centralizado */}
        <div className="footer-copyright">
          © 2026 TravelGPT. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

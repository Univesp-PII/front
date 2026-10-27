# Receba PII

## Organização de encomendas na portaria

O Receba é uma aplicação para apoiar o trabalho diário de porteiros em condomínios. Com ele, a equipe pode registrar encomendas, acompanhar o que ainda precisa ser retirado e consultar movimentações anteriores.

Este projeto foi desenvolvido como parte do PII da faculdade. A proposta é substituir anotações dispersas por um fluxo digital mais organizado e fácil de consultar.

## Como funciona

1. O porteiro acessa o sistema com email e senha.
2. Ao receber uma encomenda, localiza o morador e registra os dados da entrega.
3. O dashboard apresenta um resumo das encomendas e permite registrar uma retirada.
4. O histórico reúne os registros para consulta posterior.

## O que é possível fazer

- **Acompanhar o movimento:** visualizar totais de encomendas, moradores e retiradas no dashboard.
- **Registrar encomendas:** associar uma entrega ao morador e guardar código, empresa e entregador.
- **Cadastrar moradores:** registrar nome, bloco, apartamento e telefone para facilitar a localização.
- **Registrar retiradas:** atualizar o status de uma encomenda quando ela for entregue ao morador.
- **Consultar o histórico:** revisar informações de registros e retiradas anteriores.

## Acesso à demonstração

A aplicação depende de uma API e de um banco de dados ativos. Para avaliar o sistema, use o endereço de demonstração disponibilizado pela equipe do projeto e solicite as credenciais de acesso aos responsáveis. A disponibilidade do login e dos dados depende da configuração atual do serviço de backend.

## Acessibilidade

O sistema oferece recursos básicos para diferentes formas de navegação:

- Conteúdo identificado em português do Brasil, com rótulos associados aos campos dos formulários.
- Navegação por teclado, indicador de foco e atalho para pular diretamente ao conteúdo principal.
- Anúncio acessível de mensagens de sucesso e erro, com botão de fechar utilizável pelo teclado.
- Foco direcionado ao título ao mudar de tela.
- Redução de animações quando essa preferência está ativada no dispositivo.

Esses recursos são uma base de acessibilidade, não uma certificação. Para uma avaliação completa, recomenda-se testar com leitor de tela e ferramentas como Lighthouse ou axe.

## Informações técnicas

O repositório contém a interface web. O backend é mantido separadamente e fornece os dados e a autenticação. O frontend se comunica com a API configurada em `scripts/api.js`; as chamadas protegidas usam um token JWT recebido no login.

Para executar uma cópia local, sirva a pasta do projeto por um servidor HTTP estático e abra `index.html` pelo endereço local gerado pelo servidor. A API precisa estar disponível e configurada para que login e dados funcionem.

## Tecnologias

- HTML, CSS e JavaScript para as telas e interações.
- API REST separada para autenticação e dados do sistema.
- JWT para manter a sessão autenticada.
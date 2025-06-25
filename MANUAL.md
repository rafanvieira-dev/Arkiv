# Manual do Sistema ARKIV

## 1. Introdução

Bem-vindo ao ARKIV, o Sistema de Gestão Arquivística projetado para simplificar o controle, armazenamento, consulta e destinação de documentos e processos. Este manual serve como um guia completo para todas as funcionalidades e regras de negócio do sistema.

---

## 2. Primeiros Passos: Login

A tela de login é a porta de entrada para o sistema.

-   **Login Padrão**: Utilize seu e-mail e senha cadastrados. Novos usuários precisam da aprovação de um administrador para acessar o sistema.
-   **Acesso Rápido (Admin)**: Para fins de demonstração e administração, o botão "Acesso Rápido (Admin)" realiza o login com o usuário administrador padrão, que possui todas as permissões.
-   **Ações Públicas**: Os botões "Transferir Documentos" e "Nova Solicitação (Público)" levam a formulários públicos que não exigem login.

---

## 3. Dashboard

A tela principal após o login. Oferece uma visão geral do acervo e atalhos para as principais funcionalidades.

-   **Cartões de Estatísticas**: Exibem números importantes, como total de documentos, solicitações pendentes e documentos próximos da data de eliminação. Clicar em um cartão geralmente leva à tela correspondente com os filtros aplicados.
-   **Atividades Pendentes**: Lista as solicitações e transferências que requerem sua atenção.
-   **Ações Rápidas**: Atalhos para as operações mais comuns.

---

## 4. Funcionalidades do Sistema

### 4.1. Acervo (`/documentos`)

O coração do sistema. Aqui você gerencia todos os documentos.

-   **Adicionar/Editar**: O botão "Adicionar ao Acervo" abre um formulário detalhado, organizado em seções (acordeão), para cadastrar um novo documento. Para editar, clique no ID do documento na tabela.
-   **Partes Envolvidas**: É possível adicionar múltiplas partes (Autor, Réu, etc.) a um documento, cada uma com nome, CPF/CNPJ e tipo.
-   **Classificação**: Ao inserir um "Código de Classificação Arquivística", o sistema preenche automaticamente os campos de prazo de guarda e destinação final. Se o código não existir, um novo registro "Pendente de Complemento" é criado automaticamente na tela de Classificação.
-   **Caixas**: Ao inserir um código de caixa que não existe no campo "Código(s) da(s) Caixa(s)", uma nova caixa é criada automaticamente.
-   **Filtros**: Use o painel de filtros para refinar a busca por múltiplos critérios.
-   **Alteração em Bloco**: Selecione vários documentos para aplicar uma mesma alteração (ex: mudar o status ou a caixa) a todos de uma vez.

### 4.2. Caixas (`/caixas`)

Gerenciamento das unidades de armazenamento físico.

-   **Cadastro**: Crie novas caixas informando código, descrição, tipo, etc.
-   **Visualização**: Clicar no código de uma caixa leva você para a tela de Acervo, com todos os documentos daquela caixa já filtrados.

### 4.3. Classificação (`/classificacao`)

Gerenciamento da Tabela de Temporalidade e Destinação de Documentos (TTDD) para assuntos **administrativos e judiciais**.

-   **Cadastro**: Defina os códigos de classificação, seus prazos de guarda (na fase corrente e intermediária) e a destinação final (Eliminação ou Guarda Permanente).
-   **Regra de Negócio**: A informação cadastrada aqui é usada para calcular automaticamente o `Ano de Eliminação Previsto` dos documentos no Acervo.

### 4.4. Classes Judiciais (`/classes-judiciais`)

Tabela de temporalidade específica para classes judiciais (ex: Procedimento Comum Cível). Funciona de forma similar à tela de Classificação, mas é focada nos códigos e prazos do âmbito judicial.

### 4.5. Listagens de Eliminação (`/listagens-eliminacao`)

Agrupamento de documentos que serão eliminados.

-   **Criação**: Crie uma nova listagem e adicione documentos que tenham destinação final "Eliminação". O sistema filtra e exibe apenas os documentos elegíveis.
-   **Processo de Eliminação**:
    1.  **Criação da Listagem**: Status "Tramitando".
    2.  **Publicação do Edital**: Ao preencher a "Data Pub. Edital", os documentos da listagem mudam seu status no acervo para "Aguardando prazo para eliminação".
    3.  **Efetivação**: Ao preencher a "Data Prod. Termo", a listagem é considerada **"Efetivada"**, e os documentos associados mudam seu status para "Eliminado".

### 4.6. Transferências (`/transferencias`)

Recebimento de documentos de outros setores.

-   **Formulário Público**: Setores externos podem usar o formulário público para registrar uma remessa de documentos.
-   **Aprovação**: Na tela de Transferências, o arquivista analisa a remessa.
    -   **Aprovar**: Os documentos da remessa são automaticamente cadastrados no Acervo com o status "Pendente de Conferência".
    -   **Reprovar**: A remessa é marcada como reprovada e nenhuma alteração é feita no acervo.

### 4.7. Solicitações (`/solicitacoes`)

Gerenciamento de empréstimos e desarquivamentos.

-   **Nova Solicitação**: Pode ser criada pela tela interna ou pelo formulário público.
-   **Regra de Negócio**:
    -   Ao preencher a "Data de Atendimento", o status do documento solicitado muda para "Emprestado" ou "Desarquivado".
    -   Ao preencher a "Data de Devolução", o status do documento volta para "Arquivado".

### 4.8. Busca Avançada (`/busca-avancada`)

Uma ferramenta de pesquisa poderosa com todos os campos disponíveis para consulta, permitindo encontrar documentos com alta precisão.

### 4.9. Estatísticas (`/estatisticas`)

Gráficos interativos que mostram a composição do acervo, como documentos por status, por ano, por destinação, etc. Clicar em um gráfico abre uma visualização ampliada.

### 4.10. Relatórios (`/relatorios`)

-   **Relatórios Fixos**: Tabelas quantitativas de previsão de eliminação e guarda permanente. Os números são clicáveis e levam para a tela de Acervo com os documentos filtrados.
-   **Gerador de Relatório Customizado**: Ferramenta para criar relatórios personalizados. Selecione as colunas desejadas, gere a visualização e imprima ou salve como PDF.

### 4.11. Usuários (`/usuarios`)

*Apenas para administradores.*
-   **Gerenciamento**: Crie, edite e exclua usuários.
-   **Permissões**: Atribua permissões detalhadas para cada funcionalidade do sistema.
-   **Aprovação**: aprove ou reprove novos cadastros de usuários.

### 4.12. Configurações (`/configuracoes`)

*Apenas para administradores.*
-   Gerencie as listas de valores usadas em todo o sistema, como "Espécies de Documento", "Tipos de Caixa", "Tipos de Origem", etc.

### 4.13. Auditoria (`/auditoria`)

*Apenas para administradores.*
-   Visualize um registro completo de todas as ações importantes realizadas no sistema, incluindo quem fez, o que foi feito e quando. Permite filtrar por usuário, ação e período.

---

## 5. Principais Regras de Negócio

-   **Cálculo do Ano de Eliminação**: O `Ano de Eliminação Previsto` é calculado da seguinte forma: `Ano de Arquivamento + Prazo de Guarda na Fase Intermediária + 1`. Este cálculo só é aplicado para documentos com destinação final "Eliminação".
-   **Status de Documentos**: O status de um documento é dinâmico. Ele pode ser alterado manualmente, mas também é atualizado automaticamente pelas ações em **Solicitações** (para "Emprestado"/"Desarquivado") e **Listagens de Eliminação** (para "Aguardando prazo para eliminação"/"Eliminado").
-   **Segurança e Permissões**: O acesso a cada tela e funcionalidade é controlado pelas permissões definidas no cadastro de usuário. Um usuário sem a permissão necessária não verá o item no menu.
-   **Integridade dos Dados**: O sistema armazena todos os dados no *LocalStorage* do navegador. Isso significa que os dados são persistentes em seu computador, mas não são compartilhados entre diferentes navegadores ou usuários. A limpeza do cache do navegador pode apagar os dados.

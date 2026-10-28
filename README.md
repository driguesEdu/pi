# FitSocial

Protótipo de uma rede social esportiva em português. Pessoas podem compartilhar atividades, acompanhar publicações, seguir atletas e conversar quando existe seguimento mútuo. O projeto usa HTML, CSS e JavaScript sem framework, instalação de dependências ou etapa de compilação.

## Abrir o aplicativo

Use um navegador moderno e um servidor estático na pasta do projeto:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:4173`. A extensão Live Server de um editor também pode servir esta pasta. Mantenha o mesmo endereço durante os testes: localhost, 127.0.0.1 e portas diferentes usam áreas de armazenamento diferentes. O servidor serve apenas arquivos, sem processar contas ou mensagens.

A abertura direta de `index.html` tem uma cópia dos exemplos que dispensa `fetch`, mas as regras de armazenamento de URLs `file:` variam entre navegadores. Para compartilhar dados entre todas as páginas e testar as contas, prefira o servidor local. A abertura por arquivo não foi validada na ferramenta de navegador, que permite apenas HTTP e HTTPS.

O feed e a pesquisa podem ser explorados sem login. Na tela de login, use **Explorar conta de demonstração** para entrar como Maria Eduarda, com publicações, conexões e conversas de exemplo. Há também um botão de demonstração na versão desktop do feed. Uma conta nova começa sem publicações ou conexões. Os exemplos são fictícios; use informações fictícias nos testes.

## Estrutura e responsabilidades

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `index.html` | Feed da comunidade e de pessoas seguidas |
| `login.html`, `cadastro.html` | Entrada, criação de conta e acesso à demonstração |
| `explorar.html` | Pesquisa de pessoas, esportes e publicações |
| `criar.html` | Publicações com fotos e registro de atividades |
| `perfil.html` | Perfil atual ou outro atleta via `?user=ID` |
| `conversa.html` | Lista e histórico das conversas, seleção via `?user=ID` |
| `comentario.html` | Publicação individual via `?post=ID` e acesso aos comentários |
| `css/app.css` | Paleta, componentes, tipografia e layout compartilhados |
| `css/responsive.css` | Adaptação para tablet e celular, navegação inferior |
| `js/store.js` | Persistência, contas, migração dos dados antigos, conexões e estatísticas |
| `js/app.js` | Inicialização, navegação comum, cards, comentários, fotos, modais e mensagens de feedback |
| `js/feed.js` | Feed e visualização individual da publicação |
| `js/community.js` | Pesquisa, perfis, edição e conversas |
| `js/compose.js` | Formulário, fotos, métricas, duração e localização |
| `js/auth.js` | Formulários de cadastro/login, validação e retorno à página solicitada |
| `js/icons.js` | Ícones SVG locais, sem dependência de fontes ou serviços |
| `data/exemplos.json` | Fonte dos oito perfis, doze posts, relações, comentários e mensagens iniciais |
| `data/exemplos.js` | Cópia gerada dos exemplos para abertura direta dos arquivos HTML |
| `img/` | Fotos locais e favicon; imagens antigas do protótipo preservadas |
| `scripts/preparar-dados.js` | Gera a cópia JavaScript a partir do JSON |

As páginas HTML carregam os arquivos compartilhados com `defer`. O atributo `data-page` escolhe a tela. Depois que os dados são lidos, `App` monta a navegação e chama o renderizador correspondente. As páginas continuam sendo arquivos independentes, com links HTML e suporte aos botões Voltar/Avançar do navegador.

## Persistência e dados

O estado fica em `localStorage`, na chave `fitSocialStateV1`, com `version`, `currentUserId`, `users`, `posts`, `messages` e `sports`. A sessão permanece após recarregar e fechar a aba; **Sair da conta** remove a sessão ativa sem apagar contas ou interações.

Na primeira abertura, os exemplos são carregados do JSON por HTTP. A cópia JavaScript oferece suporte à abertura por arquivo e funciona como alternativa se a leitura HTTP estiver indisponível. O conjunto inicial é inserido uma vez. Recarregar a página não restaura os exemplos por cima das alterações dos usuários.

Ao editar `data/exemplos.json`, atualize a cópia com:

```powershell
node scripts/preparar-dados.js
```

A alteração dos exemplos afeta novas áreas de armazenamento. Um navegador que já tenha estado salvo mantém suas interações.

As chaves antigas `fitSocialUsuarios` e `fitSocialPosts`, quando presentes, são importadas na primeira inicialização; a sessão antiga `sessionStorage.usuario` também é reconhecida. Os registros originais não são removidos. Os autores são relacionados pelo e-mail, e os quilômetros antigos são convertidos para metros. Dados que não puderem ser lidos geram uma mensagem de erro sem limpar o armazenamento.

Uma mutação é preparada em uma cópia, gravada no armazenamento e então refletida na memória e na tela. Se a gravação falhar por falta de espaço, o app apresenta uma mensagem, preserva o estado persistido e permite tentar novamente. As telas abertas em outras abas da mesma origem recebem atualizações pelo evento `storage`.

### Contratos

- Usuário: `id`, `nome`, `username`, `email`, `bio`, `fotoPerfil`, `seguindo` e `esportes`. `seguindo` contém IDs dos usuários seguidos; seguidores são calculados a partir dessas relações.
- Conta cadastrada: senha derivada com PBKDF2/SHA-256, salt individual e 100.000 iterações. Contas antigas mantêm sua credencial legada até o primeiro login, quando ela é convertida no estado novo. Os exemplos usam acesso de demonstração e não têm senha de login.
- Publicação: `id`, `userId`, `tipo`, `texto`, `imagens`, `esporte`, `metric`, `distanciaMetros`, `pontos`, `tempo`, `localizacao`, coordenadas opcionais, `createdAt`, `curtidas` e `comentarios`. `metric` pode ser inferido para exemplos e registros antigos; publicações novas registram o tipo de medida selecionado.
- `userId` referencia o autor. Curtidas contêm IDs de usuários e podem ser alternadas sem duplicação. Cada comentário tem ID, autor, texto e data.
- Distâncias são armazenadas em metros e exibidas em quilômetros, com formatação brasileira. Pontos são inteiros não negativos. Os totais do perfil são calculados a partir das publicações do autor, inclusive as que foram criadas pela aba Publicação.
- Mensagem: `id`, `from`, `to`, `texto` e `createdAt`. As duas referências são IDs de usuários. O histórico exibido envolve apenas a conta ativa e a pessoa selecionada.
- IDs novos são gerados localmente. Datas novas usam ISO 8601 e são exibidas no fuso do navegador.

## Comportamentos da interface

O feed **Para você** mostra todas as publicações, da mais recente para a mais antiga. **Seguindo** inclui as contas seguidas e as publicações da conta ativa. Curtidas e comentários são persistentes; fotos podem ser ampliadas. O link de uma publicação funciona dentro da mesma área local de dados.

A pesquisa aceita nomes, usuários e esportes, sem diferenciar maiúsculas ou acentos. As abas separam pessoas, esportes e publicações. Uma modalidade filtra publicações e pessoas relacionadas. Modalidades personalizadas publicadas também aparecem na pesquisa de esportes, e o filtro Outros reúne atividades fora da lista inicial.

Na criação, **Publicação** aceita texto ou fotos. **Registrar atividade** também permite publicar sem legenda ou foto, exigindo duração e a medida aplicável. A modalidade é selecionada nas duas abas. Corrida, caminhada, ciclismo e natação oferecem distância em metros ou quilômetros; futebol, basquete, vôlei e tênis oferecem pontos. Musculação não exige medida. **Outros** permite informar o nome e escolher distância, pontos ou nenhuma medida. Duração permanece disponível nas duas abas, em `hh:mm:ss` ou `mm:ss`.

São aceitas até quatro fotos por publicação, com limite de 15 MB por arquivo. Elas são convertidas para JPEG com lado máximo de 1.400 pixels e qualidade 0,75 antes de serem salvas como data URLs. Fotos de perfil usam limite de 480 pixels. GIFs são convertidos em imagem estática. A prévia pode ser removida antes de publicar.

A localização pode ser digitada. O botão de localização atual solicita acesso pelo navegador e adiciona as coordenadas; em caso de recusa ou indisponibilidade, o campo manual continua disponível. Não há serviço externo para converter coordenadas em nomes de lugares.

O perfil apresenta foto, nome, usuário, biografia, publicações, seguidores e contas seguidas. A edição permite mudar foto, nome, usuário, e-mail e biografia; as alterações são aplicadas depois de salvar. Fotos e nomes nos posts são lidos do usuário atual, evitando cópias desatualizadas. Há visualização em grade/lista, aba de curtidas e estatísticas de distância, pontos e quantidade de atividades. No celular, as estatísticas ficam antes da galeria.

Conversas e novos destinatários são limitados a relações mútuas. A verificação é repetida no envio. Deixar de seguir remove a conexão da lista e bloqueia novos envios; um histórico acessado por link continua disponível para leitura. Não há respostas automáticas simuladas. Para testar entre contas cadastradas, entre alternadamente nas duas contas deste navegador e siga a outra conta em cada uma.

Mensagens de sucesso usam notificações discretas; erros de formulário aparecem junto aos campos. Confirmações de acesso, comentários, fotos e edição usam modais com a mesma linguagem visual. Não são usados `alert`, `prompt` ou `confirm` nativos.

## Visual e responsividade

Paleta baseada nas referências: Moonlight `#F0ECDD`, Frost Blue `#8BA3C5`, Steel `#495B7D`, Storm `#23354D` e Oxford Blue `#02122F`. Fundos claros, detalhes azuis, logo serifado e fotos em cores mantêm o caráter simples do protótipo.

Desktop usa navegação lateral; em telas de até 760 pixels, a navegação passa para a barra inferior, respeitando a área segura do dispositivo. O feed vira uma coluna e as conversas passam a alternar entre a lista e a conversa selecionada, com botão de retorno. Formulários usam rótulos, foco visível e controles adaptados ao toque.

## Limites do protótipo

As contas, fotos, mensagens e interações existem apenas no navegador e na origem onde foram criadas. Não há backend, sincronização entre aparelhos, envio real de mensagens pela internet, recuperação de senha por e-mail ou autenticação de produção. O hash de senha evita armazenamento direto de novas senhas, mas não transforma o estado local em um sistema de acesso seguro. Não use informações ou senhas reais.

O limite de espaço do `localStorage` varia entre navegadores e pode ser alcançado ao salvar muitas imagens. Limpar os dados do navegador remove as interações. Em navegação privada, o navegador pode descartar os dados ao encerrar a sessão. PBKDF2 exige Web Crypto, normalmente disponível em localhost, HTTPS e navegadores que aceitam arquivos locais como contexto seguro.

As fotografias de demonstração foram obtidas do Unsplash e são servidas localmente. Não são necessárias fontes externas, bibliotecas de ícones ou chamadas a APIs de terceiros para usar o feed.

## Verificação

Não há bundle para compilar. Verifique a sintaxe dos scripts com Node:

```powershell
Get-ChildItem js/*.js | ForEach-Object { node --check $_.FullName }
node --check scripts/preparar-dados.js
```

Regressões funcionais relacionadas devem ser verificadas pela interface: cadastrar e entrar; recarregar para verificar a sessão; curtir e comentar; seguir e deixar de seguir; publicar foto, distância em metros e pontuação; conferir totais no perfil; editar foto e biografia; pesquisar modalidade personalizada; enviar mensagem entre conexões mútuas e verificar o bloqueio ao desfazer a relação.

Testes responsivos no navegador verificam o layout e a navegação móvel. Eles não substituem testes em aparelhos físicos. O acesso real à geolocalização depende do navegador e da permissão do usuário.

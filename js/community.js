(() => {
  const { S, $, $$, esc, norm, num, url, avatar, card, empty, userRow, sportIcon, followButton, dialog, toast } = App;
  const params = new URLSearchParams(location.search);
  let query = params.get('q') || '';
  let selectedSport = params.get('sport') || '';
  let exploreTab = selectedSport ? 'posts' : 'people';
  const sports = () => {
    const custom = [...new Set(S.data.posts.map(p => p.esporte).filter(name => name && !S.data.sports.some(s => s.nome === name)))];
    return [...S.data.sports, ...custom.map(nome => ({ nome, icon: 'mountain', metric: '' }))];
  };
  const matchesSport = name => !selectedSport || (selectedSport === 'Outros' ? name && !S.data.sports.some(s => s.nome === name) : name === selectedSport);
  function exploreResults() {
    const q = norm(query.trim());
    const users = S.data.users.filter(u => u.id !== S.me()?.id && norm(u.nome + ' ' + u.username + ' ' + u.esportes.join(' ') + ' ' + S.data.posts.filter(p => p.userId === u.id).map(p => p.esporte).join(' ')).includes(q) && (!selectedSport || u.esportes.some(matchesSport) || S.data.posts.some(p => p.userId === u.id && matchesSport(p.esporte))));
    const matches = sports().filter(s => norm(s.nome).includes(q));
    const posts = [...S.data.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(p => norm(p.esporte + ' ' + p.texto + ' ' + p.localizacao + ' ' + S.user(p.userId)?.nome).includes(q) && matchesSport(p.esporte));
    const filter = selectedSport ? `<div class="selected-sport-bar">${sportIcon(selectedSport)}<strong>${esc(selectedSport)}</strong><button class="text-button" id="clear-sport">Limpar filtro ${icon('close')}</button></div>` : '';
    if (exploreTab === 'people') return filter + (users.length ? `<div class="card people-card">${users.map(u => userRow(u, '@' + u.username + ' · ' + u.esportes.join(', '))).join('')}</div>` : empty('Nenhuma pessoa encontrada', 'Tente outro nome, usuário ou esporte.'));
    if (exploreTab === 'sports') return matches.length ? `<div class="sport-grid">${matches.map(s => `<button class="card sport-tile" data-sport="${esc(s.nome)}">${sportIcon(s.nome)}<strong>${esc(s.nome)}</strong><small>${S.data.posts.filter(p => s.nome === 'Outros' ? p.esporte && !S.data.sports.some(base => base.nome === p.esporte) : p.esporte === s.nome).length} ${S.data.posts.filter(p => s.nome === 'Outros' ? p.esporte && !S.data.sports.some(base => base.nome === p.esporte) : p.esporte === s.nome).length === 1 ? 'publicação' : 'publicações'} ${icon('chevron')}</small></button>`).join('')}</div>` : empty('Esporte não encontrado', 'Você pode publicar uma modalidade personalizada escolhendo Outros.');
    return filter + (posts.length ? posts.map(card).join('') : empty('Nenhuma publicação encontrada', 'Tente outra modalidade ou compartilhe a primeira atividade.', '<a href="criar.html" class="button">Criar publicação</a>'));
  }
  function bindResults() {
    $$('[data-sport]').forEach(button => button.addEventListener('click', () => { selectedSport = button.dataset.sport; exploreTab = 'posts'; query = ''; App.render(); }));
    $('#clear-sport')?.addEventListener('click', () => { selectedSport = ''; updateResults(); });
  }
  function updateResults() { $('#search-results').innerHTML = exploreResults(); bindResults(); }
  App.pages.explore = {
    render() {
      return `<div class="page-header"><div><span class="eyebrow">NOVOS ESPORTES, NOVAS CONEXÕES</span><h1 class="page-title">Encontre sua comunidade.</h1><p class="page-subtitle">Pessoas e modalidades para inspirar seu próximo passo.</p></div></div><label class="search-field explore-search">${icon('search')}<span class="sr-only">Pesquisar pessoas e esportes</span><input id="explore-query" type="search" placeholder="Busque pessoas, esportes ou atividades..." value="${esc(query)}" autocomplete="off"></label>
      <div class="explore-layout"><section><div class="feed-tabs explore-tabs" role="tablist" aria-label="Tipo de pesquisa">${[['people','Pessoas'],['sports','Esportes'],['posts','Publicações']].map(([key, label]) => `<button class="tab ${exploreTab === key ? 'active' : ''}" role="tab" aria-selected="${exploreTab === key}" data-explore-tab="${key}">${label}</button>`).join('')}</div><div id="search-results" aria-live="polite">${exploreResults()}</div></section><aside class="explore-aside"><section class="card side-panel"><div class="section-heading"><h2>Explore por modalidade</h2></div><div class="sport-chips">${sports().map(s => `<button class="sport-chip ${selectedSport === s.nome ? 'active' : ''}" data-sport="${esc(s.nome)}">${sportIcon(s.nome)} ${esc(s.nome)}</button>`).join('')}</div></section><p class="community-note">${icon('chat')}<span>Boas conversas começam com interesses em comum. Siga alguém e faça uma nova conexão.</span></p></aside></div>`;
    },
    bind() {
      $('#explore-query').addEventListener('input', event => { query = event.target.value; updateResults(); });
      $$('[data-explore-tab]').forEach(button => button.addEventListener('click', () => { exploreTab = button.dataset.exploreTab; App.render(); }));
      bindResults();
    }
  };
  let profileTab = 'posts';
  let profileView = 'grid';
  function profileUser() { return S.user(params.get('user')) || (!params.has('user') ? S.me() : null); }
  function followers(user) { return S.data.users.filter(u => u.seguindo.includes(user.id)); }
  function connections(user, following) {
    const people = following ? S.data.users.filter(u => user.seguindo.includes(u.id)) : followers(user);
    dialog(following ? 'Seguindo' : 'Seguidores', people.length ? people.map(u => userRow(u)).join('') : empty('Novas conexões vêm aí', following ? 'As pessoas seguidas aparecerão aqui.' : 'Os seguidores aparecerão aqui.'));
  }
  function editProfile() {
    const me = S.me();
    let photo = me.fotoPerfil;
    let uploading = false;
    dialog('Editar perfil', `<form id="edit-profile"><label class="profile-photo-control" aria-label="Alterar foto de perfil"><span id="edit-avatar">${avatar(me, 'large-avatar')}</span>${icon('camera')}<input name="foto" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><p id="photo-status" class="center small muted" aria-live="polite"></p><label class="field">Nome<input name="nome" value="${esc(me.nome)}" maxlength="60" required autocomplete="name"></label><label class="field">Nome de usuário<input name="username" value="${esc(me.username)}" maxlength="30" pattern="[a-zA-Z0-9_.]{3,30}" title="Use de 3 a 30 letras, números, pontos ou sublinhados" required autocomplete="username"></label><label class="field">E-mail<input name="email" type="email" value="${esc(me.email)}" maxlength="100" required autocomplete="email"></label><label class="field">Biografia<textarea name="bio" maxlength="300" rows="3">${esc(me.bio)}</textarea></label><p id="edit-error" class="form-error" role="alert"></p><button class="button full" type="submit">Salvar alterações ${icon('check')}</button></form>`);
    $('#edit-profile').elements.foto.addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      uploading = true;
      $('#photo-status').textContent = 'Preparando foto...';
      try { photo = await App.imageFile(file, 480); $('#edit-avatar').innerHTML = avatar({ ...me, fotoPerfil: photo }, 'large-avatar'); $('#photo-status').textContent = 'Foto pronta para salvar.'; }
      catch (error) { $('#edit-error').textContent = error.message; $('#photo-status').textContent = ''; }
      finally { uploading = false; }
    });
    $('#edit-profile').addEventListener('submit', event => {
      event.preventDefault();
      if (uploading) { $('#edit-error').textContent = 'Aguarde o processamento da foto.'; return; }
      const values = new FormData(event.target);
      const name = values.get('nome').trim();
      const username = values.get('username').trim().toLowerCase();
      const email = values.get('email').trim().toLowerCase();
      if (!name) { $('#edit-error').textContent = 'Informe seu nome.'; return; }
      try {
        S.change(data => {
          if (data.users.some(u => u.id !== me.id && (u.username.toLowerCase() === username || u.email.toLowerCase() === email))) throw new Error('Este usuário ou e-mail já está em uso.');
          Object.assign(data.users.find(u => u.id === me.id), { nome: name, username, email, bio: values.get('bio').trim(), fotoPerfil: photo });
        });
        $('#modal').close(); App.shell(); toast('Seu perfil foi atualizado.');
      } catch (error) { $('#edit-error').textContent = error.name === 'QuotaExceededError' ? 'Sem espaço para a foto. Tente uma imagem menor.' : error.message; }
    });
  }
  App.pages.profile = {
    render() {
      const user = profileUser();
      if (!user) return empty('Perfil não encontrado', 'Procure outra pessoa na comunidade.', '<a href="explorar.html" class="button">Pesquisar</a>');
      const mine = user.id === S.me()?.id;
      const stats = S.stats(user.id);
      const posts = [...S.data.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(p => profileTab === 'likes' ? p.curtidas.includes(user.id) : p.userId === user.id);
      const relatedSports = [...new Set([...user.esportes, ...S.data.posts.filter(p => p.userId === user.id).map(p => p.esporte).filter(Boolean)])];
      const photoGrid = `<div class="profile-grid">${posts.map(p => `<a href="${url('comentario.html', {post:p.id})}" aria-label="Ver publicação: ${esc(p.texto || p.esporte)}">${p.imagens[0] ? `<img src="${App.safeImage(p.imagens[0])}" alt="${esc(p.esporte || 'Atividade')}" loading="lazy">` : sportIcon(p.esporte)}<span class="grid-label">${esc(p.esporte || 'Publicação')}</span></a>`).join('')}</div>`;
      return `<div class="page-header"><div><span class="eyebrow">CADA CONQUISTA CONTA</span><h1 class="page-title">${mine ? 'Meu perfil' : 'Conheça ' + esc(user.nome.split(' ')[0])}</h1><p class="page-subtitle">Uma história construída em movimento.</p></div></div><section class="profile-card card"><div class="profile-cover"></div><div class="profile-details"><div class="profile-top">${avatar(user,'large-avatar')}<div>${mine ? `<button class="button outline" id="edit-profile-button">${icon('edit')} Editar perfil</button>` : followButton(user)}${S.mutual(S.me(),user) ? `<a class="button secondary profile-chat" href="${url('conversa.html',{user:user.id})}">${icon('chat')} Conversar</a>` : ''}</div></div><h2 class="profile-name">${esc(user.nome)}</h2><p class="profile-handle">@${esc(user.username)}</p><p class="profile-bio">${esc(user.bio || 'Uma nova jornada está começando.')}</p><div class="profile-counts"><span><strong>${stats.posts}</strong> ${stats.posts === 1 ? 'publicação' : 'publicações'}</span><button id="show-followers"><strong>${followers(user).length}</strong> seguidores</button><button id="show-following"><strong>${user.seguindo.length}</strong> seguindo</button></div></div></section>
      <div class="profile-layout"><section><div class="feed-tabs" role="tablist" aria-label="Publicações do perfil"><button class="tab ${profileTab === 'posts' ? 'active' : ''}" role="tab" aria-selected="${profileTab === 'posts'}" data-profile-tab="posts">${icon('grid')} Publicações</button><button class="tab ${profileTab === 'likes' ? 'active' : ''}" role="tab" aria-selected="${profileTab === 'likes'}" data-profile-tab="likes">${icon('heart')} Curtidas</button><button class="icon-button view-toggle" id="toggle-view" aria-label="${profileView === 'grid' ? 'Ver em lista' : 'Ver em grade'}">${icon(profileView === 'grid' ? 'list' : 'grid')}</button></div>${posts.length ? profileView === 'grid' ? photoGrid : posts.map(card).join('') : empty(profileTab === 'likes' ? 'Inspire-se pela comunidade' : 'O primeiro passo começa aqui', profileTab === 'likes' ? 'As publicações curtidas aparecerão neste espaço.' : 'As atividades publicadas vão aparecer aqui.', mine ? '<a href="criar.html" class="button">Criar publicação</a>' : '')}</section>
      <aside><section class="card profile-statistics"><h2>Estatísticas de atividades</h2><div class="stat-row">${icon('route')}<div><strong>${num(stats.distance / 1000)} <span class="small">km</span></strong><small>Distância total percorrida</small></div></div><div class="stat-row">${icon('trophy')}<div><strong>${num(stats.points)}</strong><small>Pontos acumulados</small></div></div><div class="stat-row">${icon('run')}<div><strong>${S.data.posts.filter(p => p.userId === user.id && p.esporte).length}</strong><small>Atividades compartilhadas</small></div></div></section>${relatedSports.length ? `<section class="card side-panel search-section"><div class="section-heading"><h2>Em movimento com</h2></div><div class="sport-chips">${relatedSports.map(s => `<a class="sport-chip" href="${url('explorar.html',{sport:s})}">${sportIcon(s)} ${esc(s)}</a>`).join('')}</div></section>` : ''}${mine ? `<button class="text-button profile-logout" data-action="logout">${icon('logout')} Sair da conta</button>` : ''}</aside></div>`;
    },
    bind() {
      $('#edit-profile-button')?.addEventListener('click', editProfile);
      $('#show-followers')?.addEventListener('click', () => connections(profileUser(), false));
      $('#show-following')?.addEventListener('click', () => connections(profileUser(), true));
      $$('[data-profile-tab]').forEach(button => button.addEventListener('click', () => { profileTab = button.dataset.profileTab; App.render(); }));
      $('#toggle-view')?.addEventListener('click', () => { profileView = profileView === 'grid' ? 'list' : 'grid'; App.render(); });
    }
  };
  let activeChat = params.get('user') || '';
  let chatSearch = '';
  const history = userId => S.data.messages.filter(m => m.from === S.me()?.id && m.to === userId || m.from === userId && m.to === S.me()?.id).sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
  function chatContacts() {
    return S.data.users.filter(u => S.mutual(S.me(), u) && norm(u.nome + ' ' + u.username).includes(norm(chatSearch))).sort((a,b) => new Date(history(b.id).at(-1)?.createdAt || 0)-new Date(history(a.id).at(-1)?.createdAt || 0));
  }
  function contactList() {
    const contacts = chatContacts();
    return contacts.length ? contacts.map(u => {
      const last = history(u.id).at(-1);
      return `<button class="chat-contact ${activeChat === u.id ? 'active' : ''}" data-chat="${esc(u.id)}">${avatar(u)}<span class="person-info"><strong>${esc(u.nome)}</strong><span>${esc(last?.texto || 'Comece uma conversa')}</span></span><small>${last ? App.time(last.createdAt) : ''}</small></button>`;
    }).join('') : empty('Nenhuma conexão', 'As pessoas que você segue e que seguem você aparecem aqui.');
  }
  function bindContacts() {
    $$('[data-chat]').forEach(button => button.addEventListener('click', () => { activeChat = button.dataset.chat; window.history.replaceState(null, '', url('conversa.html', {user:activeChat})); $('#modal').close(); App.render(); }));
  }
  function conversation() {
    const user = S.user(activeChat);
    if (!user || user.id === S.me()?.id) return empty('Conversa boa também motiva', 'Escolha uma conexão ao lado para compartilhar ideias, combinar um treino e se incentivar.');
    const mutual = S.mutual(S.me(), user);
    const messages = history(user.id);
    let lastDay = '';
    const content = messages.map(m => {
      const date = new Date(m.createdAt);
      const day = date.toLocaleDateString('pt-BR', {day:'numeric',month:'long'});
      const dayLabel = day === lastDay ? '' : `<span class="chat-date">${day}</span>`;
      lastDay = day;
      return `${dayLabel}<div class="bubble ${m.from === S.me().id ? 'mine' : ''}"><p>${esc(m.texto)}</p><small>${date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></div>`;
    }).join('');
    return `<div class="chat-header"><button class="icon-button chat-back" id="chat-back" aria-label="Voltar às conversas">${icon('back')}</button><a class="person-link" href="${url('perfil.html',{user:user.id})}">${avatar(user)}<span class="person-info"><strong>${esc(user.nome)}</strong><span>${mutual ? 'Vocês se seguem' : 'Seguimento mútuo necessário'}</span></span></a></div><div class="chat-messages" id="chat-messages" role="log" aria-label="Mensagens da conversa">${content || empty('Dê o primeiro oi', 'Um convite para treinar pode ser o começo de uma boa amizade.')}</div>${mutual ? `<form class="chat-form" id="chat-form"><label class="sr-only" for="message-text">Mensagem para ${esc(user.nome)}</label><input id="message-text" name="texto" placeholder="Escreva uma mensagem..." required maxlength="2000" autocomplete="off"><button class="button" aria-label="Enviar mensagem">${icon('send')}</button></form>` : `<p class="chat-lock">${icon('lock')}Para conversar, vocês precisam seguir um ao outro. O histórico continua salvo.</p>`}`;
  }
  App.pages.chat = {
    render() {
      return `<div class="page-header"><div><span class="eyebrow">CONEXÕES ALÉM DO TREINO</span><h1 class="page-title">Conversas</h1><p class="page-subtitle">Uma comunidade mais próxima, uma mensagem de cada vez.</p></div></div><div class="chat-layout card ${activeChat && S.user(activeChat) ? 'has-active' : ''}"><section class="chat-sidebar" aria-label="Lista de conversas"><div class="chat-sidebar-header"><div class="section-heading"><h2>Suas conversas</h2><button id="new-chat" class="icon-button" aria-label="Nova conversa">${icon('plus')}</button></div><label class="search-field">${icon('search')}<span class="sr-only">Buscar conversas</span><input id="chat-search" type="search" placeholder="Buscar conversa..." value="${esc(chatSearch)}"></label></div><div class="chat-contact-list" id="chat-contacts">${contactList()}</div><p class="chat-sidebar-note">${icon('lock')}Conversas disponíveis apenas entre pessoas que se seguem.</p></section><section class="chat-pane" aria-label="Conversa selecionada">${conversation()}</section></div>`;
    },
    bind() {
      $('#chat-search').addEventListener('input', event => { chatSearch = event.target.value; $('#chat-contacts').innerHTML = contactList(); bindContacts(); });
      $('#chat-back')?.addEventListener('click', () => { activeChat = ''; window.history.replaceState(null, '', 'conversa.html'); App.render(); });
      $('#new-chat').addEventListener('click', () => {
        const contacts = S.data.users.filter(u => S.mutual(S.me(),u));
        dialog('Nova conversa', contacts.length ? `<p class="modal-description">Escolha alguém que também segue você.</p>${contacts.map(u => `<button class="chat-contact" data-chat="${esc(u.id)}">${avatar(u)}<span class="person-info"><strong>${esc(u.nome)}</strong><span>@${esc(u.username)}</span></span>${icon('chevron')}</button>`).join('')}` : empty('Suas conexões começam no feed', 'Siga pessoas e espere que elas sigam você para começar uma conversa.', '<a href="explorar.html" class="button">Encontrar pessoas</a>'));
        bindContacts();
      });
      $('#chat-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const text = event.target.elements.texto.value.trim();
        if (!text) return;
        try {
          S.change(data => {
            const me = data.users.find(u => u.id === data.currentUserId);
            const target = data.users.find(u => u.id === activeChat);
            if (!S.mutual(me, target)) throw new Error('O envio exige que vocês sigam um ao outro.');
            data.messages.push({ id:S.id('message'),from:me.id,to:target.id,texto:text,createdAt:new Date().toISOString() });
          });
          App.render(); $('#message-text')?.focus();
        } catch (error) { App.handleError(error); }
      });
      bindContacts();
      const messages = $('#chat-messages');
      if (messages) messages.scrollTop = messages.scrollHeight;
    }
  };
})();

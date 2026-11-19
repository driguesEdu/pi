(() => {
  const { S, $, $$, esc, num, url, avatar, card, empty, userRow, sportIcon } = App;
  let feedTab = 'all';
  function aside() {
    const me = S.me();
    const stats = me ? S.stats(me.id, true) : { distance: 0, posts: 0 };
    const suggestions = S.data.users.filter(u => u.id !== me?.id && !me?.seguindo.includes(u.id)).slice(0, 3);
    return `<aside class="feed-aside"><section class="card side-panel movement-panel"><span class="eyebrow">${me ? 'SEU RESUMO DA SEMANA' : 'UM PASSO DE CADA VEZ'}</span><h2>${me ? 'Seu movimento' : 'Encontre seu ritmo'}</h2>${me ? `<div class="movement-stats"><div><strong>${num(stats.distance / 1000)} <small>km</small></strong><span>percorridos</span></div><div><strong>${stats.posts}</strong><span>${stats.posts === 1 ? 'publicação' : 'publicações'}</span></div></div><p>Cada pequeno passo faz a diferença.</p>` : `<p class="guest-movement">Compartilhe conquistas e encontre pessoas que se movem com você.</p><button class="button secondary full" data-action="demo">Experimentar o FitSocial ${icon('arrow')}</button>`}</section>
      <section class="card side-panel"><div class="section-heading"><h2>Gente que inspira</h2><a href="explorar.html">Ver todos</a></div>${suggestions.map(u => userRow(u, u.esportes.join(' · '))).join('') || '<p class="muted small">Você já segue toda a comunidade!</p>'}</section>
      <section class="card side-panel"><div class="section-heading"><h2>Encontre seu esporte</h2></div><div class="sport-chips">${S.data.sports.slice(0, 6).map(s => `<a class="sport-chip" href="${url('explorar.html', {sport: s.nome})}">${sportIcon(s.nome)} ${esc(s.nome)}</a>`).join('')}</div></section>
      <p class="community-note">${icon('heart')}<span>Não precisa ser o mais rápido.<br>O importante é continuar em movimento.</span></p></aside>`;
  }
  App.pages.feed = {
    render() {
      const me = S.me();
      let posts = [...S.data.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (feedTab === 'following') posts = posts.filter(p => me?.seguindo.includes(p.userId) || p.userId === me?.id);
      return `<div class="page-header"><div><span class="eyebrow">SUA COMUNIDADE, EM MOVIMENTO</span><h1 class="page-title">O movimento conecta.</h1><p class="page-subtitle">Inspire-se, compartilhe e celebre cada conquista.</p></div><a class="button" href="criar.html">${icon('plus')} Nova publicação</a></div>
      <div class="feed-layout"><section class="feed-column" aria-label="Publicações da comunidade"><div class="composer-shortcut card">${avatar(me)}<a href="${me ? 'criar.html' : 'login.html'}">${me ? 'Qual foi o seu movimento de hoje?' : 'Entre e compartilhe seu movimento...'}</a><a class="icon-button" href="criar.html" aria-label="Publicar uma foto">${icon('image')}</a></div>
      <div class="feed-tabs" role="tablist" aria-label="Selecionar feed"><button class="tab ${feedTab === 'all' ? 'active' : ''}" role="tab" aria-selected="${feedTab === 'all'}" data-feed-tab="all">Para você</button><button class="tab ${feedTab === 'following' ? 'active' : ''}" role="tab" aria-selected="${feedTab === 'following'}" data-feed-tab="following">Seguindo</button><span class="feed-count">${posts.length} ${posts.length === 1 ? 'publicação' : 'publicações'}</span></div>
      <div id="feed">${posts.length ? posts.map(card).join('') : empty('Seu feed está começando', 'Siga pessoas na pesquisa para acompanhar suas atividades por aqui.', '<a class="button" href="explorar.html">Encontrar pessoas</a>')}</div></section>${aside()}</div>`;
    },
    bind() {
      $$('[data-feed-tab]').forEach(button => button.addEventListener('click', () => {
        if (button.dataset.feedTab === 'following' && !App.requireUser()) return;
        feedTab = button.dataset.feedTab; App.render();
      }));
    }
  };
  App.pages.comments = {
    render() {
      const post = S.data.posts.find(p => p.id === new URLSearchParams(location.search).get('post'));
      return `<div class="narrow-page"><div class="page-header"><div><a class="text-button" href="index.html">${icon('back')} Voltar ao feed</a><h1 class="page-title detail-title">Na comunidade</h1></div></div>${post ? card(post) + `<button class="button secondary full" id="open-comments">${icon('chat')} Ver comentários (${post.comentarios.length})</button>` : empty('Publicação não encontrada', 'Ela pode ter sido criada em outro navegador. As publicações deste protótipo são locais.', '<a href="index.html" class="button">Voltar ao início</a>')}</div>`;
    },
    bind() { $('#open-comments')?.addEventListener('click', () => App.comments(new URLSearchParams(location.search).get('post'))); }
  };
})();

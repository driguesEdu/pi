window.App = (() => {
  const S = FitStore;
  const page = document.body.dataset.page;
  const pages = {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const num = value => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value || 0);
  const url = (file, params) => file + (params ? '?' + new URLSearchParams(params) : '');
  const safeImage = value => /^(img\/[^"<>]+|data:image\/(?:jpeg|png|webp|gif);base64,[a-zA-Z0-9+/=]+|https:\/\/[^"<>]+)$/i.test(value || '') ? esc(value) : '';
  const avatar = (user, size = '') => {
    const src = safeImage(user?.fotoPerfil);
    return `<span class="avatar ${size}">${src ? `<img src="${src}" alt="" loading="lazy">` : esc((user?.nome || 'F').split(' ').slice(0, 2).map(n => n[0]).join(''))}</span>`;
  };
  const sportIcon = name => icon(S.data.sports.find(s => s.nome === name)?.icon || 'mountain');
  const empty = (title, text, action = '') => `<div class="empty-state">${icon('mountain')}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
  let toastTimer;
  function toast(message, error = false) {
    const el = $('#toast');
    clearTimeout(toastTimer);
    el.innerHTML = `${icon(error ? 'info' : 'check')}<span>${esc(message)}</span>`;
    el.className = 'toast visible' + (error ? ' error' : '');
    toastTimer = setTimeout(() => el.classList.remove('visible'), 4500);
  }
  function handleError(error) {
    const message = error.name === 'QuotaExceededError' ? 'O armazenamento está cheio. Tente uma foto menor. Nada foi alterado.' : error.message || 'Não foi possível salvar. Tente novamente.';
    if ($('#modal').open) {
      let feedback = $('.modal-feedback', $('#modal'));
      if (!feedback) { feedback = document.createElement('p'); feedback.className = 'modal-feedback'; feedback.setAttribute('role', 'alert'); $('#modal').append(feedback); }
      feedback.textContent = message;
    } else toast(message, true);
  }
  function dialog(title, content, className = '') {
    const modal = $('#modal');
    modal.className = className;
    modal.innerHTML = `<div class="modal-header"><h2 id="modal-title">${esc(title)}</h2><button class="icon-button" data-action="close-modal" aria-label="Fechar">${icon('close')}</button></div>${content}`;
    if (!modal.open) modal.showModal();
  }
  function requireUser() {
    if (S.me()) return true;
    dialog('Faça parte do movimento', `<p class="modal-description">Entre na sua conta para publicar, curtir e conversar com a comunidade.</p><a class="button full" href="login.html">Entrar na conta ${icon('arrow')}</a><button class="button secondary full" data-action="demo">Experimentar demonstração</button><p class="center muted small">Ainda não tem conta? <a href="cadastro.html">Cadastre-se</a></p>`);
    return false;
  }
  function followButton(user, small = false) {
    if (S.me()?.id === user.id) return '';
    const following = S.me()?.seguindo.includes(user.id);
    return `<button class="button follow-button ${small ? 'compact' : ''} ${following ? 'following' : 'secondary'}" data-action="follow" data-user="${esc(user.id)}" aria-pressed="${!!following}">${following ? icon('check') + ' Seguindo' : icon('plus') + ' Seguir'}</button>`;
  }
  function userRow(user, subtitle = '', action = '') {
    return `<div class="user-row"><a class="person-link" href="${url('perfil.html', {user: user.id})}">${avatar(user)}<span class="person-info"><strong>${esc(user.nome)}</strong><span>${esc(subtitle || '@' + user.username)}</span></span></a>${action || followButton(user, true)}</div>`;
  }
  function time(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const delta = Date.now() - date.getTime();
    if (delta >= 0 && delta < 60000) return 'Agora';
    if (delta >= 0 && delta < 3600000) return Math.floor(delta / 60000) + ' min';
    if (delta >= 0 && delta < 86400000) return Math.floor(delta / 3600000) + ' h';
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }
  function nav() {
    const items = [['feed', 'index.html', 'home', 'Início'], ['explore', 'explorar.html', 'search', 'Pesquisar'], ['compose', 'criar.html', 'plus', 'Criar'], ['chat', 'conversa.html', 'chat', 'Conversas'], ['profile', 'perfil.html', 'user', 'Perfil']];
    return items.map(([key, href, glyph, label]) => `<a class="nav-link ${key === page || page === 'comments' && key === 'feed' ? 'active' : ''} ${key === 'compose' ? 'nav-create' : ''}" href="${href}" ${key === page ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></a>`).join('');
  }
  function shell() {
    const me = S.me();
    const titles = { feed: 'Sua comunidade', explore: 'Descubra novas conexões', compose: 'Compartilhe seu movimento', chat: 'Suas conexões', profile: 'Seu espaço', comments: 'Na comunidade' };
    $('#app').innerHTML = `<aside class="sidebar">
      <a href="index.html" class="brand" aria-label="FitSocial, início">FitSocial<span class="brand-dot"></span></a><p class="brand-caption">Sua atividade. Sua comunidade.</p>
      <nav aria-label="Navegação principal">${nav()}</nav>
      <a class="button publish-sidebar" href="criar.html">${icon('plus')} Nova publicação</a>
      <div class="sidebar-bottom"><div class="sidebar-note">${icon('mountain')}<p>Cada movimento<br><strong>conta uma história.</strong></p></div>
      ${me ? `<a class="account" href="perfil.html">${avatar(me)}<span><strong>${esc(me.nome)}</strong><small>@${esc(me.username)}</small></span>${icon('chevron')}</a><button class="logout-link" data-action="logout">${icon('logout')} Sair da conta</button>` : `<a class="button full" href="login.html">Entrar na conta ${icon('arrow')}</a><button class="text-button demo-sidebar" data-action="demo">Experimentar demonstração</button>`}</div>
    </aside>
    <div class="workspace"><header class="topbar"><span class="topbar-label">${esc(titles[page])}</span><a class="brand mobile-brand" href="index.html">FitSocial<span class="brand-dot"></span></a><div class="topbar-right"><span class="today">${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span><span class="topbar-divider"></span><a href="conversa.html" class="icon-button" aria-label="Conversas">${icon('chat')}</a>${me ? `<a href="perfil.html" aria-label="Meu perfil">${avatar(me, 'small-avatar')}</a>` : '<a href="login.html" class="text-button">Entrar</a>'}</div></header>
    <main id="main" class="main" tabindex="-1"></main><footer class="page-footer"><span>FitSocial</span> Um pouco de movimento faz toda a diferença.</footer></div><nav class="mobile-nav" aria-label="Navegação móvel">${nav()}</nav>`;
    render();
  }
  function render() {
    const renderer = pages[page];
    if (renderer) {
      $('#main').innerHTML = renderer.render();
      renderer.bind?.();
    }
  }
  function card(post) {
    const user = S.user(post.userId);
    if (!user) return '';
    const liked = post.curtidas.includes(S.me()?.id);
    const photos = post.imagens || [];
    const metric = post.metric || S.data.sports.find(s => s.nome === post.esporte)?.metric;
    return `<article class="post card" id="post-${esc(post.id)}" data-post="${esc(post.id)}">
      <div class="post-header"><a class="person-link" href="${url('perfil.html', {user: user.id})}">${avatar(user)}<span class="person-info"><strong>${esc(user.nome)}</strong><span>@${esc(user.username)} <span aria-hidden="true">·</span> ${time(post.createdAt)}</span></span></a>${followButton(user, true)}</div>
      ${post.texto ? `<p class="post-caption">${esc(post.texto)}</p>` : ''}
      ${photos.length ? `<div class="post-photos ${photos.length > 1 ? 'multiple-photos' : ''}">${photos.map((src, i) => `<button class="photo-button" data-action="view-photo" data-src="${safeImage(src)}" aria-label="Ampliar foto ${i + 1} de ${esc(post.esporte || 'atividade')}"><img src="${safeImage(src)}" alt="${esc(post.esporte || 'Atividade')} de ${esc(user.nome)}${post.localizacao ? ' em ' + esc(post.localizacao) : ''}" loading="lazy"></button>`).join('')}</div>` : ''}
      ${post.esporte || post.tempo || post.distanciaMetros || post.pontos ? `<div class="activity-strip"><a href="${url('explorar.html', {sport: post.esporte})}" class="activity-sport">${sportIcon(post.esporte)}<span>${esc(post.esporte || 'Atividade')}</span></a><div class="activity-metrics">${post.distanciaMetros || metric === 'distancia' ? `<span><strong>${num(post.distanciaMetros / 1000)}</strong> km</span>` : ''}${post.pontos || metric === 'pontos' ? `<span><strong>${num(post.pontos)}</strong> pontos</span>` : ''}${post.tempo ? `<span>${icon('clock')} ${esc(post.tempo)}</span>` : ''}</div></div>` : ''}
      ${post.localizacao ? `<div class="post-location">${icon('pin')} ${esc(post.localizacao)}</div>` : ''}
      <div class="post-actions"><button class="post-action ${liked ? 'liked' : ''}" data-action="like" data-id="${esc(post.id)}" aria-label="${liked ? 'Descurtir' : 'Curtir'} publicação de ${esc(user.nome)}" aria-pressed="${liked}">${icon('heart')}<span>${post.curtidas.length}</span></button><button class="post-action" data-action="comments" data-id="${esc(post.id)}">${icon('chat')}<span>${post.comentarios.length} <span class="comment-label">${post.comentarios.length === 1 ? 'comentário' : 'comentários'}</span></span></button><button class="post-action share-action" data-action="share" data-id="${esc(post.id)}" aria-label="Copiar link da publicação">${icon('send')}</button></div>
    </article>`;
  }
  function updateCard(id) {
    const post = S.data.posts.find(p => p.id === id);
    const target = document.getElementById('post-' + id);
    if (post && target) target.outerHTML = card(post);
  }
  function comments(id) {
    const post = S.data.posts.find(p => p.id === id);
    if (!post) return;
    dialog('Comentários', `<div class="comments-list">${post.comentarios.length ? post.comentarios.map(c => {
      const author = S.user(c.userId);
      return `<div class="comment">${avatar(author, 'small-avatar')}<div><a href="${url('perfil.html', {user: c.userId})}"><strong>${esc(author?.nome || 'Atleta')}</strong></a><p>${esc(c.texto)}</p><small>${time(c.createdAt)}</small></div></div>`;
    }).join('') : empty('Comece a conversa', 'Que tal deixar uma mensagem de incentivo?')}</div>${S.me() ? `<form id="comment-form" data-id="${esc(id)}" class="comment-form"><label class="sr-only" for="comment-text">Seu comentário</label><input id="comment-text" name="texto" placeholder="Deixe seu incentivo..." required maxlength="1000" autocomplete="off"><button class="button icon-button" aria-label="Enviar comentário">${icon('send')}</button></form>` : '<a href="login.html" class="button full">Entre para comentar</a>'}`);
    $('#comment-form')?.addEventListener('submit', event => {
      event.preventDefault();
      const text = event.target.elements.texto.value.trim();
      if (!text || !S.me()) return;
      try {
        S.change(data => { data.posts.find(p => p.id === id).comentarios.push({ id: S.id('comment'), userId: data.currentUserId, texto: text, createdAt: new Date().toISOString() }); });
        updateCard(id); comments(id); $('#comment-text')?.focus();
      } catch (error) { handleError(error); }
    });
  }
  async function imageFile(file, maxSize = 1400) {
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) throw new Error('Escolha uma imagem JPG, PNG, WebP ou GIF.');
    if (file.size > 15 * 1024 * 1024) throw new Error('A foto deve ter no máximo 15 MB.');
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Não foi possível ler a foto.')); reader.readAsDataURL(file);
    });
    const image = await new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Esta imagem não pôde ser aberta.')); img.src = dataUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    try {
      if (action === 'close-modal') $('#modal').close();
      if (action === 'demo') { S.session('maria'); location.href = 'index.html'; }
      if (action === 'logout') { S.session(null); sessionStorage.removeItem('usuario'); location.href = 'login.html'; }
      if (action === 'follow' && requireUser()) {
        S.follow(button.dataset.user);
        const following = S.me().seguindo.includes(button.dataset.user);
        render();
        if ($('#modal').open) {
          button.outerHTML = followButton(S.user(button.dataset.user), true);
        }
        toast(following ? 'Você começou a seguir ' + S.user(button.dataset.user).nome + '.' : 'Você deixou de seguir ' + S.user(button.dataset.user).nome + '.');
      }
      if (action === 'like' && requireUser()) {
        S.change(data => {
          const post = data.posts.find(p => p.id === button.dataset.id);
          post.curtidas = post.curtidas.includes(data.currentUserId) ? post.curtidas.filter(x => x !== data.currentUserId) : [...post.curtidas, data.currentUserId];
        });
        updateCard(button.dataset.id);
      }
      if (action === 'comments') comments(button.dataset.id);
      if (action === 'share') {
        const link = new URL(url('comentario.html', {post: button.dataset.id}), location.href).href;
        if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(link); toast('Link da publicação copiado.'); }
        else dialog('Link da publicação', `<label class="field">Copie este link<input value="${esc(link)}" readonly></label>`);
      }
      if (action === 'view-photo') dialog('Foto da atividade', `<img class="expanded-photo" src="${safeImage(button.dataset.src)}" alt="Foto da atividade ampliada">`, 'photo-modal');
      if (action === 'auth-needed') requireUser();
    } catch (error) { handleError(error); }
  });
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await S.init();
      const protectedPages = ['profile', 'compose', 'chat'];
      if (!S.me() && protectedPages.includes(page) && !(page === 'profile' && new URLSearchParams(location.search).has('user'))) {
        location.replace(url('login.html', {next: location.pathname.split('/').pop() + location.search})); return;
      }
      if (['login', 'register'].includes(page)) { document.body.classList.add('auth-page'); pages[page].render(); }
      else shell();
      const flash = sessionStorage.getItem('fitSocialToast');
      if (flash) { sessionStorage.removeItem('fitSocialToast'); toast(flash); }
      $('#modal').addEventListener('click', event => { if (event.target === $('#modal')) { const rect = $('#modal').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#modal').close(); } });
    } catch (error) {
      $('#app').innerHTML = `<main class="startup-error"><a class="brand" href="index.html">FitSocial</a><h1>Não foi possível abrir o app</h1><p>${esc(error.message)}</p><p>Seus dados foram preservados. Verifique se o navegador permite armazenamento local.</p><button class="button" id="retry">Tentar novamente</button></main>`;
      $('#retry').addEventListener('click', () => location.reload());
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== S.KEY) return;
    try {
      S.refresh();
      if (!S.me() && (['compose', 'chat'].includes(page) || page === 'profile' && !new URLSearchParams(location.search).has('user'))) { location.replace('login.html'); return; }
      if (!['login', 'register'].includes(page)) shell();
    } catch (error) { handleError(error); }
  });
  return { S, page, pages, $, $$, esc, norm, num, url, safeImage, avatar, sportIcon, empty, toast, handleError, dialog, requireUser, followButton, userRow, time, render, shell, card, comments, imageFile };
})();

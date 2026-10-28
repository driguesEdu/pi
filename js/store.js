/* Estado local compartilhado. Sem serviços externos ou dependências. */
window.FitStore = (() => {
  const KEY = 'fitSocialStateV1';
  let state;
  const copy = value => JSON.parse(JSON.stringify(value));
  const id = prefix => `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)}`;
  const read = (key, fallback) => {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  };
  function validate(data) {
    if (data?.version !== 1 || !Array.isArray(data.users) || !Array.isArray(data.posts) || !Array.isArray(data.messages)) {
      throw new Error('Os dados salvos não puderam ser lidos. Eles foram preservados.');
    }
    return data;
  }
  function migrate(seed) {
    const data = copy(seed);
    const oldUsers = read('fitSocialUsuarios', []);
    const oldPosts = read('fitSocialPosts', []);
    if (!Array.isArray(oldUsers) || !Array.isArray(oldPosts)) throw new Error('Os dados antigos têm um formato desconhecido e foram preservados.');
    const ensureUser = old => {
      let user = data.users.find(u => u.email === old.email);
      if (!user) {
        user = { id: 'legacy-' + String(old.id || id('user')), nome: old.nome || old.name || 'Atleta', username: 'atleta' + data.users.length,
          email: old.email, bio: old.bio || '', fotoPerfil: old.fotoPerfil || '', seguindo: [], esportes: [], senhaLegada: old.senha || '', dataCadastro: old.dataCadastro || new Date().toISOString() };
        data.users.push(user);
      }
      return user;
    };
    oldUsers.forEach(ensureUser);
    oldUsers.forEach(old => {
      const user = data.users.find(u => u.email === old.email);
      user.seguindo = [...new Set([...(user.seguindo || []), ...(old.seguindo || []).map(ref => {
        const target = data.users.find(u => u.email === ref || u.id === String(ref) || u.id === 'legacy-' + String(ref));
        return target?.id;
      }).filter(Boolean)])];
    });
    oldPosts.forEach(post => {
      const author = ensureUser({ email: post.usuarioEmail || 'arquivo@local.test', nome: post.usuarioNome, fotoPerfil: post.usuarioFoto });
      data.posts.push({ ...post, id: 'legacy-post-' + String(post.id || id('post')), userId: author.id,
        texto: post.texto || post.descricao || '', imagens: post.imagem ? [post.imagem] : [], esporte: post.esporte || '',
        distanciaMetros: Number(post.km || 0) * 1000, pontos: Number(post.pontos || 0), curtidas: [], comentarios: [],
        createdAt: new Date(Number(post.id)).toString() !== 'Invalid Date' ? new Date(Number(post.id)).toISOString() : new Date().toISOString() });
    });
    const oldSession = sessionStorage.getItem('usuario');
    const session = oldSession ? JSON.parse(oldSession) : null;
    data.currentUserId = session ? data.users.find(u => u.email === session.email)?.id || null : null;
    return data;
  }
  async function init() {
    const saved = read(KEY, null);
    if (saved) state = validate(saved);
    else {
      let seed = window.FITSOCIAL_EXEMPLOS;
      if (location.protocol !== 'file:') {
        try {
          const response = await fetch('data/exemplos.json');
          if (response.ok) seed = await response.json();
        } catch { /* A cópia JS permite abrir o protótipo sem servidor. */ }
      }
      state = validate(migrate(seed));
      localStorage.setItem(KEY, JSON.stringify(state));
    }
    return state;
  }
  function change(mutator) {
    const next = validate(copy(read(KEY, state)));
    mutator(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    state = next;
    return state;
  }
  const user = userId => state.users.find(u => u.id === userId);
  const me = () => user(state.currentUserId);
  const mutual = (a, b) => Boolean(a && b && a.id !== b.id && a.seguindo.includes(b.id) && b.seguindo.includes(a.id));
  function follow(targetId) {
    if (!me() || targetId === me().id || !user(targetId)) return;
    change(data => {
      const current = data.users.find(u => u.id === data.currentUserId);
      current.seguindo = current.seguindo.includes(targetId) ? current.seguindo.filter(x => x !== targetId) : [...current.seguindo, targetId];
    });
  }
  async function passwordHash(password, salt) {
    if (!crypto.subtle) throw new Error('Abra o app em localhost ou HTTPS para cadastrar uma conta.');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, material, 256);
    return Array.from(new Uint8Array(result), x => x.toString(16).padStart(2, '0')).join('');
  }
  async function register({ nome, username, email, senha }) {
    const salt = id('salt');
    const senhaHash = await passwordHash(senha, salt);
    const newId = id('user');
    change(data => {
      if (data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Este e-mail já está cadastrado.');
      if (data.users.some(u => u.username.toLowerCase() === username.toLowerCase())) throw new Error('Este nome de usuário já está em uso.');
      data.users.push({ id: newId, nome, username, email: email.toLowerCase(), senhaHash, salt, bio: '', fotoPerfil: '', seguindo: [], esportes: [], dataCadastro: new Date().toISOString() });
      data.currentUserId = newId;
    });
  }
  async function login(email, senha) {
    const account = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const valid = account && (account.senhaLegada ? account.senhaLegada === senha : account.senhaHash && await passwordHash(senha, account.salt) === account.senhaHash);
    if (!valid) throw new Error('E-mail ou senha incorretos.');
    const salt = account.salt || id('salt');
    const hash = account.senhaHash || await passwordHash(senha, salt);
    change(data => {
      const saved = data.users.find(u => u.id === account.id);
      saved.senhaHash = hash; saved.salt = salt; delete saved.senhaLegada;
      data.currentUserId = account.id;
    });
  }
  function session(userId) { change(data => { data.currentUserId = userId; }); }
  function stats(userId, weekly = false) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    const posts = state.posts.filter(p => p.userId === userId && (!weekly || new Date(p.createdAt) >= start));
    return { posts: posts.length, distance: posts.reduce((n, p) => n + Number(p.distanciaMetros || 0), 0), points: posts.reduce((n, p) => n + Number(p.pontos || 0), 0) };
  }
  function refresh() { state = validate(read(KEY, state)); }
  return { KEY, init, change, user, me, mutual, follow, register, login, session, stats, refresh, id, get data() { return state; } };
})();

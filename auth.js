(() => {
  const { S, $, esc } = App;
  function destination() {
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    return /^(index|perfil|criar|explorar|conversa|comentario)\.html(?:\?[^#]*)?$/.test(next) ? next : 'index.html';
  }
  function auth(register) {
    $('#app').innerHTML = `<main class="auth-layout" id="main"><section class="auth-visual"><div><a class="brand" href="index.html">FitSocial<span class="brand-dot"></span></a><p class="brand-caption">Sua atividade. Sua comunidade.</p></div><div class="auth-quote"><span class="eyebrow">ENCONTRE O QUE MOVE VOCÊ</span><h1>Pequenos passos.<br>Grandes conexões.</h1><p>Compartilhe seu caminho, celebre suas conquistas e se inspire em quem também está em movimento.</p></div><p class="auth-visual-footer">${icon('mountain')} Cada movimento conta uma história.</p></section><section class="auth-content"><div class="auth-form-wrap"><a class="brand" href="index.html">FitSocial<span class="brand-dot"></span></a><h1 class="auth-heading">${register ? 'Comece sua jornada.' : 'Bom ter você de volta.'}</h1><p class="auth-description">${register ? 'Sua próxima conquista começa com uma conexão.' : 'Entre na sua conta e continue em movimento.'}</p><form class="auth-form" id="auth-form">
    ${register ? `<label class="field">Nome completo<input name="nome" id="nome" placeholder="Como você se chama?" maxlength="60" autocomplete="name" required></label><label class="field">Nome de usuário<input name="username" id="username" placeholder="seu.usuario" pattern="[a-zA-Z0-9_.]{3,30}" title="De 3 a 30 letras, números, pontos ou sublinhados" maxlength="30" autocomplete="username" required></label>` : ''}
    <label class="field">E-mail<input type="email" name="email" id="email" placeholder="seu@email.com" autocomplete="email" maxlength="100" required></label><label class="field">Senha<span class="password-field"><input type="password" name="senha" id="senha" placeholder="${register ? 'Pelo menos 4 caracteres' : 'Sua senha'}" autocomplete="${register ? 'new-password' : 'current-password'}" ${register ? 'minlength="4"' : ''} maxlength="128" required><button class="icon-button toggle-password" type="button" data-target="senha" aria-label="Mostrar senha">${icon('eye')}</button></span></label>
    ${register ? `<label class="field">Confirmar senha<span class="password-field"><input type="password" name="confirmar" id="confirmar" placeholder="Repita a senha" autocomplete="new-password" minlength="4" maxlength="128" required><button class="icon-button toggle-password" type="button" data-target="confirmar" aria-label="Mostrar confirmação de senha">${icon('eye')}</button></span></label>` : ''}<p class="form-error" id="auth-error" role="alert"></p><button class="button full" id="auth-submit" type="submit">${register ? 'Criar minha conta' : 'Entrar'} ${icon('arrow')}</button></form><p class="auth-switch">${register ? 'Já tem uma conta? <a href="login.html">Entre aqui</a>' : 'Ainda não faz parte? <a href="cadastro.html">Crie sua conta</a>'}</p><div class="auth-separator">ou conheça a comunidade</div><button class="button outline full" data-action="demo">${icon('run')} Explorar conta de demonstração</button><p class="auth-local-note">${icon('info')}<span>Protótipo para testes. Contas e interações ficam salvas apenas neste navegador. Use dados fictícios.</span></p><a href="index.html" class="auth-back">${icon('back')} Voltar para o feed</a></div></section></main>`;
    App.$$('.toggle-password').forEach(button => button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      const visible = input.type === 'password'; input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha'); button.setAttribute('aria-pressed', String(visible));
    }));
    $('#auth-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.target;
      const error = $('#auth-error');
      error.textContent = '';
      const email = form.elements.email.value.trim().toLowerCase();
      const senha = form.elements.senha.value;
      if (register && senha !== form.elements.confirmar.value) { error.textContent = 'As senhas não coincidem.'; return; }
      if (register && !form.elements.nome.value.trim()) { error.textContent = 'Informe seu nome.'; return; }
      $('#auth-submit').disabled = true;
      try {
        if (register) await S.register({nome:form.elements.nome.value.trim(),username:form.elements.username.value.trim().toLowerCase(),email,senha});
        else await S.login(email,senha);
        sessionStorage.setItem('fitSocialToast', register ? 'Bem-vindo ao FitSocial! Sua jornada começa aqui.' : 'Que bom ter você de volta!');
        location.href = destination();
      } catch (err) { error.textContent = err.name === 'QuotaExceededError' ? 'O navegador está sem espaço para salvar a conta.' : err.message; $('#auth-submit').disabled = false; }
    });
  }
  App.pages.login = { render: () => auth(false) };
  App.pages.register = { render: () => auth(true) };
})();

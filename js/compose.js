(() => {
  const { S, $, $$, esc, avatar, toast } = App;
  let mode = 'publicacao';
  let photos = [];
  let processing = false;
  let coordinates = null;
  function metric() {
    const sport = $('#sport').value;
    return sport === 'Outros' ? $('#custom-metric').value : S.data.sports.find(s => s.nome === sport)?.metric || '';
  }
  function fields() {
    const custom = $('#sport').value === 'Outros';
    $('#custom-sport-row').hidden = !custom;
    $('#custom-sport').required = custom;
    $('#custom-sport').disabled = !custom;
    const type = metric();
    $('#distance-field').hidden = type !== 'distancia';
    $('#distance').disabled = type !== 'distancia';
    $('#distance').required = type === 'distancia' && mode === 'atividade';
    $('#points-field').hidden = type !== 'pontos';
    $('#points').disabled = type !== 'pontos';
    $('#points').required = type === 'pontos' && mode === 'atividade';
    $('#duration').required = mode === 'atividade';
    $('#duration-label').textContent = mode === 'atividade' ? 'Duração (hh:mm:ss)' : 'Duração (opcional)';
    $('#publish-label').textContent = mode === 'atividade' ? 'Registrar atividade' : 'Publicar';
  }
  function previews() {
    $('#upload-previews').innerHTML = photos.map((src, i) => `<div class="upload-preview"><img src="${src}" alt="Foto ${i + 1} selecionada"><button class="icon-button" type="button" data-remove-photo="${i}" aria-label="Remover foto ${i + 1}">${icon('close')}</button></div>`).join('');
    $$('[data-remove-photo]').forEach(button => button.addEventListener('click', () => { photos.splice(Number(button.dataset.removePhoto), 1); previews(); }));
    $('#photo-count').textContent = `${photos.length}/4 fotos selecionadas. JPG, PNG, WebP ou GIF.`;
  }
  App.pages.compose = {
    render() {
      return `<div class="narrow-page"><div class="page-header"><div><span class="eyebrow">INSPIRE QUEM SE MOVE COM VOCÊ</span><h1 class="page-title">Seu movimento de hoje.</h1><p class="page-subtitle">Um treino, uma conquista ou só um bom momento.</p></div></div><section class="card compose-card"><div class="person-link compose-author">${avatar(S.me())}<div class="person-info"><strong>${esc(S.me().nome)}</strong><span>Compartilhando com a comunidade</span></div></div><div class="feed-tabs compose-tabs" role="tablist" aria-label="Tipo de publicação"><button class="tab active" data-compose-mode="publicacao" role="tab" aria-selected="true">${icon('image')} Publicação</button><button class="tab" data-compose-mode="atividade" role="tab" aria-selected="false">${icon('run')} Registrar atividade</button></div>
      <form id="compose-form"><label class="upload-area">${icon('image')}<strong>Adicione fotos do seu momento</strong><span id="photo-count">Até 4 fotos. JPG, PNG, WebP ou GIF.</span><input id="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-label="Adicionar fotos"></label><div class="upload-previews" id="upload-previews"></div>
      <label class="field">Legenda<textarea name="texto" id="caption" placeholder="Como foi sua atividade? Compartilhe com a comunidade..." maxlength="2000" rows="4"></textarea><small>Até 2.000 caracteres.</small></label><label class="field">Localização (opcional)<span class="field-with-icon">${icon('pin')}<input id="location" name="localizacao" placeholder="Onde você se movimentou?" maxlength="140"></span></label><button type="button" class="text-button geo-button" id="get-location">${icon('pin')} Usar localização atual</button><hr class="form-divider">
      <h2 class="form-section-title">${icon('run')} Sobre a atividade</h2><label class="field">Esporte<select id="sport" name="esporte" required><option value="">Selecione uma modalidade</option>${S.data.sports.map(s => `<option value="${esc(s.nome)}">${esc(s.nome)}</option>`).join('')}</select></label><div id="custom-sport-row" class="form-row" hidden><label class="field">Nome da atividade<input id="custom-sport" maxlength="50" placeholder="Ex.: escalada"></label><label class="field">Dados da atividade<select id="custom-metric"><option value="">Sem medida</option><option value="distancia">Distância</option><option value="pontos">Pontos</option></select></label></div>
      <div class="form-row"><label class="field" id="distance-field" hidden>Distância percorrida<span class="field-with-unit"><input id="distance" type="number" min="0" max="10000000" step="any" placeholder="0" inputmode="decimal"><select id="distance-unit" aria-label="Unidade de distância"><option value="km">km</option><option value="m">metros</option></select></span></label><label class="field" id="points-field" hidden>Pontos obtidos<input id="points" type="number" min="0" max="1000000" step="1" placeholder="0" inputmode="numeric"></label><label class="field"><span id="duration-label">Duração (opcional)</span><input id="duration" placeholder="00:30:00" pattern="([0-9]{1,3}:)?[0-5][0-9]:[0-5][0-9]" title="Informe a duração como 00:30:00 ou 30:00" maxlength="9"></label></div><p class="field-hint">Distâncias e pontos publicados são somados nas estatísticas do seu perfil.</p><p id="compose-error" class="form-error" role="alert"></p><div class="form-actions"><span>${icon('eye')} Visível para a comunidade</span><button class="button" id="publish-button" type="submit"><span id="publish-label">Publicar</span>${icon('arrow')}</button></div></form></section></div>`;
    },
    bind() {
      mode = 'publicacao'; photos = []; coordinates = null; processing = false;
      fields();
      $$('[data-compose-mode]').forEach(button => button.addEventListener('click', () => {
        mode = button.dataset.composeMode;
        $$('[data-compose-mode]').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
        fields();
      }));
      $('#sport').addEventListener('change', fields);
      $('#custom-metric').addEventListener('change', fields);
      $('#location').addEventListener('input', () => { coordinates = null; });
      $('#photos').addEventListener('change', async event => {
        const files = [...event.target.files];
        if (!files.length) return;
        if (photos.length + files.length > 4) { $('#compose-error').textContent = 'Selecione no máximo quatro fotos por publicação.'; event.target.value = ''; return; }
        processing = true; $('#publish-button').disabled = true; $('#compose-error').textContent = ''; $('#photo-count').textContent = 'Preparando suas fotos...';
        try { const images = await Promise.all(files.map(file => App.imageFile(file))); photos.push(...images); }
        catch (error) { $('#compose-error').textContent = error.message; }
        finally { processing = false; $('#publish-button').disabled = false; event.target.value = ''; previews(); }
      });
      $('#get-location').addEventListener('click', () => {
        if (!navigator.geolocation) { $('#compose-error').textContent = 'Localização indisponível. Você pode digitar o local acima.'; return; }
        const button = $('#get-location');
        button.disabled = true; button.textContent = 'Buscando localização...';
        navigator.geolocation.getCurrentPosition(position => {
          coordinates = { latitude:position.coords.latitude, longitude:position.coords.longitude };
          $('#location').value = `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
          toast('Localização adicionada. Você também pode escrever o nome do lugar.');
          button.disabled = false; button.innerHTML = icon('pin') + ' Usar localização atual';
        }, () => {
          $('#compose-error').textContent = 'Não foi possível acessar sua localização. Digite o nome do lugar no campo acima.';
          button.disabled = false; button.innerHTML = icon('pin') + ' Usar localização atual';
        }, {enableHighAccuracy:true,timeout:10000,maximumAge:60000});
      });
      $('#compose-form').addEventListener('submit', event => {
        event.preventDefault();
        if (processing || !App.requireUser()) return;
        const caption = $('#caption').value.trim();
        const sport = $('#sport').value === 'Outros' ? $('#custom-sport').value.trim() : $('#sport').value;
        if (!sport) { $('#compose-error').textContent = 'Informe o esporte praticado.'; return; }
        if (mode === 'publicacao' && !caption && !photos.length) { $('#compose-error').textContent = 'Escreva uma legenda ou adicione uma foto.'; return; }
        const type = metric();
        const distance = type === 'distancia' ? Number($('#distance').value) * ($('#distance-unit').value === 'km' ? 1000 : 1) : 0;
        const points = type === 'pontos' ? Number($('#points').value) : 0;
        if (!Number.isFinite(distance) || distance < 0 || !Number.isInteger(points) || points < 0) { $('#compose-error').textContent = 'Informe distância e pontuação válidas.'; return; }
        const postId = S.id('post');
        try {
          $('#publish-button').disabled = true;
          S.change(data => {
            if (!data.currentUserId) throw new Error('Entre na sua conta novamente.');
            data.posts.unshift({id:postId,userId:data.currentUserId,tipo:mode,texto:caption,imagens:[...photos],esporte:sport,metric:type,distanciaMetros:distance,pontos:points,tempo:$('#duration').value.trim(),localizacao:$('#location').value.trim(),latitude:coordinates?.latitude ?? null,longitude:coordinates?.longitude ?? null,createdAt:new Date().toISOString(),curtidas:[],comentarios:[]});
          });
          sessionStorage.setItem('fitSocialToast', mode === 'atividade' ? 'Atividade registrada! Suas estatísticas foram atualizadas.' : 'Sua publicação já está no feed!');
          location.href = 'index.html#post-' + postId;
        } catch (error) { $('#publish-button').disabled = false; $('#compose-error').textContent = error.name === 'QuotaExceededError' ? 'O armazenamento está cheio. Tente publicar menos fotos ou imagens menores.' : error.message; }
      });
    }
  };
})();

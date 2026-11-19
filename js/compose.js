
(() => {
  const { S, $, $$, esc, avatar, toast } = App;

  let photos = [];
  let processing = false;
  let coordinates = null;

  const esportesEmGrupo = [
    'futebol',
    'basquete',
    'volei'
  ];

  function normalizarEsporte(esporte) {
    return String(esporte || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function calcularPontos(esporte) {
    const nome = normalizarEsporte(esporte);

    return esportesEmGrupo.includes(nome) ? 2 : 1;
  }

  async function buscarNomeLocal(latitude, longitude) {
    try {
      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível localizar o endereço.');
      }

      const dados = await resposta.json();
      const endereco = dados.address || {};

      const nome =
        endereco.amenity ||
        endereco.leisure ||
        endereco.park ||
        endereco.tourism ||
        endereco.shop ||
        endereco.building ||
        endereco.road ||
        dados.name;

      const cidade =
        endereco.city ||
        endereco.town ||
        endereco.village ||
        endereco.municipality ||
        endereco.state;

      if (nome && cidade && nome !== cidade) {
        return `${nome}, ${cidade}`;
      }

      if (nome) return nome;

      return dados.display_name
        ? dados.display_name.split(',').slice(0, 3).join(',').trim()
        : 'Local não identificado';

    } catch (erro) {
      console.error('Erro ao buscar localização:', erro);
      return 'Local não identificado';
    }
  }

  function metric() {
    const sport = $('#sport').value;

    return sport === 'Outros'
      ? $('#custom-metric').value
      : S.data.sports.find(s => s.nome === sport)?.metric || '';
  }

  function fields() {
    const custom = $('#sport').value === 'Outros';

    $('#custom-sport-row').hidden = !custom;
    $('#custom-sport').required = custom;
    $('#custom-sport').disabled = !custom;

    const type = metric();

    $('#distance-field').hidden = type !== 'distancia';
    $('#distance').disabled = type !== 'distancia';
    $('#distance').required = type === 'distancia';

    $('#duration').required = true;
  }

  function previews() {
    $('#upload-previews').innerHTML = photos.map((src, i) => `
      <div class="upload-preview">
        <img src="${src}" alt="Foto ${i + 1} selecionada">

        <button class="icon-button" type="button"
          data-remove-photo="${i}"
          aria-label="Remover foto ${i + 1}">
          ${icon('close')}
        </button>
      </div>
    `).join('');

    $$('[data-remove-photo]').forEach(button => {
      button.addEventListener('click', () => {
        photos.splice(Number(button.dataset.removePhoto), 1);
        previews();
      });
    });

    $('#photo-count').textContent =
      `${photos.length}/4 fotos selecionadas. JPG, PNG, WebP ou GIF.`;
  }

  App.pages.compose = {
    render() {
      return `
        <div class="narrow-page">

          <div class="page-header">
            <div>
              <span class="eyebrow">ACOMPANHE SUA EVOLUÇÃO</span>
              <h1 class="page-title">Registrar atividade</h1>
              <p class="page-subtitle">
                Registre seus treinos, compartilhe suas conquistas e acumule pontos.
              </p>
            </div>
          </div>

          <section class="card compose-card">

            <div class="person-link compose-author">
              ${avatar(S.me())}

              <div class="person-info">
                <strong>${esc(S.me().nome)}</strong>
                <span>Registrando uma atividade</span>
              </div>
            </div>

            <form id="compose-form">

              <label class="upload-area">
                ${icon('image')}
                <strong>Adicione fotos da sua atividade</strong>

                <span id="photo-count">
                  Até 4 fotos. JPG, PNG, WebP ou GIF.
                </span>

                <input id="photos" type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple aria-label="Adicionar fotos">
              </label>

              <div class="upload-previews" id="upload-previews"></div>

              <label class="field">
                Descrição da atividade

                <textarea name="texto" id="caption"
                  placeholder="Como foi seu treino? Conte para a comunidade..."
                  maxlength="2000" rows="4"></textarea>

                <small>Até 2.000 caracteres.</small>
              </label>

              <label class="field">
                Localização (opcional)

                <span class="field-with-icon">
                  ${icon('pin')}

                  <input id="location" name="localizacao"
                    placeholder="Onde você praticou?"
                    maxlength="140">
                </span>
              </label>

              <button type="button"
                class="text-button geo-button"
                id="get-location">
                ${icon('pin')} Usar localização atual
              </button>

              <hr class="form-divider">

              <h2 class="form-section-title">
                ${icon('run')} Dados da atividade
              </h2>

              <label class="field">
                Esporte

                <select id="sport" name="esporte" required>
                  <option value="">Selecione uma modalidade</option>

                  ${S.data.sports.map(s => `
                    <option value="${esc(s.nome)}">
                      ${esc(s.nome)}
                    </option>
                  `).join('')}

                  <option value="Outros">Outros</option>
                </select>
              </label>

              <div id="custom-sport-row" class="form-row" hidden>

                <label class="field">
                  Nome da atividade

                  <input id="custom-sport"
                    maxlength="50"
                    placeholder="Ex.: escalada">
                </label>

                <label class="field">
                  Dados da atividade

                  <select id="custom-metric">
                    <option value="">Sem medida</option>
                    <option value="distancia">Distância</option>
                    <option value="pontos">Pontos</option>
                  </select>
                </label>

              </div>

              <div class="form-row">

                <label class="field" id="distance-field" hidden>
                  Distância percorrida

                  <span class="field-with-unit">
                    <input id="distance"
                      type="number"
                      min="0"
                      max="10000000"
                      step="any"
                      placeholder="0"
                      inputmode="decimal">

                    <select id="distance-unit"
                      aria-label="Unidade de distância">
                      <option value="km">km</option>
                      <option value="m">metros</option>
                    </select>
                  </span>
                </label>

                <label class="field">
                  Duração (hh:mm:ss)

                  <input id="duration"
                    placeholder="00:30:00"
                    pattern="([0-9]{1,3}:)?[0-5][0-9]:[0-5][0-9]"
                    title="Informe a duração como 00:30:00 ou 30:00"
                    maxlength="9"
                    required>
                </label>

              </div>

              <p class="field-hint">
                Pontuação automática:
                futebol, basquete e vôlei valem 2 pontos.
                Os demais esportes valem 1 ponto.
                Seus pontos serão acumulados no perfil.
              </p>

              <p id="compose-error"
                class="form-error"
                role="alert"></p>

              <div class="form-actions">

                <span>
                  ${icon('eye')} Visível para a comunidade
                </span>

                <button class="button"
                  id="publish-button"
                  type="submit">

                  <span id="publish-label">
                    Registrar atividade
                  </span>

                  ${icon('arrow')}
                </button>

              </div>

            </form>
          </section>
        </div>
      `;
    },

    bind() {
      photos = [];
      coordinates = null;
      processing = false;

      fields();

      $('#sport').addEventListener('change', fields);
      $('#custom-metric').addEventListener('change', fields);

      $('#location').addEventListener('input', () => {
        coordinates = null;
      });

      // Seleção das fotos
      $('#photos').addEventListener('change', async event => {
        const files = [...event.target.files];

        if (!files.length) return;

        if (photos.length + files.length > 4) {
          $('#compose-error').textContent =
            'Selecione no máximo quatro fotos.';

          event.target.value = '';
          return;
        }

        processing = true;
        $('#publish-button').disabled = true;
        $('#compose-error').textContent = '';
        $('#photo-count').textContent = 'Preparando suas fotos...';

        try {
          const images = await Promise.all(
            files.map(file => App.imageFile(file))
          );

          photos.push(...images);

        } catch (error) {
          $('#compose-error').textContent = error.message;

        } finally {
          processing = false;
          $('#publish-button').disabled = false;
          event.target.value = '';
          previews();
        }
      });

      // Localização atual
      $('#get-location').addEventListener('click', () => {
        if (!navigator.geolocation) {
          $('#compose-error').textContent =
            'Localização indisponível. Digite o local manualmente.';
          return;
        }

        const button = $('#get-location');

        button.disabled = true;
        button.textContent = 'Buscando localização...';

        navigator.geolocation.getCurrentPosition(async position => {
          coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          const nomeLocal = await buscarNomeLocal(
            coordinates.latitude,
            coordinates.longitude
          );

          $('#location').value = nomeLocal;

          if (nomeLocal === 'Local não identificado') {
            $('#compose-error').textContent =
              'Não encontramos o local. Você pode digitá-lo manualmente.';
          } else {
            toast('Localização adicionada: ' + nomeLocal);
          }

          button.disabled = false;
          button.innerHTML =
            icon('pin') + ' Usar localização atual';

        }, () => {
          $('#compose-error').textContent =
            'Não foi possível acessar sua localização. Digite o local manualmente.';

          button.disabled = false;
          button.innerHTML =
            icon('pin') + ' Usar localização atual';

        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      // Registrar atividade
      $('#compose-form').addEventListener('submit', event => {
        event.preventDefault();

        if (processing || !App.requireUser()) return;

        const caption = $('#caption').value.trim();
        const esporteSelecionado = $('#sport').value;

        const sport = esporteSelecionado === 'Outros'
          ? $('#custom-sport').value.trim()
          : esporteSelecionado;

        if (!sport) {
          $('#compose-error').textContent =
            'Informe o esporte praticado.';
          return;
        }

        if (!$('#duration').value.trim()) {
          $('#compose-error').textContent =
            'Informe a duração da atividade.';
          return;
        }

        const type = metric();

        const distance = type === 'distancia'
          ? Number($('#distance').value) *
            ($('#distance-unit').value === 'km' ? 1000 : 1)
          : 0;

        if (!Number.isFinite(distance) || distance < 0) {
          $('#compose-error').textContent =
            'Informe uma distância válida.';
          return;
        }

        // Todas as publicações desta página são atividades
        const tipoPost = 'atividade';

        // Calcula automaticamente os pontos
        const points = calcularPontos(sport);

        const postId = S.id('post');

        try {
          $('#publish-button').disabled = true;

          S.change(data => {
            if (!data.currentUserId) {
              throw new Error('Entre na sua conta novamente.');
            }

            data.posts.unshift({
              id: postId,
              userId: data.currentUserId,
              tipo: tipoPost,
              texto: caption,
              imagens: [...photos],
              esporte: sport,
              metric: type,
              distanciaMetros: distance,
              pontos: points,
              tempo: $('#duration').value.trim(),
              localizacao: $('#location').value.trim(),
              latitude: coordinates?.latitude ?? null,
              longitude: coordinates?.longitude ?? null,
              createdAt: new Date().toISOString(),
              curtidas: [],
              comentarios: []
            });
          });

          sessionStorage.setItem(
            'fitSocialToast',
            `Atividade registrada! Você ganhou ${points} ponto(s).`
          );

          location.href = 'index.html#post-' + postId;

        } catch (error) {
          $('#publish-button').disabled = false;

          $('#compose-error').textContent =
            error.name === 'QuotaExceededError'
              ? 'O armazenamento está cheio. Tente usar menos fotos.'
              : error.message;
        }
      });
    }
  };
})();

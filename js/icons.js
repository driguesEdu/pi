/* Ícones vetoriais locais: uma linguagem visual para todas as páginas. */
window.icon = (name, className = '') => {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z"/><path d="M7 11h.01M12 11h.01M17 11h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-6-6L3 21"/>',
    camera: '<path d="M8 5 9.5 3h5L16 5h4a1 1 0 0 1 1 1v13H3V6a1 1 0 0 1 1-1Z"/><circle cx="12" cy="12" r="4"/>',
    trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-5 3h10m-7-3h4v3"/>',
    route: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7"/>',
    run: '<circle cx="16" cy="4" r="2"/><path d="m7 21 3-7-3-3 5-5 4 4 5 1m-9-5 1 7 4 3v5M3 11l4-5h5"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m8 21 4-8 1-6m0 1 4 4 3 1M5 12l4-4 4-1m-1 6 4 8"/>',
    bike: '<circle cx="5.5" cy="16.5" r="4"/><circle cx="18.5" cy="16.5" r="4"/><path d="m5.5 16.5 5-9 4 9h-9L13 5h3m-9 2h5m3-4h3"/>',
    swim: '<path d="M2 19q3-3 5 0 3 3 5 0 3-3 5 0 3 3 5 0M2 14q3-3 5 0 3 3 5 0 3-3 5 0 3 3 5 0M6 11l5-5 5 2 3 4"/><circle cx="17" cy="4" r="2"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6Zm0-4v4m9 1-4 3m1 10-3-4m-6 4 3-4M3 8l4 3"/>',
    weight: '<path d="m6 6 12 12M3 8l5-5m8 18 5-5M2 6l4-4m12 20 4-4M4 10l6-6m4 16 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    send: '<path d="m22 2-7 20-4-9L2 9 22 2ZM11 13 22 2"/>',
    edit: '<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
    logout: '<path d="M9 3H4v18h5m6-14 5 5-5 5m-7-5h12"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    mountain: '<path d="m2 20 7-13 4 7 3-5 6 11Zm4-7 3 2 3-2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.ball}</svg>`;
};

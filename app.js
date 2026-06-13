const refs = {
  capitalSelector: document.getElementById("capital-selector"),
  cidade: document.getElementById("cidade"),
  latitude: document.getElementById("latitude"),
  orientacao: document.getElementById("orientacao"),
  orientacaoTexto: document.getElementById("orientacao-texto"),
  janelaLargura: document.getElementById("janela-largura"),
  janelaAltura: document.getElementById("janela-altura"),

  bhAtivo: document.getElementById("bh-ativo"),
  bhNumero: document.getElementById("bh-numero"),
  bhEspacamento: document.getElementById("bh-espacamento"),
  bhAngulo: document.getElementById("bh-angulo"),
  bhDistancia: document.getElementById("bh-distancia"),
  bhProfundidade: document.getElementById("bh-profundidade"),
  bhOffsetTopo: document.getElementById("bh-offset-topo"),
  bhSobreposicao: document.getElementById("bh-sobreposicao"),

  bveAtivo: document.getElementById("bv-esq-ativo"),
  bveProjecao: document.getElementById("bv-esq-projecao"),
  bveOffset: document.getElementById("bv-esq-offset"),
  bveTop: document.getElementById("bv-esq-top"),
  bveBottom: document.getElementById("bv-esq-bottom"),

  bvdAtivo: document.getElementById("bv-dir-ativo"),
  bvdProjecao: document.getElementById("bv-dir-projecao"),
  bvdOffset: document.getElementById("bv-dir-offset"),
  bvdTop: document.getElementById("bv-dir-top"),
  bvdBottom: document.getElementById("bv-dir-bottom"),

  mqAtivo: document.getElementById("mq-ativo"),
  mqOffsetTopo: document.getElementById("mq-offset-topo"),
  mqProjecao: document.getElementById("mq-projecao"),
  mqSobreposicao: document.getElementById("mq-sobreposicao"),

  cidadeDisplay: document.getElementById("cidade-display"),
  latDisplay: document.getElementById("lat-display"),
  resumo: document.getElementById("resumo"),
  canvas: document.getElementById("solar-canvas"),
  chartCard: document.querySelector(".chart-card"),
  downloadSolarChart: document.getElementById("download-solar-chart"),
  splashScreen: document.getElementById("splash-screen"),

  openWindowShadow: document.getElementById("open-window-shadow"),
  windowShadowModal: document.getElementById("window-shadow-modal"),
  closeWindowShadow: document.getElementById("close-window-shadow"),
  windowShadowCanvas: document.getElementById("window-shadow-canvas"),
  shadowDate: document.getElementById("shadow-date"),
  shadowTime: document.getElementById("shadow-time"),
  shadowDateText: document.getElementById("shadow-date-text"),
  shadowTimeText: document.getElementById("shadow-time-text"),
  windowShadowStatus: document.getElementById("window-shadow-status")
};

const ctx = refs.canvas.getContext("2d");
const shadowCtx = refs.windowShadowCanvas.getContext("2d");
const DEG = Math.PI / 180;
let renderFrame = 0;
const SOLAR_MONTH_PATHS = [
  { labels: [{ text: "jun", hour: 8 }], declination: 23.44 },
  { labels: [{ text: "mai", hour: 8 }, { text: "jul", hour: 16 }], declination: 20 },
  { labels: [{ text: "abr", hour: 8 }, { text: "ago", hour: 16 }], declination: 11.5 },
  { labels: [{ text: "mar", hour: 8 }, { text: "set", hour: 16 }], declination: 0 },
  { labels: [{ text: "fev", hour: 8 }, { text: "out", hour: 16 }], declination: -11.5 },
  { labels: [{ text: "jan", hour: 8 }, { text: "nov", hour: 16 }], declination: -20 },
  { labels: [{ text: "dez", hour: 16 }], declination: -23.44 }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrap180(angleDeg) {
  let a = angleDeg;
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
}

function getState() {
  return {
    local: {
      cidade: refs.cidade.value.trim() || "(sem nome)",
      latitude: clamp(Number(refs.latitude.value) || 0, -90, 90),
      orientacao: ((Number(refs.orientacao.value) || 0) % 360 + 360) % 360
    },
    janela: {
      largura: Math.max(0.1, Number(refs.janelaLargura.value) || 1.2),
      altura: Math.max(0.1, Number(refs.janelaAltura.value) || 1.5)
    },
    briseHorizontal: {
      ativo: refs.bhAtivo.checked,
      numero: Math.max(1, Math.floor(Number(refs.bhNumero.value) || 1)),
      espacamento: Math.max(0, Number(refs.bhEspacamento.value) || 0),
      angulo: Number(refs.bhAngulo.value) || 0,
      distancia: Math.max(0, Number(refs.bhDistancia.value) || 0),
      profundidade: Math.max(0, Number(refs.bhProfundidade.value) || 0),
      offsetTopo: Math.max(0, Number(refs.bhOffsetTopo.value) || 0),
      sobreposicao: Math.max(0, Number(refs.bhSobreposicao.value) || 0)
    },
    briseVertical: {
      esquerdo: {
        ativo: refs.bveAtivo.checked,
        projecao: Math.max(0, Number(refs.bveProjecao.value) || 0),
        offset: Math.max(0, Number(refs.bveOffset.value) || 0),
        top: Math.max(0, Number(refs.bveTop.value) || 0),
        bottom: Math.max(0, Number(refs.bveBottom.value) || 0)
      },
      direito: {
        ativo: refs.bvdAtivo.checked,
        projecao: Math.max(0, Number(refs.bvdProjecao.value) || 0),
        offset: Math.max(0, Number(refs.bvdOffset.value) || 0),
        top: Math.max(0, Number(refs.bvdTop.value) || 0),
        bottom: Math.max(0, Number(refs.bvdBottom.value) || 0)
      }
    },
    marquise: {
      ativo: refs.mqAtivo.checked,
      offsetTopo: Math.max(0, Number(refs.mqOffsetTopo.value) || 0),
      projecao: Math.max(0, Number(refs.mqProjecao.value) || 0),
      sobreposicao: Math.max(0, Number(refs.mqSobreposicao.value) || 0)
    }
  };
}

function stereographicProject(altDeg, azDeg, center, radius) {
  const alt = altDeg * DEG;
  const az = azDeg * DEG;
  const rNorm = Math.tan((Math.PI / 2 - alt) / 2);
  const r = rNorm * radius;
  const x = center.x + r * Math.sin(az);
  const y = center.y - r * Math.cos(az);
  return { x, y };
}

function solarPositionFromDecHour(latitudeDeg, declinationDeg, hourAngleDeg) {
  const lat = latitudeDeg * DEG;
  const dec = declinationDeg * DEG;
  const h = hourAngleDeg * DEG;

  const east = Math.cos(dec) * Math.sin(h);
  const north = Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(h);
  const up = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h);

  if (up <= 0) return null;

  const altitude = Math.asin(clamp(up, -1, 1)) / DEG;
  const azimuth = (Math.atan2(east, north) / DEG + 360) % 360;
  return { altitude, azimuth };
}

function solarPositionOnHorizon(latitudeDeg, declinationDeg, hourAngleDeg) {
  const lat = latitudeDeg * DEG;
  const dec = declinationDeg * DEG;
  const h = hourAngleDeg * DEG;
  const east = Math.cos(dec) * Math.sin(h);
  const north = Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(h);
  const azimuth = (Math.atan2(east, north) / DEG + 360) % 360;

  return { altitude: 0, azimuth };
}

function getSunriseHourAngle(latitudeDeg, declinationDeg) {
  const lat = latitudeDeg * DEG;
  const dec = declinationDeg * DEG;
  const cosHourAngle = -Math.tan(lat) * Math.tan(dec);

  if (cosHourAngle < -1 || cosHourAngle > 1) return null;
  return Math.acos(clamp(cosHourAngle, -1, 1)) / DEG;
}

function sunVectorFacade(altitudeDeg, azimuthDeg, facadeAzimuthDeg) {
  const alt = altitudeDeg * DEG;
  const psi = wrap180(azimuthDeg - facadeAzimuthDeg) * DEG;
  return {
    sx: Math.cos(alt) * Math.cos(psi),
    sy: Math.cos(alt) * Math.sin(psi),
    sz: Math.sin(alt)
  };
}

function intersectsMarquise(point, sun, state) {
  const mq = state.marquise;
  if (!mq.ativo || mq.projecao <= 0) return false;

  const zPlane = state.janela.altura + mq.offsetTopo;
  if (sun.sz <= 0) return false;

  const t = (zPlane - point.z) / sun.sz;
  if (t <= 0) return false;

  const xi = t * sun.sx;
  if (xi < 0 || xi > mq.projecao) return false;

  const yMin = -mq.sobreposicao;
  const yMax = state.janela.largura + mq.sobreposicao;
  const yi = point.y + t * sun.sy;
  return yi >= yMin && yi <= yMax;
}

function intersectsSidefins(point, sun, state) {
  const { altura, largura } = state.janela;
  const { esquerdo, direito } = state.briseVertical;

  if (esquerdo.ativo && esquerdo.projecao > 0 && sun.sy < 0) {
    const yPlane = -esquerdo.offset;
    const t = (yPlane - point.y) / sun.sy;
    if (t > 0) {
      const xi = t * sun.sx;
      const zi = point.z + t * sun.sz;
      if (xi >= 0 && xi <= esquerdo.projecao && zi >= -esquerdo.bottom && zi <= altura + esquerdo.top) {
        return true;
      }
    }
  }

  if (direito.ativo && direito.projecao > 0 && sun.sy > 0) {
    const yPlane = largura + direito.offset;
    const t = (yPlane - point.y) / sun.sy;
    if (t > 0) {
      const xi = t * sun.sx;
      const zi = point.z + t * sun.sz;
      if (xi >= 0 && xi <= direito.projecao && zi >= -direito.bottom && zi <= altura + direito.top) {
        return true;
      }
    }
  }

  return false;
}

function intersectsLouvres(point, sun, state) {
  const b = state.briseHorizontal;
  if (!b.ativo || b.numero <= 0 || b.profundidade <= 0) return false;

  const yMin = -b.sobreposicao;
  const yMax = state.janela.largura + b.sobreposicao;
  const ang = b.angulo * DEG;

  const ux = Math.cos(ang);
  const uz = -Math.sin(ang);
  const nx = -uz;
  const nz = -ux;

  for (let i = 0; i < b.numero; i += 1) {
    const z0 = state.janela.altura + b.offsetTopo - i * b.espacamento;
    const x0 = b.distancia;

    const numerator = nx * (x0 - 0) + nz * (z0 - point.z);
    const denominator = nx * sun.sx + nz * sun.sz;
    if (Math.abs(denominator) < 1e-9) continue;

    const t = numerator / denominator;
    if (t <= 0) continue;

    const qx = t * sun.sx;
    const qy = point.y + t * sun.sy;
    const qz = point.z + t * sun.sz;
    if (qy < yMin || qy > yMax) continue;

    const lambda = (qx - x0) * ux + (qz - z0) * uz;
    if (lambda >= 0 && lambda <= b.profundidade) {
      return true;
    }
  }

  return false;
}

function isBlockedByBrises(altitudeDeg, azimuthDeg, state) {
  if (altitudeDeg <= 0) return false;

  const relative = wrap180(azimuthDeg - state.local.orientacao);
  if (Math.abs(relative) > 90) return false;

  const sun = sunVectorFacade(altitudeDeg, azimuthDeg, state.local.orientacao);
  if (sun.sx <= 0) return false;

  const point = {
    y: state.janela.largura / 2,
    z: state.janela.altura / 2
  };

  return intersectsMarquise(point, sun, state) ||
    intersectsSidefins(point, sun, state) ||
    intersectsLouvres(point, sun, state);
}

function drawBaseChart(center, radius) {
  ctx.clearRect(0, 0, refs.canvas.width, refs.canvas.height);

  ctx.save();
  ctx.fillStyle = "#fffdf9";
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#c8b89f";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let alt = 10; alt < 90; alt += 10) {
    const r = Math.tan((Math.PI / 2 - alt * DEG) / 2) * radius;
    ctx.strokeStyle = "#ded3c2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#8f8578";
    ctx.font = "12px 'IBM Plex Sans'";
    ctx.fillText(`${alt}°`, center.x + 6, center.y - r - 4);
  }

  for (let az = 0; az < 360; az += 15) {
    const p1 = stereographicProject(0, az, center, radius);
    const p2 = stereographicProject(90, az, center, radius);
    ctx.strokeStyle = az % 45 === 0 ? "#cbbca8" : "#e3daca";
    ctx.lineWidth = az % 45 === 0 ? 1.2 : 0.8;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  const labels = [
    { az: 0, txt: "N" },
    { az: 45, txt: "NE" },
    { az: 90, txt: "L" },
    { az: 135, txt: "SE" },
    { az: 180, txt: "S" },
    { az: 225, txt: "SO" },
    { az: 270, txt: "O" },
    { az: 315, txt: "NO" }
  ];

  ctx.fillStyle = "#4a4035";
  ctx.font = "600 13px 'Sora'";
  labels.forEach((l) => {
    const p = stereographicProject(0, l.az, center, radius + 18);
    ctx.fillText(l.txt, p.x - 8, p.y + 5);
  });

  ctx.restore();
}

function drawSolarDatePaths(state, center, radius) {
  const latitude = state.local.latitude;

  SOLAR_MONTH_PATHS.forEach((path) => {
    const dec = path.declination;
    const labelText = path.labels.map((label) => label.text).join("-");
    const isSolstice = labelText.includes("jun") || labelText.includes("dez");
    const isEquinox = labelText.includes("mar") || labelText.includes("set");
    const sunriseHourAngle = getSunriseHourAngle(latitude, dec);
    let started = false;

    if (sunriseHourAngle === null) return;

    ctx.beginPath();
    const start = solarPositionOnHorizon(latitude, dec, -sunriseHourAngle);
    const startPoint = stereographicProject(start.altitude, start.azimuth, center, radius);
    ctx.moveTo(startPoint.x, startPoint.y);
    started = true;

    for (let h = Math.ceil(-sunriseHourAngle); h <= Math.floor(sunriseHourAngle); h += 1) {
      const pos = solarPositionFromDecHour(latitude, dec, h);
      if (!pos) continue;
      const p = stereographicProject(pos.altitude, pos.azimuth, center, radius);
      ctx.lineTo(p.x, p.y);
    }

    const end = solarPositionOnHorizon(latitude, dec, sunriseHourAngle);
    const endPoint = stereographicProject(end.altitude, end.azimuth, center, radius);
    ctx.lineTo(endPoint.x, endPoint.y);

    ctx.strokeStyle = isSolstice || isEquinox ? "#0f5f7a" : "#3d879f";
    ctx.lineWidth = isSolstice || isEquinox ? 1.6 : 1;
    if (started) ctx.stroke();

  });
}

function drawSolarMonthLabels(state, center, radius) {
  const latitude = state.local.latitude;

  SOLAR_MONTH_PATHS.forEach((path) => {
    path.labels.forEach((label) => {
      drawSolarMonthLabel(latitude, path.declination, label, center, radius);
    });
  });
}

function drawSolarMonthLabel(latitude, declination, label, center, radius) {
  const preferredHours = [
    label.hour,
    label.hour - 0.5,
    label.hour + 0.5
  ];

  const hour = preferredHours.find((candidate) => {
    const position = solarPositionFromDecHour(latitude, declination, (candidate - 12) * 15);
    if (!position) return false;
    const point = stereographicProject(position.altitude, position.azimuth, center, radius);
    const distance = Math.hypot(point.x - center.x, point.y - center.y);
    return distance < radius - 12;
  });

  if (hour === undefined) return;

  const position = solarPositionFromDecHour(latitude, declination, (hour - 12) * 15);
  const point = stereographicProject(position.altitude, position.azimuth, center, radius);
  const text = label.text;

  ctx.save();
  ctx.font = "600 10px 'IBM Plex Sans'";
  const textWidth = ctx.measureText(text).width;
  const x = point.x - textWidth / 2;
  const y = point.y - 6;

  ctx.fillStyle = "#0f5f7a";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawHourLines(state, center, radius) {
  const latitude = state.local.latitude;
  for (let hour = 6; hour <= 18; hour += 1) {
    const hourAngle = (hour - 12) * 15;
    let started = false;
    ctx.beginPath();

    for (let dec = -23.44; dec <= 23.44; dec += 0.5) {
      const pos = solarPositionFromDecHour(latitude, dec, hourAngle);
      if (!pos) continue;
      const p = stereographicProject(pos.altitude, pos.azimuth, center, radius);
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    if (started) {
      ctx.strokeStyle = "#4c9464";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      const labelPos = solarPositionFromDecHour(latitude, 0, hourAngle);
      if (labelPos) {
        const label = stereographicProject(labelPos.altitude, labelPos.azimuth, center, radius);
        ctx.fillStyle = "#3a744e";
        ctx.font = "11px 'IBM Plex Sans'";
        ctx.fillText(`${hour}h`, label.x + 4, label.y - 2);
      }
    }
  }
}

function drawFacadeDirection(state, center, radius) {
  const az = state.local.orientacao;
  const p = stereographicProject(0, az, center, radius);

  ctx.strokeStyle = "#7b3f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();

  ctx.fillStyle = "#7b3f2a";
  ctx.font = "600 12px 'Sora'";
  ctx.fillText("Normal da fachada", p.x + 8, p.y + 2);
}

function drawFacadePlaneLine(state, center, radius) {
  const az = state.local.orientacao + 90;
  const p1 = stereographicProject(0, az, center, radius);
  const p2 = stereographicProject(0, az + 180, center, radius);

  ctx.save();
  ctx.strokeStyle = "rgba(122, 24, 19, 0.22)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.strokeStyle = "#7a1813";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.fillStyle = "#7a1813";
  ctx.font = "600 11px 'Sora'";
  ctx.fillText("Linha da fachada", p1.x + 8, p1.y - 8);
  ctx.restore();
}

function drawShadeMask(state, center, radius) {
  const stepAlt = 1;
  const stepAz = 1;
  let blockedCount = 0;
  let frontCount = 0;

  ctx.fillStyle = "rgba(186, 77, 45, 0.32)";

  for (let alt = 0; alt <= 90; alt += stepAlt) {
    for (let az = 0; az < 360; az += stepAz) {
      const relative = wrap180(az - state.local.orientacao);
      if (Math.abs(relative) > 90) continue;

      frontCount += 1;
      if (!isBlockedByBrises(alt, az, state)) continue;
      blockedCount += 1;

      const p = stereographicProject(alt, az, center, radius);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return {
    blockedCount,
    frontCount,
    ratio: frontCount > 0 ? blockedCount / frontCount : 0
  };
}

function updateSummary(state, maskStats) {
  refs.cidadeDisplay.textContent = state.local.cidade;
  refs.latDisplay.textContent = `${state.local.latitude.toFixed(2)}°`;
  refs.orientacaoTexto.textContent = `${Math.round(state.local.orientacao)}°`;

  const active = [];
  if (state.briseHorizontal.ativo) active.push("Brise horizontal");
  if (state.briseVertical.esquerdo.ativo || state.briseVertical.direito.ativo) active.push("Brise vertical");
  if (state.marquise.ativo) active.push("Marquise");

  const percent = (maskStats.ratio * 100).toFixed(1);
  const directSunStats = estimateBlockedDirectSunHours(state);
  refs.resumo.innerHTML = [
    `<strong>Protecoes ativas:</strong> ${active.length ? active.join(", ") : "Nenhuma"}`,
    `<strong>Cobertura estimada da mascara:</strong> ${percent}% da abobada visivel a frente da fachada`,
    `<strong>Horas de insolacao direta bloqueada:</strong> ${directSunStats.percent}% (${directSunStats.blockedHours} h de ${directSunStats.directHours} h/ano estimadas)`,
    `<strong>Dimensoes da janela:</strong> ${state.janela.largura.toFixed(2)} m x ${state.janela.altura.toFixed(2)} m`,
    `<em>Observacao: os percentuais da carta solar levam em conta o ponto central da janela.</em>`
  ].join("<br>");
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
  return Math.floor(diff / 86400000);
}

function formatDayOfYear(day) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const date = new Date(Date.UTC(2026, 0, Number(day)));
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

function formatSolarTime(hour) {
  const totalMinutes = Math.round(Number(hour) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function declinationFromDay(day) {
  return 23.44 * Math.sin(DEG * ((360 * (284 + Number(day))) / 365));
}

function estimateBlockedDirectSunHours(state) {
  const hourStep = 0.25;
  let directHours = 0;
  let blockedHours = 0;

  for (let day = 1; day <= 365; day += 1) {
    const declination = declinationFromDay(day);

    for (let hour = 0; hour < 24; hour += hourStep) {
      const hourAngle = (hour - 12) * 15;
      const position = solarPositionFromDecHour(state.local.latitude, declination, hourAngle);
      if (!position) continue;

      const relative = wrap180(position.azimuth - state.local.orientacao);
      if (Math.abs(relative) > 90) continue;

      const sun = sunVectorFacade(position.altitude, position.azimuth, state.local.orientacao);
      if (sun.sx <= 0) continue;

      directHours += hourStep;
      if (isBlockedByBrises(position.altitude, position.azimuth, state)) {
        blockedHours += hourStep;
      }
    }
  }

  const percent = directHours > 0 ? (blockedHours / directHours) * 100 : 0;
  return {
    percent: percent.toFixed(1),
    blockedHours: Math.round(blockedHours).toLocaleString("pt-BR"),
    directHours: Math.round(directHours).toLocaleString("pt-BR")
  };
}

function getShadowSun(state) {
  const day = Number(refs.shadowDate.value);
  const hour = Number(refs.shadowTime.value);
  const declination = declinationFromDay(day);
  const hourAngle = (hour - 12) * 15;
  const position = solarPositionFromDecHour(state.local.latitude, declination, hourAngle);

  refs.shadowDateText.textContent = formatDayOfYear(day);
  refs.shadowTimeText.textContent = formatSolarTime(hour);

  if (!position) {
    return { position: null, sun: null, direct: false, reason: "Sol abaixo do horizonte." };
  }

  const relative = wrap180(position.azimuth - state.local.orientacao);
  const sun = sunVectorFacade(position.altitude, position.azimuth, state.local.orientacao);
  const direct = Math.abs(relative) <= 90 && sun.sx > 0;

  return {
    position,
    sun,
    direct,
    reason: direct ? "" : "Sol sem incidencia direta na fachada."
  };
}

function resizeShadowCanvasForDpr() {
  const dpr = window.devicePixelRatio || 1;
  const slot = refs.windowShadowCanvas.parentElement;
  const rect = slot.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  refs.windowShadowCanvas.width = width * dpr;
  refs.windowShadowCanvas.height = height * dpr;
  shadowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { width, height };
}

function getWindowPreviewRect(width, height, state) {
  const margin = 44;
  const maxWidth = Math.max(80, width - margin * 2);
  const maxHeight = Math.max(80, height - margin * 2);
  const ratio = state.janela.largura / state.janela.altura;
  let w = maxWidth;
  let h = w / ratio;

  if (h > maxHeight) {
    h = maxHeight;
    w = h * ratio;
  }

  return {
    x: (width - w) / 2,
    y: (height - h) / 2,
    w,
    h
  };
}

function isWindowPointBlocked(point, sun, state) {
  return intersectsMarquise(point, sun, state) ||
    intersectsSidefins(point, sun, state) ||
    intersectsLouvres(point, sun, state);
}

function drawWindowPreviewBase(rect, state, hasDirectSun = true) {
  const width = refs.windowShadowCanvas.width / (window.devicePixelRatio || 1);
  const height = refs.windowShadowCanvas.height / (window.devicePixelRatio || 1);

  shadowCtx.fillStyle = "#f4eadc";
  shadowCtx.fillRect(0, 0, width, height);

  shadowCtx.save();
  shadowCtx.fillStyle = hasDirectSun ? "#d7eaf0" : "#e5ded4";
  shadowCtx.strokeStyle = "#2f5c68";
  shadowCtx.lineWidth = 3;
  shadowCtx.fillRect(rect.x, rect.y, rect.w, rect.h);
  shadowCtx.strokeRect(rect.x, rect.y, rect.w, rect.h);

  shadowCtx.strokeStyle = "rgba(47, 92, 104, 0.45)";
  shadowCtx.lineWidth = 1.2;
  shadowCtx.beginPath();
  shadowCtx.moveTo(rect.x + rect.w / 2, rect.y);
  shadowCtx.lineTo(rect.x + rect.w / 2, rect.y + rect.h);
  shadowCtx.moveTo(rect.x, rect.y + rect.h / 2);
  shadowCtx.lineTo(rect.x + rect.w, rect.y + rect.h / 2);
  shadowCtx.stroke();

  shadowCtx.fillStyle = "#4a4035";
  shadowCtx.font = "600 12px 'IBM Plex Sans'";
  shadowCtx.fillText(`${state.janela.largura.toFixed(2)} m`, rect.x + rect.w / 2 - 24, rect.y + rect.h + 24);
  shadowCtx.save();
  shadowCtx.translate(rect.x - 28, rect.y + rect.h / 2 + 24);
  shadowCtx.rotate(-Math.PI / 2);
  shadowCtx.fillText(`${state.janela.altura.toFixed(2)} m`, 0, 0);
  shadowCtx.restore();
  shadowCtx.restore();
}

function drawWindowShadowMask(rect, state, sun) {
  const columns = clamp(Math.round(rect.w / 6), 45, 170);
  const rows = clamp(Math.round(rect.h / 6), 45, 170);
  let blocked = 0;
  const total = columns * rows;

  shadowCtx.save();
  shadowCtx.beginPath();
  shadowCtx.rect(rect.x, rect.y, rect.w, rect.h);
  shadowCtx.clip();
  shadowCtx.fillStyle = "rgba(122, 24, 19, 0.48)";

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const point = {
        y: state.janela.largura * ((col + 0.5) / columns),
        z: state.janela.altura * (1 - (row + 0.5) / rows)
      };

      if (!isWindowPointBlocked(point, sun, state)) continue;
      blocked += 1;

      const x = rect.x + (col / columns) * rect.w;
      const y = rect.y + (row / rows) * rect.h;
      const w = Math.ceil(rect.w / columns) + 0.5;
      const h = Math.ceil(rect.h / rows) + 0.5;
      shadowCtx.fillRect(x, y, w, h);
    }
  }

  shadowCtx.restore();
  return total > 0 ? blocked / total : 0;
}

function renderWindowShadow(state = getState()) {
  if (!refs.windowShadowModal.classList.contains("open")) return;

  const { width, height } = resizeShadowCanvasForDpr();
  const rect = getWindowPreviewRect(width, height, state);
  const solar = getShadowSun(state);

  shadowCtx.clearRect(0, 0, width, height);
  drawWindowPreviewBase(rect, state, solar.direct);

  if (!solar.direct) {
    refs.windowShadowStatus.textContent = solar.reason;
    return;
  }

  const ratio = drawWindowShadowMask(rect, state, solar.sun);
  refs.windowShadowStatus.textContent = `Area sombreada pelos brises: ${(ratio * 100).toFixed(1)}%`;
}

function openWindowShadowModal() {
  refs.windowShadowModal.classList.add("open");
  refs.windowShadowModal.setAttribute("aria-hidden", "false");
  renderWindowShadow();
}

function closeWindowShadowModal() {
  refs.windowShadowModal.classList.remove("open");
  refs.windowShadowModal.setAttribute("aria-hidden", "true");
}

function getSafeFilePart(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "carta-solar";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getRelativeRect(element, parentRect) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - parentRect.left,
    y: rect.top - parentRect.top,
    w: rect.width,
    h: rect.height
  };
}

function drawRoundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function setTextStyle(context, element, weightOverride = "") {
  const style = window.getComputedStyle(element);
  const weight = weightOverride || style.fontWeight;
  context.fillStyle = style.color;
  context.font = `${weight} ${style.fontSize} ${style.fontFamily}`;
  context.textBaseline = "top";
}

function drawElementText(context, element, parentRect, weightOverride = "") {
  const rect = getRelativeRect(element, parentRect);
  setTextStyle(context, element, weightOverride);
  context.fillText(element.innerText.trim(), rect.x, rect.y);
}

function drawExportCardBackground(context, width, height) {
  const style = window.getComputedStyle(refs.chartCard);
  const radius = parseFloat(style.borderRadius) || 16;

  context.fillStyle = style.backgroundColor || "#fffdfa";
  drawRoundedRect(context, 0.5, 0.5, width - 1, height - 1, radius);
  context.fill();
  context.strokeStyle = style.borderColor || "#d7cec0";
  context.lineWidth = 1;
  context.stroke();
}

function drawExportSolarCanvas(context, parentRect) {
  const canvasRect = getRelativeRect(refs.canvas, parentRect);

  context.save();
  drawRoundedRect(context, canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h, 14);
  context.clip();
  context.fillStyle = "#fff8f0";
  context.fillRect(canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h);
  context.drawImage(refs.canvas, canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h);
  context.restore();

  context.strokeStyle = "#d4c6b3";
  context.lineWidth = 1;
  drawRoundedRect(context, canvasRect.x, canvasRect.y, canvasRect.w, canvasRect.h, 14);
  context.stroke();
}

function drawExportLegend(context, parentRect) {
  const legend = refs.chartCard.querySelector(".legend");
  const legendStyle = window.getComputedStyle(legend);

  context.font = `${legendStyle.fontWeight} ${legendStyle.fontSize} ${legendStyle.fontFamily}`;
  context.textBaseline = "top";
  context.fillStyle = legendStyle.color;

  legend.querySelectorAll("div").forEach((item) => {
    const itemRect = getRelativeRect(item, parentRect);
    const swatch = item.querySelector(".swatch");
    const swatchRect = getRelativeRect(swatch, parentRect);
    const swatchStyle = window.getComputedStyle(swatch);

    context.fillStyle = swatchStyle.backgroundColor;
    context.fillRect(swatchRect.x, swatchRect.y, swatchRect.w, swatchRect.h);
    context.fillStyle = legendStyle.color;
    context.fillText(item.textContent.trim(), itemRect.x + 24, itemRect.y);
  });
}

function drawSummaryTextLine(context, line, x, y, style) {
  const colonIndex = line.indexOf(":");

  if (colonIndex > 0 && !line.startsWith("Observacao")) {
    const label = line.slice(0, colonIndex + 1);
    const value = line.slice(colonIndex + 1);
    context.font = `700 ${style.fontSize} ${style.fontFamily}`;
    context.fillText(label, x, y);
    const labelWidth = context.measureText(label).width;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.fillText(value, x + labelWidth + 4, y);
    return;
  }

  context.font = line.startsWith("Observacao")
    ? `italic ${style.fontSize} ${style.fontFamily}`
    : `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.fillText(line, x, y);
}

function drawExportSummary(context, parentRect) {
  const summary = refs.resumo;
  const rect = getRelativeRect(summary, parentRect);
  const style = window.getComputedStyle(summary);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.35;

  context.strokeStyle = "#d5c3a9";
  context.setLineDash([3, 3]);
  context.beginPath();
  context.moveTo(rect.x, rect.y);
  context.lineTo(rect.x + rect.w, rect.y);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = style.color;
  summary.innerText.split("\n").forEach((line, index) => {
    drawSummaryTextLine(context, line.trim(), rect.x, rect.y + 10 + index * lineHeight, style);
  });
}

function downloadSolarChartImage() {
  render();

  const state = getState();
  const cardRect = refs.chartCard.getBoundingClientRect();
  const width = Math.ceil(cardRect.width);
  const height = Math.ceil(cardRect.height);
  const scale = 2;
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  exportCtx.scale(scale, scale);
  drawExportCardBackground(exportCtx, width, height);
  drawElementText(exportCtx, refs.chartCard.querySelector(".chart-head h2"), cardRect);
  drawElementText(exportCtx, refs.chartCard.querySelector(".chart-head p"), cardRect);
  drawExportSolarCanvas(exportCtx, cardRect);
  drawExportLegend(exportCtx, cardRect);
  drawExportSummary(exportCtx, cardRect);

  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `carta-solar-${getSafeFilePart(state.local.cidade)}-${today}.png`);
  }, "image/png");
}

function resizeCanvasForDpr() {
  const dpr = window.devicePixelRatio || 1;
  const slot = refs.canvas.parentElement;
  const rect = slot.getBoundingClientRect();
  const size = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));

  refs.canvas.style.width = `${size}px`;
  refs.canvas.style.height = `${size}px`;
  refs.canvas.width = size * dpr;
  refs.canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function render() {
  resizeCanvasForDpr();
  const state = getState();

  const width = refs.canvas.width / (window.devicePixelRatio || 1);
  const height = refs.canvas.height / (window.devicePixelRatio || 1);
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.44;

  drawBaseChart(center, radius);
  drawSolarDatePaths(state, center, radius);
  drawHourLines(state, center, radius);
  const stats = drawShadeMask(state, center, radius);
  drawSolarMonthLabels(state, center, radius);
  drawFacadePlaneLine(state, center, radius);
  drawFacadeDirection(state, center, radius);
  updateSummary(state, stats);
  renderWindowShadow(state);
}

function scheduleRender() {
  if (renderFrame) cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    render();
  });
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.classList.add("active");
    });
  });
}

function bindInputs() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", render);
    input.addEventListener("change", render);
  });

  refs.capitalSelector.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "custom") {
      refs.cidade.disabled = false;
      refs.latitude.disabled = false;
      return;
    }

    const [lat, lon, city] = val.split(":");
    refs.latitude.value = parseFloat(lat);
    refs.cidade.value = city;
    refs.cidade.disabled = true;
    refs.latitude.disabled = true;
    render();
  });

  refs.cidade.addEventListener("input", () => {
    if (refs.cidade.disabled) return;
    refs.capitalSelector.value = "custom";
  });

  refs.latitude.addEventListener("input", () => {
    if (refs.latitude.disabled) return;
    refs.capitalSelector.value = "custom";
  });

  window.addEventListener("resize", scheduleRender);

  refs.downloadSolarChart.addEventListener("click", downloadSolarChartImage);
  refs.openWindowShadow.addEventListener("click", openWindowShadowModal);
  refs.closeWindowShadow.addEventListener("click", closeWindowShadowModal);
  refs.windowShadowModal.addEventListener("click", (event) => {
    if (event.target === refs.windowShadowModal) closeWindowShadowModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && refs.windowShadowModal.classList.contains("open")) {
      closeWindowShadowModal();
    }
  });
}

function initApp() {
  const selected = refs.capitalSelector.value;
  if (selected !== "custom") {
    refs.cidade.disabled = true;
    refs.latitude.disabled = true;
  }

  refs.shadowDate.value = getDayOfYear(new Date());
}

function initLayoutObservers() {
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleRender);
    observer.observe(refs.canvas.parentElement);
    observer.observe(refs.chartCard);
  }

  window.addEventListener("load", scheduleRender);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleRender);
  }
}

function initSplashScreen() {
  window.setTimeout(() => {
    refs.splashScreen.classList.add("hidden");
    window.setTimeout(() => refs.splashScreen.remove(), 450);
  }, 5000);
}

initTabs();
bindInputs();
initApp();
render();
requestAnimationFrame(scheduleRender);
initLayoutObservers();
initSplashScreen();

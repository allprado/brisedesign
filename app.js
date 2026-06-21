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
  bhEspacamentoDisplay: document.getElementById("bh-espacamento-display"),
  bhAngulo: document.getElementById("bh-angulo"),
  bhDistancia: document.getElementById("bh-distancia"),
  bhProfundidade: document.getElementById("bh-profundidade"),
  bhEspessura: document.getElementById("bh-espessura"),
  bhOffsetTopo: document.getElementById("bh-offset-topo"),
  bhSobreposicao: document.getElementById("bh-sobreposicao"),

  bveAtivo: document.getElementById("bv-esq-ativo"),
  bveProjecao: document.getElementById("bv-esq-projecao"),
  bveEspessura: document.getElementById("bv-esq-espessura"),
  bveOffset: document.getElementById("bv-esq-offset"),
  bveTop: document.getElementById("bv-esq-top"),

  bvdAtivo: document.getElementById("bv-dir-ativo"),
  bvdProjecao: document.getElementById("bv-dir-projecao"),
  bvdEspessura: document.getElementById("bv-dir-espessura"),
  bvdOffset: document.getElementById("bv-dir-offset"),
  bvdTop: document.getElementById("bv-dir-top"),

  mqAtivo: document.getElementById("mq-ativo"),
  mqOffsetTopo: document.getElementById("mq-offset-topo"),
  mqProjecao: document.getElementById("mq-projecao"),
  mqEspessura: document.getElementById("mq-espessura"),
  mqSobreposicao: document.getElementById("mq-sobreposicao"),

  cidadeDisplay: document.getElementById("cidade-display"),
  latDisplay: document.getElementById("lat-display"),
  resumo: document.getElementById("resumo"),
  canvas: document.getElementById("solar-canvas"),
  shadowPointTooltip: document.getElementById("shadow-point-tooltip"),
  solarChartLoadingOverlay: document.getElementById("solar-chart-loading-overlay"),
  maskUpdateOverlay: document.getElementById("mask-update-overlay"),
  updateMaskButton: document.getElementById("update-mask-button"),
  shadeMin: document.getElementById("shade-min"),
  shadeMax: document.getElementById("shade-max"),
  shadeMinDisplay: document.getElementById("shade-min-display"),
  shadeMaxDisplay: document.getElementById("shade-max-display"),
  heatScaleControl: document.querySelector(".heat-scale-control"),
  chartCard: document.querySelector(".chart-card"),
  chartActionsButton: document.getElementById("chart-actions-button"),
  chartActionsMenu: document.getElementById("chart-actions-menu"),
  downloadSolarChart: document.getElementById("download-solar-chart"),
  downloadSolarReport: document.getElementById("download-solar-report"),
  saveProject: document.getElementById("save-project"),
  loadProject: document.getElementById("load-project"),
  projectFileInput: document.getElementById("project-file-input"),
  splashScreen: document.getElementById("splash-screen"),
  uiBlocker: document.getElementById("ui-blocker"),
  uiBlockerMessage: document.getElementById("ui-blocker-message"),

  openWindowShadow: document.getElementById("open-window-shadow"),
  windowShadowModal: document.getElementById("window-shadow-modal"),
  closeWindowShadow: document.getElementById("close-window-shadow"),
  windowShadow3dCanvas: document.getElementById("window-shadow-3d-canvas"),
  windowShadowCanvas: document.getElementById("window-shadow-canvas"),
  shadowDate: document.getElementById("shadow-date"),
  shadowTime: document.getElementById("shadow-time"),
  shadowDateText: document.getElementById("shadow-date-text"),
  shadowTimeText: document.getElementById("shadow-time-text"),
  windowShadowStatus: document.getElementById("window-shadow-status"),

  windowModel3dSlot: document.getElementById("window-model-3d-slot"),
  windowModel3dCanvas: document.getElementById("window-model-3d-canvas"),
  windowModel3dStatus: document.getElementById("window-model-3d-status"),
  resetModel3dView: document.getElementById("reset-model-3d-view"),
  expandModel3d: document.getElementById("expand-model-3d"),
  model3dModal: document.getElementById("model-3d-modal"),
  model3dModalSlot: document.getElementById("model-3d-modal-slot"),
  resetModel3dViewModal: document.getElementById("reset-model-3d-view-modal"),
  closeModel3dModal: document.getElementById("close-model-3d-modal")
};

const ctx = refs.canvas.getContext("2d");
const shadowCtx = refs.windowShadowCanvas.getContext("2d");
const DEG = Math.PI / 180;
const MIN_HEATMAP_FRONT_COMPONENT = Math.cos(89.5 * DEG);
let renderFrame = 0;
let didRestoreConfig = false;
let solarChartLoadingFrame = 0;
let solarCanvasCssSize = 0;
let solarCanvasDpr = 0;
const STORAGE_KEY = "briselab:lastConfig";
const PROJECT_FILE_VERSION = 1;
const THREE_CDN_URL = "https://unpkg.com/three@0.165.0/build/three.module.js";
const JSPDF_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const MODEL3D_DEFAULT_ROTATION_X = 0;
const MODEL3D_DEFAULT_ROTATION_Y = -0.08;
const MODEL_COLORS = {
  horizontal: 0xba4d2d,
  vertical: 0x35765e,
  marquise: 0x2f6f8f
};
let threeModule = null;
let threeLoadPromise = null;
let jsPdfLoadPromise = null;
let model3dRenderer = null;
let model3dScene = null;
let model3dCamera = null;
let model3dGroup = null;
let model3dBaseDistance = 4;
let model3dZoom = 1;
let model3dPointer = null;
let model3dVelocityY = 0;
let model3dInertiaFrame = 0;
let shadowModel3dRenderer = null;
let shadowModel3dScene = null;
let shadowModel3dCamera = null;
let shadowModel3dGroup = null;
let shadowModel3dSunLight = null;
let shadowModel3dBaseDistance = 4;
let shadowModel3dRenderToken = 0;
let orientationRenderFrame = 0;
let maskNeedsUpdate = false;
let isUpdatingMask = false;
let lastMaskStats = { shadedPositions: 0, frontCount: 0, ratio: 0 };
let lastMaskSamples = [];
let shadeRasterCanvas = null;
let shadeRasterCtx = null;
let shadeRasterKey = "";
const SHADE_FILTER_MIN = 0;
const SHADE_FILTER_MAX = 100;
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

function calculateHorizontalBriseSpacing(windowHeight, numberOfLouvres) {
  const num = Math.max(2, Math.floor(numberOfLouvres || 1));
  if (num < 2) return 0;
  return windowHeight / (num - 1);
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
      numero: Math.max(2, Math.floor(Number(refs.bhNumero.value) || 2)),
      espacamento: calculateHorizontalBriseSpacing(
        Math.max(0.1, Number(refs.janelaAltura.value) || 1.5),
        Math.max(2, Math.floor(Number(refs.bhNumero.value) || 2))
      ),
      angulo: Number(refs.bhAngulo.value) || 0,
      distancia: Math.max(0, Number(refs.bhDistancia.value) || 0),
      profundidade: Math.max(0, Number(refs.bhProfundidade.value) || 0),
      espessura: Math.max(0, Number(refs.bhEspessura.value) || 0),
      offsetTopo: Math.max(0, Number(refs.bhOffsetTopo.value) || 0),
      sobreposicao: Math.max(0, Number(refs.bhSobreposicao.value) || 0)
    },
    briseVertical: {
      esquerdo: {
        ativo: refs.bveAtivo.checked,
        projecao: Math.max(0, Number(refs.bveProjecao.value) || 0),
        espessura: Math.max(0, Number(refs.bveEspessura.value) || 0),
        offset: Math.max(0, Number(refs.bveOffset.value) || 0),
        top: Math.max(0, Number(refs.bveTop.value) || 0)
      },
      direito: {
        ativo: refs.bvdAtivo.checked,
        projecao: Math.max(0, Number(refs.bvdProjecao.value) || 0),
        espessura: Math.max(0, Number(refs.bvdEspessura.value) || 0),
        offset: Math.max(0, Number(refs.bvdOffset.value) || 0),
        top: Math.max(0, Number(refs.bvdTop.value) || 0)
      }
    },
    marquise: {
      ativo: refs.mqAtivo.checked,
      offsetTopo: Math.max(0, Number(refs.mqOffsetTopo.value) || 0),
      projecao: Math.max(0, Number(refs.mqProjecao.value) || 0),
      espessura: Math.max(0, Number(refs.mqEspessura.value) || 0),
      sobreposicao: Math.max(0, Number(refs.mqSobreposicao.value) || 0)
    }
  };
}

function readShadeFilter() {
  const minValue = Number(refs.shadeMin.value);
  const maxValue = Number(refs.shadeMax.value);
  const min = clamp(Math.round(Number.isFinite(minValue) ? minValue : 0), SHADE_FILTER_MIN, SHADE_FILTER_MAX);
  const max = clamp(Math.round(Number.isFinite(maxValue) ? maxValue : SHADE_FILTER_MAX), SHADE_FILTER_MIN, SHADE_FILTER_MAX);
  return {
    min: Math.min(min, max),
    max: Math.max(min, max)
  };
}

function syncShadeFilterControls(changedField = null, options = {}) {
  const writeValues = options.writeValues !== false;
  const minValue = Number(refs.shadeMin.value);
  const maxValue = Number(refs.shadeMax.value);
  let min = clamp(Math.round(Number.isFinite(minValue) ? minValue : 0), SHADE_FILTER_MIN, SHADE_FILTER_MAX);
  let max = clamp(Math.round(Number.isFinite(maxValue) ? maxValue : SHADE_FILTER_MAX), SHADE_FILTER_MIN, SHADE_FILTER_MAX);

  if (min > max) {
    if (changedField === refs.shadeMin) {
      max = min;
    } else {
      min = max;
    }
  }

  if (writeValues) {
    refs.shadeMin.value = String(min);
    refs.shadeMax.value = String(max);
  }
  refs.shadeMinDisplay.textContent = `${min}%`;
  refs.shadeMaxDisplay.textContent = `${max}%`;
  refs.shadeMin.setAttribute("aria-valuetext", `${min}%`);
  refs.shadeMax.setAttribute("aria-valuetext", `${max}%`);
  refs.heatScaleControl.style.setProperty("--shade-min", `${min}%`);
  refs.heatScaleControl.style.setProperty("--shade-max", `${max}%`);

  return { min, max };
}

function isShadeSampleVisible(sample, filter) {
  const percent = sample.shadeRatio * 100;
  return percent + 0.001 >= filter.min && percent - 0.001 <= filter.max;
}

function getPersistableConfig() {
  const fields = {};
  document.querySelectorAll("input, select").forEach((field) => {
    if (!field.id) return;
    if (field.type === "file") return;
    fields[field.id] = field.type === "checkbox" ? field.checked : field.value;
  });

  const activeTab = document.querySelector(".tab.active");
  return {
    fields,
    activeTab: activeTab ? activeTab.dataset.tab : "tab-horizontal"
  };
}

function saveAppConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistableConfig()));
  } catch (error) {
    // localStorage can be unavailable in restricted browsing contexts.
  }
}

function syncLocalFieldLocks() {
  const selected = refs.capitalSelector.value;
  refs.cidade.disabled = selected !== "custom";
  refs.latitude.disabled = selected !== "custom";
}

function restoreActiveTab(tabId) {
  if (!tabId) return;

  const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  const panel = document.getElementById(tabId);
  if (!tab || !panel) return;

  document.querySelectorAll(".tab").forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll(".tab-panel").forEach((item) => {
    item.classList.toggle("active", item === panel);
  });
}

function applyPersistableConfig(config) {
  Object.entries(config.fields || {}).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (!field) return;

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
    } else {
      field.value = value;
    }
  });

  restoreActiveTab(config.activeTab);
  syncLocalFieldLocks();
}

function restoreAppConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const config = JSON.parse(raw);
    didRestoreConfig = true;
    applyPersistableConfig(config);
  } catch (error) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (storageError) {
      // Ignore cleanup failures in restricted browsing contexts.
    }
  }
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

  const east = -Math.cos(dec) * Math.sin(h);
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
  const east = -Math.cos(dec) * Math.sin(h);
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

function rayIntersectsBox(origin, direction, bounds, options = {}) {
  let tMin = 1e-9;
  let tMax = Infinity;

  if (options.ignoreOriginInside) {
    const startsInside = origin.x >= bounds.x[0] && origin.x <= bounds.x[1] &&
      origin.y >= bounds.y[0] && origin.y <= bounds.y[1] &&
      origin.z >= bounds.z[0] && origin.z <= bounds.z[1];
    if (startsInside) return false;
  }

  const axes = ["x", "y", "z"];
  for (const axis of axes) {
    const d = direction[axis];
    const min = bounds[axis][0];
    const max = bounds[axis][1];

    if (Math.abs(d) < 1e-9) {
      if (origin[axis] < min || origin[axis] > max) return false;
      continue;
    }

    let t1 = (min - origin[axis]) / d;
    let t2 = (max - origin[axis]) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];

    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMax < tMin) return false;
  }

  return tMax >= tMin && tMax > 0;
}

function getHorizontalLouvreVerticalPlacement(state, index) {
  const { altura } = state.janela;
  const b = state.briseHorizontal;
  const angle = b.angulo * DEG;
  const depth = Math.max(0, b.profundidade);
  const thickness = Math.max(0.001, b.espessura || 0.001);
  const halfThickness = thickness / 2;
  const offsets = [
    -halfThickness * Math.cos(angle),
    halfThickness * Math.cos(angle),
    -depth * Math.sin(angle) - halfThickness * Math.cos(angle),
    -depth * Math.sin(angle) + halfThickness * Math.cos(angle)
  ];
  const minOffset = Math.min(...offsets);
  const maxOffset = Math.max(...offsets);
  const topBackZ = altura - maxOffset;
  const bottomBackZ = -minOffset;

  if (topBackZ < bottomBackZ || b.numero <= 1) {
    return (altura - minOffset - maxOffset) / 2;
  }

  const clampedIndex = clamp(index, 0, b.numero - 1);
  const ratio = b.numero <= 1 ? 0.5 : clampedIndex / (b.numero - 1);
  return topBackZ - (topBackZ - bottomBackZ) * ratio;
}

function intersectsMarquise(point, sun, state) {
  const mq = state.marquise;
  if (!mq.ativo || mq.projecao <= 0) return false;

  const zTop = state.janela.altura + mq.offsetTopo;
  const thickness = Math.max(0.001, mq.espessura || 0);
  return rayIntersectsBox(
    { x: 0, y: point.y, z: point.z },
    { x: sun.sx, y: sun.sy, z: sun.sz },
    {
      x: [0, mq.projecao],
      y: [-mq.sobreposicao, state.janela.largura + mq.sobreposicao],
      z: [zTop - thickness, zTop]
    }
  );
}

function intersectsSidefins(point, sun, state) {
  const { altura, largura } = state.janela;
  const { esquerdo, direito } = state.briseVertical;

  if (esquerdo.ativo && esquerdo.projecao > 0) {
    const thickness = Math.max(0.001, esquerdo.espessura || 0);
    if (rayIntersectsBox(
      { x: 0, y: point.y, z: point.z },
      { x: sun.sx, y: sun.sy, z: sun.sz },
      {
        x: [0, esquerdo.projecao],
        y: [-esquerdo.offset - thickness, -esquerdo.offset],
        z: [0, altura + esquerdo.top]
      }
    )) return true;
  }

  if (direito.ativo && direito.projecao > 0) {
    const thickness = Math.max(0.001, direito.espessura || 0);
    if (rayIntersectsBox(
      { x: 0, y: point.y, z: point.z },
      { x: sun.sx, y: sun.sy, z: sun.sz },
      {
        x: [0, direito.projecao],
        y: [largura + direito.offset, largura + direito.offset + thickness],
        z: [0, altura + direito.top]
      }
    )) return true;
  }

  return false;
}

function intersectsLouvres(point, sun, state) {
  const b = state.briseHorizontal;
  if (!b.ativo || b.numero <= 0 || b.profundidade <= 0) return false;

  const yMin = -b.sobreposicao;
  const yMax = state.janela.largura + b.sobreposicao;
  const ang = b.angulo * DEG;
  const thickness = Math.max(0.001, b.espessura || 0);

  const ux = Math.cos(ang);
  const uz = -Math.sin(ang);
  const nx = -uz;
  const nz = -ux;

  for (let i = 0; i < b.numero; i += 1) {
    const z0 = getHorizontalLouvreVerticalPlacement(state, i);
    const x0 = b.distancia;
    const pRelX = -x0;
    const pRelZ = point.z - z0;
    const localOrigin = {
      x: pRelX * ux + pRelZ * uz,
      y: point.y,
      z: pRelX * nx + pRelZ * nz
    };
    const localDirection = {
      x: sun.sx * ux + sun.sz * uz,
      y: sun.sy,
      z: sun.sx * nx + sun.sz * nz
    };

    if (rayIntersectsBox(localOrigin, localDirection, {
      x: [0, b.profundidade],
      y: [yMin, yMax],
      z: [-thickness / 2, thickness / 2]
    }, { ignoreOriginInside: true })) {
      return true;
    }
  }

  return false;
}

function getConvexHull(points) {
  if (points.length <= 3) return points;
  const sorted = [...points].sort((a, b) => a.y === b.y ? a.z - b.z : a.y - b.y);
  const cross = (o, a, b) => (a.y - o.y) * (b.z - o.z) - (a.z - o.z) * (b.y - o.y);
  const lower = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function projectBoxShadowToWindow(vertices, sun) {
  if (!sun || sun.sx <= MIN_HEATMAP_FRONT_COMPONENT) return null;

  const projected = vertices.map((vertex) => {
    const frontX = Math.max(0, vertex.x);
    const t = frontX / sun.sx;
    return {
      y: vertex.y - t * sun.sy,
      z: vertex.z - t * sun.sz
    };
  });
  return getConvexHull(projected);
}

function createAxisAlignedBoxVertices(bounds) {
  const vertices = [];
  for (const x of bounds.x) {
    for (const y of bounds.y) {
      for (const z of bounds.z) {
        vertices.push({ x, y, z });
      }
    }
  }
  return vertices;
}

function createHorizontalLouvreVertices(state, index) {
  const b = state.briseHorizontal;
  const angle = b.angulo * DEG;
  const depth = Math.max(0, b.profundidade);
  const thickness = Math.max(0.001, b.espessura || 0.001);
  const yMin = -b.sobreposicao;
  const yMax = state.janela.largura + b.sobreposicao;
  const z0 = getHorizontalLouvreVerticalPlacement(state, index);
  const x0 = b.distancia;
  const ux = Math.cos(angle);
  const uz = -Math.sin(angle);
  const nx = -uz;
  const nz = -ux;
  const vertices = [];

  for (const lambda of [0, depth]) {
    for (const y of [yMin, yMax]) {
      for (const normalOffset of [-thickness / 2, thickness / 2]) {
        vertices.push({
          x: x0 + lambda * ux + normalOffset * nx,
          y,
          z: z0 + lambda * uz + normalOffset * nz
        });
      }
    }
  }

  return vertices;
}

function getShadowPolygonsForSun(sun, state) {
  const polygons = [];
  const { largura, altura } = state.janela;
  const mq = state.marquise;
  if (mq.ativo && mq.projecao > 0) {
    const zTop = altura + mq.offsetTopo;
    const thickness = Math.max(0.001, mq.espessura || 0.001);
    const polygon = projectBoxShadowToWindow(createAxisAlignedBoxVertices({
      x: [0, mq.projecao],
      y: [-mq.sobreposicao, largura + mq.sobreposicao],
      z: [zTop - thickness, zTop]
    }), sun);
    if (polygon) polygons.push(polygon);
  }

  const addSideFin = (fin, isLeft) => {
    if (!fin.ativo || fin.projecao <= 0) return;
    const thickness = Math.max(0.001, fin.espessura || 0.001);
    const yBounds = isLeft
      ? [-fin.offset - thickness, -fin.offset]
      : [largura + fin.offset, largura + fin.offset + thickness];
    const polygon = projectBoxShadowToWindow(createAxisAlignedBoxVertices({
      x: [0, fin.projecao],
      y: yBounds,
      z: [0, altura + fin.top]
    }), sun);
    if (polygon) polygons.push(polygon);
  };
  addSideFin(state.briseVertical.esquerdo, true);
  addSideFin(state.briseVertical.direito, false);

  const b = state.briseHorizontal;
  if (b.ativo && b.numero > 0 && b.profundidade > 0) {
    for (let i = 0; i < b.numero; i += 1) {
      const polygon = projectBoxShadowToWindow(createHorizontalLouvreVertices(state, i), sun);
      if (polygon) polygons.push(polygon);
    }
  }

  return polygons;
}

function getShadeRaster(state) {
  const ratio = state.janela.largura / state.janela.altura;
  const targetPixels = 18000;
  const width = clamp(Math.round(Math.sqrt(targetPixels * ratio)), 48, 240);
  const height = clamp(Math.round(width / ratio), 48, 280);
  const key = `${width}x${height}`;

  if (!shadeRasterCanvas || shadeRasterKey !== key) {
    shadeRasterCanvas = document.createElement("canvas");
    shadeRasterCtx = shadeRasterCanvas.getContext("2d", { willReadFrequently: true });
    shadeRasterCanvas.width = width;
    shadeRasterCanvas.height = height;
    shadeRasterKey = key;
  }

  return { canvas: shadeRasterCanvas, context: shadeRasterCtx, width, height };
}

function fillWindowShadowPolygon(context, polygon, state, width, height) {
  if (!polygon || polygon.length < 3) return;
  context.beginPath();
  polygon.forEach((point, index) => {
    const x = (point.y / state.janela.largura) * width;
    const y = (1 - point.z / state.janela.altura) * height;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.fill();
}

function getWindowShadeRatioForSun(sun, state, columns = 11, rows = 11) {
  if (!sun || sun.sx <= MIN_HEATMAP_FRONT_COMPONENT) return 0;

  const polygons = getShadowPolygonsForSun(sun, state);
  if (!polygons.length) return 0;

  const raster = getShadeRaster(state);
  const { context, width, height } = raster;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#000";
  polygons.forEach((polygon) => fillWindowShadowPolygon(context, polygon, state, width, height));

  const pixels = context.getImageData(0, 0, width, height).data;
  let shaded = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 0) {
      shaded += 1;
    }
  }

  return shaded / (width * height);
}

function getWindowShadeRatioForSolarPosition(altitudeDeg, azimuthDeg, state, columns = 11, rows = 11) {
  if (altitudeDeg <= 0) return 0;

  const relative = wrap180(azimuthDeg - state.local.orientacao);
  if (Math.abs(relative) > 90) return 0;

  const sun = sunVectorFacade(altitudeDeg, azimuthDeg, state.local.orientacao);
  if (sun.sx <= MIN_HEATMAP_FRONT_COMPONENT) return 0;
  return getWindowShadeRatioForSun(sun, state, columns, rows);
}

function drawBaseChart(center, radius) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, refs.canvas.width, refs.canvas.height);
  ctx.restore();

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

function drawShadeMaskSamples(samples, state, center, radius, filter = readShadeFilter()) {
  samples.forEach((sample) => {
    if (!isShadeSampleVisible(sample, filter)) return;

    const p = stereographicProject(sample.alt, state.local.orientacao + sample.relativeAz, center, radius);
    const alpha = 0.08 + sample.shadeRatio * 0.5;
    const dotRadius = 1.8 + sample.shadeRatio * 3.2;
    ctx.fillStyle = `rgba(186, 77, 45, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function calculateShadeMaskSamples(state) {
  const stepAlt = 2;
  const stepRelativeAz = 2;
  let shadeRatioSum = 0;
  let shadedPositions = 0;
  let frontCount = 0;
  const samples = [];

  for (let alt = 0; alt <= 90; alt += stepAlt) {
    for (let relativeAz = -90; relativeAz <= 90; relativeAz += stepRelativeAz) {
      if (alt <= 0) continue;
      const sun = sunVectorFacade(alt, state.local.orientacao + relativeAz, state.local.orientacao);
      if (sun.sx <= MIN_HEATMAP_FRONT_COMPONENT) continue;

      frontCount += 1;
      const shadeRatio = getWindowShadeRatioForSun(sun, state, 5, 5);
      shadeRatioSum += shadeRatio;
      if (shadeRatio <= 0) continue;
      shadedPositions += 1;
      samples.push({ alt, relativeAz, shadeRatio });
    }
  }

  return {
    samples,
    stats: {
      shadedPositions,
      frontCount,
      ratio: frontCount > 0 ? shadeRatioSum / frontCount : 0
    }
  };
}

function drawShadeMask(state, center, radius) {
  const result = calculateShadeMaskSamples(state);
  lastMaskSamples = result.samples;
  drawShadeMaskSamples(lastMaskSamples, state, center, radius);
  return result.stats;
}

function drawCachedShadeMask(state, center, radius) {
  drawShadeMaskSamples(lastMaskSamples, state, center, radius);
  return lastMaskStats;
}

function hideShadowPointTooltip() {
  refs.shadowPointTooltip.classList.remove("open", "below");
  refs.shadowPointTooltip.setAttribute("aria-hidden", "true");
}

function getRenderedShadeSampleAt(clientX, clientY) {
  if (!lastMaskSamples.length || refs.maskUpdateOverlay.classList.contains("open")) return null;

  const state = getState();
  const canvasRect = refs.canvas.getBoundingClientRect();
  const x = clientX - canvasRect.left;
  const y = clientY - canvasRect.top;
  const center = { x: canvasRect.width / 2, y: canvasRect.height / 2 };
  const radius = Math.min(canvasRect.width, canvasRect.height) * 0.44;
  const filter = readShadeFilter();
  let closest = null;
  let closestDistanceSq = Infinity;

  lastMaskSamples.forEach((sample) => {
    if (!isShadeSampleVisible(sample, filter)) return;

    const p = stereographicProject(sample.alt, state.local.orientacao + sample.relativeAz, center, radius);
    const dotRadius = 1.8 + sample.shadeRatio * 3.2;
    const hitRadius = Math.max(8, dotRadius + 4);
    const dx = x - p.x;
    const dy = y - p.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= hitRadius * hitRadius && distanceSq < closestDistanceSq) {
      closest = { sample, point: p };
      closestDistanceSq = distanceSq;
    }
  });

  if (!closest) return null;

  const slotRect = refs.canvas.parentElement.getBoundingClientRect();
  return {
    sample: closest.sample,
    x: canvasRect.left - slotRect.left + closest.point.x,
    y: canvasRect.top - slotRect.top + closest.point.y,
    slotWidth: slotRect.width,
    slotHeight: slotRect.height
  };
}

function updateShadowPointTooltip(event) {
  const hit = getRenderedShadeSampleAt(event.clientX, event.clientY);
  if (!hit) {
    hideShadowPointTooltip();
    return;
  }

  const left = clamp(hit.x, 56, Math.max(56, hit.slotWidth - 56));
  const top = clamp(hit.y, 16, Math.max(16, hit.slotHeight - 16));
  refs.shadowPointTooltip.textContent = `${(hit.sample.shadeRatio * 100).toFixed(1)}% sombreado`;
  refs.shadowPointTooltip.style.left = `${left}px`;
  refs.shadowPointTooltip.style.top = `${top}px`;
  refs.shadowPointTooltip.classList.toggle("below", hit.y < 42);
  refs.shadowPointTooltip.classList.add("open");
  refs.shadowPointTooltip.setAttribute("aria-hidden", "false");
}

function updateSummary(state, maskStats) {
  updateChartHeader(state);

  const active = [];
  if (state.briseHorizontal.ativo) active.push("Brise horizontal");
  if (state.briseVertical.esquerdo.ativo || state.briseVertical.direito.ativo) active.push("Brise vertical");
  if (state.marquise.ativo) active.push("Marquise");

  const percent = (maskStats.ratio * 100).toFixed(1);
  const directSunStats = estimateBlockedDirectSunHours(state);
  refs.resumo.innerHTML = [
    `<strong>Proteções ativas:</strong> ${active.length ? active.join(", ") : "Nenhuma"}`,
    `<strong>Sombreamento médio da janela no mapa:</strong> ${percent}% da área da janela ao longo da abóbada frontal`,
    `<strong>Horas equivalentes de área sombreada:</strong> ${directSunStats.percent}% (${directSunStats.blockedHours} h-eq de ${directSunStats.directHours} h/ano estimadas)`,
    `<strong>Dimensões da janela:</strong> ${state.janela.largura.toFixed(2)} m x ${state.janela.altura.toFixed(2)} m`,
    `<em>Observação: a carta solar usa um mapa de calor da porcentagem da área da janela sombreada.</em>`
  ].join("<br>");
}

function updateChartHeader(state) {
  refs.cidadeDisplay.textContent = state.local.cidade;
  refs.latDisplay.textContent = `${state.local.latitude.toFixed(2)}°`;
  refs.orientacaoTexto.textContent = `${Math.round(state.local.orientacao)}°`;
}

function setMaskUpdateOverlay(open) {
  refs.maskUpdateOverlay.classList.toggle("open", open);
  refs.maskUpdateOverlay.setAttribute("aria-hidden", open ? "false" : "true");
}

function setSolarChartLoading(open) {
  refs.solarChartLoadingOverlay.classList.toggle("open", open);
  refs.solarChartLoadingOverlay.setAttribute("aria-hidden", open ? "false" : "true");
}

function runWithSolarChartLoading(task) {
  if (solarChartLoadingFrame) cancelAnimationFrame(solarChartLoadingFrame);
  setSolarChartLoading(true);

  solarChartLoadingFrame = requestAnimationFrame(() => {
    solarChartLoadingFrame = requestAnimationFrame(() => {
      solarChartLoadingFrame = 0;
      try {
        task();
      } finally {
        setSolarChartLoading(false);
      }
    });
  });
}

function setUiBlocked(blocked, message = "Atualizando máscara de sombra") {
  isUpdatingMask = blocked;
  if (blocked) refs.uiBlockerMessage.textContent = message;
  refs.uiBlocker.classList.toggle("open", blocked);
  refs.uiBlocker.setAttribute("aria-hidden", blocked ? "false" : "true");
}

function markMaskNeedsUpdate() {
  maskNeedsUpdate = true;
  hideShadowPointTooltip();
  setMaskUpdateOverlay(true);
}

function renderLiveSurfaces() {
  updateBriseSpacingDisplay();
  const state = getState();
  updateChartHeader(state);
  renderWindowShadow(state);
  renderWindowModel3d(state);
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
  const hourStep = 0.5;
  let directHours = 0;
  let shadedEquivalentHours = 0;

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
      shadedEquivalentHours += hourStep * getWindowShadeRatioForSun(sun, state, 5, 5);
    }
  }

  const percent = directHours > 0 ? (shadedEquivalentHours / directHours) * 100 : 0;
  return {
    percent: percent.toFixed(1),
    blockedHours: Math.round(shadedEquivalentHours).toLocaleString("pt-BR"),
    directHours: Math.round(directHours).toLocaleString("pt-BR")
  };
}

function getShadowSunForMoment(state, day, hour, options = {}) {
  const declination = declinationFromDay(day);
  const hourAngle = (hour - 12) * 15;
  const position = solarPositionFromDecHour(state.local.latitude, declination, hourAngle);

  if (options.updateControls) {
    refs.shadowDateText.textContent = formatDayOfYear(day);
    refs.shadowTimeText.textContent = formatSolarTime(hour);
  }

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
    reason: direct ? "" : "Sol sem incidência direta na fachada."
  };
}

function getShadowSun(state) {
  return getShadowSunForMoment(
    state,
    Number(refs.shadowDate.value),
    Number(refs.shadowTime.value),
    { updateControls: true }
  );
}

function setShadowRangeValue(input, value) {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = Number(input.step) || 1;
  const stepped = Math.round(Number(value) / step) * step;
  input.value = String(clamp(stepped, min, max));
}

function updateWindowShadowControls() {
  renderWindowShadow();
  saveAppConfig();
}

function shiftShadowControl(kind, delta) {
  const input = kind === "date" ? refs.shadowDate : refs.shadowTime;
  setShadowRangeValue(input, Number(input.value) + Number(delta));
  updateWindowShadowControls();
}

function jumpToShadowDate(day) {
  setShadowRangeValue(refs.shadowDate, Number(day));
  updateWindowShadowControls();
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

function drawBrisesOnWindowPreview(rect, state) {
  const { largura, altura } = state.janela;
  const scaleX = rect.w / largura;
  const scaleY = rect.h / altura;

  const toCanvasX = (y) => rect.x + (y / largura) * rect.w;
  const toCanvasY = (z) => rect.y + rect.h - (z / altura) * rect.h;

  // --- Marquise ---
  const mq = state.marquise;
  if (mq.ativo && mq.projecao > 0) {
    const zMq = altura + mq.offsetTopo;
    const cxL = toCanvasX(-mq.sobreposicao);
    const cxR = toCanvasX(largura + mq.sobreposicao);
    const cyMq = toCanvasY(zMq);
    const mqThick = Math.max(5, mq.espessura * scaleY);
    const grad = shadowCtx.createLinearGradient(cxL, cyMq - mqThick, cxL, cyMq);
    grad.addColorStop(0, "rgba(195, 165, 110, 0.92)");
    grad.addColorStop(1, "rgba(120, 88, 48, 0.92)");
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(cxL, cyMq - mqThick, cxR - cxL, mqThick);
    shadowCtx.strokeStyle = "rgba(65, 45, 20, 0.75)";
    shadowCtx.lineWidth = 1.5;
    shadowCtx.strokeRect(cxL, cyMq - mqThick, cxR - cxL, mqThick);
  }

  // --- Aletas verticais (sidefins) ---
  const drawSideFin = (fin, isLeft) => {
    if (!fin.ativo || fin.projecao <= 0) return;
    const yEdge = isLeft ? -fin.offset : largura + fin.offset;
    const zTop = altura + fin.top;
    const zBot = 0;
    const cx = toCanvasX(yEdge);
    const cy1 = toCanvasY(zTop);
    const cy2 = toCanvasY(zBot);
    const finW = Math.max(5, fin.espessura * scaleX);
    const drawX = isLeft ? cx - finW : cx;
    const grad = shadowCtx.createLinearGradient(drawX, 0, drawX + finW, 0);
    if (isLeft) {
      grad.addColorStop(0, "rgba(120, 90, 52, 0.88)");
      grad.addColorStop(1, "rgba(190, 158, 105, 0.88)");
    } else {
      grad.addColorStop(0, "rgba(190, 158, 105, 0.88)");
      grad.addColorStop(1, "rgba(120, 90, 52, 0.88)");
    }
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(drawX, cy1, finW, cy2 - cy1);
    shadowCtx.strokeStyle = "rgba(65, 45, 20, 0.75)";
    shadowCtx.lineWidth = 1;
    shadowCtx.strokeRect(drawX, cy1, finW, cy2 - cy1);
  };
  drawSideFin(state.briseVertical.esquerdo, true);
  drawSideFin(state.briseVertical.direito, false);

  // --- Brises horizontais (louvres) ---
  const b = state.briseHorizontal;
  if (b.ativo && b.numero >= 1 && b.profundidade > 0) {
    const ang = b.angulo * DEG;
    const projZ = b.profundidade * Math.sin(ang);
    const cxL = toCanvasX(-b.sobreposicao);
    const cxR = toCanvasX(largura + b.sobreposicao);
    const stripW = cxR - cxL;
    const thicknessPx = Math.max(2, b.espessura * scaleY);

    for (let i = 0; i < b.numero; i++) {
      const zBack = getHorizontalLouvreVerticalPlacement(state, i);
      const zFront = zBack - projZ;

      const cyBack = toCanvasY(zBack);
      const cyFront = toCanvasY(zFront);

      const cyTop = Math.min(cyBack, cyFront);
      const cyBot = Math.max(cyBack, cyFront);
      const stripH = Math.max(2, cyBot - cyTop + thicknessPx);

      // Fill: gradient simulating lit face
      let fillStyle;
      if (Math.abs(ang) < 0.005) {
        fillStyle = "rgba(175, 145, 92, 0.93)";
        shadowCtx.fillStyle = fillStyle;
      } else {
        const grad = shadowCtx.createLinearGradient(cxL, cyTop, cxL, cyTop + stripH);
        if (ang > 0) {
          // Face superior visível (frente inclinada para baixo)
          grad.addColorStop(0, "rgba(215, 188, 138, 0.95)");
          grad.addColorStop(0.6, "rgba(175, 145, 92, 0.95)");
          grad.addColorStop(1, "rgba(110, 82, 42, 0.95)");
        } else {
          // Face inferior visível (frente inclinada para cima)
          grad.addColorStop(0, "rgba(105, 78, 38, 0.95)");
          grad.addColorStop(0.4, "rgba(155, 125, 78, 0.95)");
          grad.addColorStop(1, "rgba(205, 178, 130, 0.95)");
        }
        shadowCtx.fillStyle = grad;
      }
      shadowCtx.fillRect(cxL, cyTop, stripW, stripH);

      // Aresta frontal (borda da lâmina visível ao observador)
      const frontEdgeCy = ang >= 0 ? cyBot : cyTop;
      shadowCtx.strokeStyle = "rgba(58, 38, 14, 0.88)";
      shadowCtx.lineWidth = 1.5;
      shadowCtx.beginPath();
      shadowCtx.moveTo(cxL, frontEdgeCy);
      shadowCtx.lineTo(cxR, frontEdgeCy);
      shadowCtx.stroke();

      // Aresta traseira (mais sutil)
      const backEdgeCy = ang >= 0 ? cyTop : cyBot;
      shadowCtx.strokeStyle = "rgba(58, 38, 14, 0.32)";
      shadowCtx.lineWidth = 0.8;
      shadowCtx.beginPath();
      shadowCtx.moveTo(cxL, backEdgeCy);
      shadowCtx.lineTo(cxR, backEdgeCy);
      shadowCtx.stroke();
    }
  }
}

function renderWindowShadow(state = getState()) {
  if (!refs.windowShadowModal.classList.contains("open")) return;

  const solar = getShadowSun(state);

  if (solar.direct) {
    const ratio = getWindowShadeRatioForSun(solar.sun, state, 43, 43);
    refs.windowShadowStatus.textContent = `Área sombreada pelos brises: ${(ratio * 100).toFixed(1)}%`;
  } else {
    refs.windowShadowStatus.textContent = solar.reason;
  }

  renderWindowShadow3d(state, solar);
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

function loadThreeModule() {
  if (threeModule) return Promise.resolve(threeModule);
  if (!threeLoadPromise) {
    threeLoadPromise = import(THREE_CDN_URL)
      .then((module) => {
        threeModule = module;
        return threeModule;
      })
      .catch((error) => {
        refs.windowModel3dStatus.textContent = "Não foi possível carregar o Three.js.";
        threeLoadPromise = null;
        throw error;
      });
  }
  return threeLoadPromise;
}

function disposeModel3dObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function clearModel3dGroup(targetGroup = model3dGroup) {
  if (!targetGroup) return;
  while (targetGroup.children.length) {
    const child = targetGroup.children.pop();
    disposeModel3dObject(child);
  }
}

function addModel3dBox(size, position, material, rotation = [0, 0, 0], edgeColor = "#30261e", targetGroup = model3dGroup) {
  const THREE = threeModule;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  targetGroup.add(mesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.58 })
  );
  edges.position.copy(mesh.position);
  edges.rotation.copy(mesh.rotation);
  targetGroup.add(edges);
  return mesh;
}

function addModel3dWallFrame(frame, material, edgeColor = "#8e7b62", targetGroup = model3dGroup) {
  const THREE = threeModule;
  const outerLeft = -frame.width / 2;
  const outerRight = frame.width / 2;
  const outerBottom = frame.centerY - frame.height / 2;
  const outerTop = frame.centerY + frame.height / 2;
  const openingLeft = -frame.openingWidth / 2;
  const openingRight = frame.openingWidth / 2;
  const openingBottom = -frame.openingHeight / 2;
  const openingTop = frame.openingHeight / 2;

  const shape = new THREE.Shape();
  shape.moveTo(outerLeft, outerBottom);
  shape.lineTo(outerRight, outerBottom);
  shape.lineTo(outerRight, outerTop);
  shape.lineTo(outerLeft, outerTop);
  shape.lineTo(outerLeft, outerBottom);

  const opening = new THREE.Path();
  opening.moveTo(openingLeft, openingBottom);
  opening.lineTo(openingLeft, openingTop);
  opening.lineTo(openingRight, openingTop);
  opening.lineTo(openingRight, openingBottom);
  opening.lineTo(openingLeft, openingBottom);
  shape.holes.push(opening);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: frame.thickness,
    bevelEnabled: false,
    steps: 1
  });
  geometry.translate(0, 0, -frame.thickness / 2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  targetGroup.add(mesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.58 })
  );
  targetGroup.add(edges);
  return mesh;
}

function getActiveModel3dSlot() {
  return refs.model3dModal.classList.contains("open")
    ? refs.model3dModalSlot
    : refs.windowModel3dSlot;
}

function stopModel3dInertia() {
  if (model3dInertiaFrame) {
    cancelAnimationFrame(model3dInertiaFrame);
    model3dInertiaFrame = 0;
  }
}

function startModel3dInertia() {
  stopModel3dInertia();
  if (Math.abs(model3dVelocityY) < 0.0008) return;

  const step = () => {
    if (!model3dGroup || model3dPointer) {
      model3dInertiaFrame = 0;
      return;
    }

    model3dGroup.rotation.y += model3dVelocityY;
    model3dVelocityY *= 0.92;
    renderModel3dScene();

    if (Math.abs(model3dVelocityY) >= 0.0008) {
      model3dInertiaFrame = requestAnimationFrame(step);
    } else {
      model3dVelocityY = 0;
      model3dInertiaFrame = 0;
    }
  };

  model3dInertiaFrame = requestAnimationFrame(step);
}

function resetModel3dView() {
  stopModel3dInertia();
  model3dVelocityY = 0;
  model3dZoom = 1;
  if (model3dGroup) {
    model3dGroup.rotation.x = MODEL3D_DEFAULT_ROTATION_X;
    model3dGroup.rotation.y = MODEL3D_DEFAULT_ROTATION_Y;
  }
  renderModel3dScene();
}

function openModel3dModal() {
  stopModel3dInertia();
  refs.model3dModal.classList.add("open");
  refs.model3dModal.setAttribute("aria-hidden", "false");
  refs.model3dModalSlot.appendChild(refs.windowModel3dCanvas);
  renderModel3dScene();
}

function closeModel3dModal() {
  stopModel3dInertia();
  refs.model3dModal.classList.remove("open");
  refs.model3dModal.setAttribute("aria-hidden", "true");
  refs.windowModel3dSlot.appendChild(refs.windowModel3dCanvas);
  renderModel3dScene();
}

function updateModel3dCamera(cameraView = "perspective") {
  if (!model3dCamera) return;
  const aspect = model3dCamera.aspect || 1;
  const viewSize = model3dBaseDistance * model3dZoom;
  const halfWidth = (viewSize * aspect) / 2;
  const halfHeight = viewSize / 2;
  const cameraDistance = Math.max(viewSize * 2.8, 4);

  model3dCamera.left = -halfWidth;
  model3dCamera.right = halfWidth;
  model3dCamera.top = halfHeight;
  model3dCamera.bottom = -halfHeight;
  model3dCamera.near = Math.max(0.01, cameraDistance / 120);
  model3dCamera.far = cameraDistance * 12;
  model3dCamera.up.set(0, 1, 0);

  if (cameraView === "front") {
    model3dCamera.position.set(0, 0, cameraDistance);
  } else if (cameraView === "side") {
    model3dCamera.position.set(cameraDistance, 0, 0.12);
  } else {
    model3dCamera.position.set(cameraDistance, cameraDistance * 1.08, cameraDistance);
  }

  model3dCamera.lookAt(0, 0, 0.12);
  model3dCamera.updateProjectionMatrix();
}

function resizeModel3dRenderer(cameraView = "perspective") {
  if (!model3dRenderer) return;
  const rect = getActiveModel3dSlot().getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  model3dRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  model3dRenderer.setSize(width, height, false);
  model3dCamera.aspect = width / height;
  updateModel3dCamera(cameraView);
}

function renderModel3dScene(cameraView = "perspective") {
  if (!model3dRenderer || !model3dScene || !model3dCamera) return;
  resizeModel3dRenderer(cameraView);
  model3dRenderer.render(model3dScene, model3dCamera);
}

function initModel3dScene() {
  if (model3dRenderer) return;

  const THREE = threeModule;
  model3dScene = new THREE.Scene();
  model3dScene.background = new THREE.Color(0xefe7da);

  model3dCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  model3dRenderer = new THREE.WebGLRenderer({
    canvas: refs.windowModel3dCanvas,
    antialias: true,
    preserveDrawingBuffer: true
  });
  model3dRenderer.shadowMap.enabled = true;
  model3dRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const ambient = new THREE.HemisphereLight(0xffffff, 0x9b866d, 1.8);
  model3dScene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(3, 4, 5);
  keyLight.castShadow = true;
  model3dScene.add(keyLight);

  model3dGroup = new THREE.Group();
  model3dGroup.rotation.x = MODEL3D_DEFAULT_ROTATION_X;
  model3dGroup.rotation.y = MODEL3D_DEFAULT_ROTATION_Y;
  model3dScene.add(model3dGroup);

  refs.windowModel3dCanvas.addEventListener("pointerdown", (event) => {
    stopModel3dInertia();
    model3dVelocityY = 0;
    model3dPointer = { x: event.clientX, y: event.clientY };
    refs.windowModel3dCanvas.setPointerCapture(event.pointerId);
  });

  refs.windowModel3dCanvas.addEventListener("pointermove", (event) => {
    if (!model3dPointer) return;
    const dx = event.clientX - model3dPointer.x;
    const deltaRotation = dx * 0.009;
    model3dPointer = { x: event.clientX, y: event.clientY };
    model3dGroup.rotation.y += deltaRotation;
    model3dVelocityY = model3dVelocityY * 0.45 + deltaRotation * 0.55;
    renderModel3dScene();
  });

  refs.windowModel3dCanvas.addEventListener("pointerup", (event) => {
    if (refs.windowModel3dCanvas.hasPointerCapture(event.pointerId)) {
      refs.windowModel3dCanvas.releasePointerCapture(event.pointerId);
    }
    model3dPointer = null;
    startModel3dInertia();
  });

  refs.windowModel3dCanvas.addEventListener("pointercancel", () => {
    model3dPointer = null;
    model3dVelocityY = 0;
    stopModel3dInertia();
  });

  refs.windowModel3dCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1.08 : 0.92;
    model3dZoom = clamp(model3dZoom * direction, 0.18, 2.4);
    renderModel3dScene();
  }, { passive: false });
}

function rebuildModel3d(state, targetGroup = model3dGroup, options = {}) {
  if (!targetGroup) return null;
  clearModel3dGroup(targetGroup);

  const THREE = threeModule;
  const addBox = (size, position, material, rotation = [0, 0, 0], edgeColor = "#30261e") =>
    addModel3dBox(size, position, material, rotation, edgeColor, targetGroup);
  const { largura, altura } = state.janela;
  const horizontal = state.briseHorizontal;
  const verticalLeft = state.briseVertical.esquerdo;
  const verticalRight = state.briseVertical.direito;
  const marquise = state.marquise;

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd7c6ad, roughness: 0.86 });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x89cce0,
    roughness: 0.18,
    metalness: 0.02,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const horizontalMaterial = new THREE.MeshStandardMaterial({ color: MODEL_COLORS.horizontal, roughness: 0.55, metalness: 0.05 });
  const verticalMaterial = new THREE.MeshStandardMaterial({ color: MODEL_COLORS.vertical, roughness: 0.55, metalness: 0.05 });
  const marquiseMaterial = new THREE.MeshStandardMaterial({ color: MODEL_COLORS.marquise, roughness: 0.58, metalness: 0.05 });
  const wallThickness = 0.12;
  const wallFrontZ = wallThickness / 2;

  const topPadding = Math.max(
    0.35,
    horizontal.ativo ? horizontal.espessura + 0.2 : 0,
    verticalLeft.ativo ? verticalLeft.top + 0.18 : 0,
    verticalRight.ativo ? verticalRight.top + 0.18 : 0,
    marquise.ativo ? marquise.offsetTopo + marquise.espessura + 0.26 : 0
  );
  const bottomPadding = 0.25;
  const sidePadding = Math.max(
    0.36,
    horizontal.ativo ? horizontal.sobreposicao + 0.22 : 0,
    marquise.ativo ? marquise.sobreposicao + 0.22 : 0,
    verticalLeft.ativo ? verticalLeft.offset + verticalLeft.espessura + 0.24 : 0,
    verticalRight.ativo ? verticalRight.offset + verticalRight.espessura + 0.24 : 0
  );

  const wallWidth = largura + sidePadding * 2;
  const wallHeight = altura + topPadding + bottomPadding;
  const wallCenterY = (altura + topPadding - bottomPadding) / 2 - altura / 2;

  addModel3dWallFrame({
    width: wallWidth,
    height: wallHeight,
    centerY: wallCenterY,
    openingWidth: largura,
    openingHeight: altura,
    thickness: wallThickness
  }, wallMaterial, "#8e7b62", targetGroup);

  addBox([largura, altura, 0.018], [0, 0, 0], glassMaterial, [0, 0, 0], "#2f5c68");

  if (marquise.ativo && marquise.projecao > 0) {
    const canopyThickness = Math.max(0.001, marquise.espessura || 0.001);
    addBox(
      [largura + marquise.sobreposicao * 2, canopyThickness, marquise.projecao],
      [0, altura / 2 + marquise.offsetTopo + canopyThickness / 2, wallFrontZ + marquise.projecao / 2],
      marquiseMaterial,
      [0, 0, 0],
      "#1d4d66"
    );
  }

  const addSideFin = (fin, isLeft) => {
    if (!fin.ativo || fin.projecao <= 0) return;
    const finThickness = Math.max(0.001, fin.espessura || 0.001);
    const finHeight = Math.max(0.05, altura + fin.top);
    const xCoord = isLeft ? -fin.offset - finThickness / 2 : largura + fin.offset + finThickness / 2;
    const centerY = (altura + fin.top) / 2 - altura / 2;
    addBox(
      [finThickness, finHeight, fin.projecao],
      [xCoord - largura / 2, centerY, wallFrontZ + fin.projecao / 2],
      verticalMaterial,
      [0, 0, 0],
      "#1f4a38"
    );
  };
  addSideFin(verticalLeft, true);
  addSideFin(verticalRight, false);

  if (horizontal.ativo && horizontal.profundidade > 0) {
    const angle = horizontal.angulo * DEG;
    const louvreWidth = largura + horizontal.sobreposicao * 2;
    const louvreThickness = Math.max(0.001, horizontal.espessura || 0.001);
    const louvreDepth = Math.max(0.025, horizontal.profundidade);

    for (let i = 0; i < horizontal.numero; i += 1) {
      const zBack = getHorizontalLouvreVerticalPlacement(state, i);
      const centerY = zBack - Math.sin(angle) * louvreDepth / 2 - altura / 2;
      const centerZ = wallFrontZ + horizontal.distancia + Math.cos(angle) * louvreDepth / 2;
      addBox(
        [louvreWidth, louvreThickness, louvreDepth],
        [0, centerY, centerZ],
        horizontalMaterial,
        [angle, 0, 0],
        "#6e2b19"
      );
    }
  }

  const depthSpan = Math.max(
    0.5,
    wallThickness,
    horizontal.ativo ? wallFrontZ + horizontal.distancia + horizontal.profundidade : 0,
    marquise.ativo ? wallFrontZ + marquise.projecao : 0,
    verticalLeft.ativo ? wallFrontZ + verticalLeft.projecao : 0,
    verticalRight.ativo ? wallFrontZ + verticalRight.projecao : 0
  );
  const modelSpan = Math.max(wallWidth, wallHeight, depthSpan * 1.8);
  if (options.updateBaseDistance !== false) {
    model3dBaseDistance = modelSpan * 1.35;
  }

  if (options.includeGrid !== false) {
    const grid = new THREE.GridHelper(Math.max(modelSpan * 1.7, 2), 12, 0xb9a991, 0xd1c6b6);
    grid.position.y = -altura / 2 - bottomPadding - 0.015;
    grid.position.z = depthSpan * 0.45;
    targetGroup.add(grid);
  }

  return { modelSpan, depthSpan, wallWidth, wallHeight };
}

function renderWindowModel3d(state = getState()) {
  if (!threeModule || !refs.windowModel3dCanvas) return;
  initModel3dScene();
  rebuildModel3d(state);
  refs.windowModel3dStatus.textContent = `Janela ${state.janela.largura.toFixed(2)} m x ${state.janela.altura.toFixed(2)} m`;
  renderModel3dScene();
}

async function initWindowModel3d() {
  if (!refs.windowModel3dCanvas) return;
  refs.windowModel3dStatus.textContent = "Carregando Three.js...";

  try {
    await loadThreeModule();
    renderWindowModel3d();
  } catch (error) {
    console.error(error);
  }
}

function initWindowShadow3dScene() {
  if (shadowModel3dRenderer || !refs.windowShadow3dCanvas) return;

  const THREE = threeModule;
  shadowModel3dScene = new THREE.Scene();
  shadowModel3dScene.background = new THREE.Color(0xefe7da);

  shadowModel3dCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  shadowModel3dRenderer = new THREE.WebGLRenderer({
    canvas: refs.windowShadow3dCanvas,
    antialias: true,
    preserveDrawingBuffer: true
  });
  shadowModel3dRenderer.shadowMap.enabled = true;
  shadowModel3dRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const ambient = new THREE.HemisphereLight(0xffffff, 0x9b866d, 1.4);
  shadowModel3dScene.add(ambient);

  shadowModel3dSunLight = new THREE.DirectionalLight(0xffffff, 5.2);
  shadowModel3dSunLight.castShadow = true;
  shadowModel3dSunLight.shadow.mapSize.set(2048, 2048);
  shadowModel3dScene.add(shadowModel3dSunLight);
  shadowModel3dScene.add(shadowModel3dSunLight.target);

  shadowModel3dGroup = new THREE.Group();
  shadowModel3dScene.add(shadowModel3dGroup);
}

function addWindowShadowReceiver(state) {
  if (!shadowModel3dGroup) return;

  const THREE = threeModule;
  const material = new THREE.ShadowMaterial({
    color: 0x7a1813,
    opacity: 0.56,
    transparent: true,
    depthWrite: false
  });
  const receiver = new THREE.Mesh(
    new THREE.PlaneGeometry(state.janela.largura, state.janela.altura),
    material
  );
  receiver.position.set(0, 0, 0.014);
  receiver.receiveShadow = true;
  shadowModel3dGroup.add(receiver);
}

function resizeWindowShadow3dRenderer(sizeOverride = null) {
  if (!shadowModel3dRenderer || !shadowModel3dCamera) return;

  const rect = refs.windowShadow3dCanvas.parentElement.getBoundingClientRect();
  const width = Math.max(1, Math.floor(sizeOverride ? sizeOverride.width : rect.width));
  const height = Math.max(1, Math.floor(sizeOverride ? sizeOverride.height : rect.height));
  const aspect = width / height;
  const viewSize = shadowModel3dBaseDistance * 1.18;
  const halfHeight = viewSize / 2;
  const halfWidth = halfHeight * aspect;
  const cameraDistance = Math.max(viewSize * 2.8, 4);

  shadowModel3dRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  shadowModel3dRenderer.setSize(width, height, false);
  shadowModel3dCamera.left = -halfWidth;
  shadowModel3dCamera.right = halfWidth;
  shadowModel3dCamera.top = halfHeight;
  shadowModel3dCamera.bottom = -halfHeight;
  shadowModel3dCamera.near = Math.max(0.01, cameraDistance / 120);
  shadowModel3dCamera.far = cameraDistance * 12;
  shadowModel3dCamera.up.set(0, 1, 0);
  shadowModel3dCamera.position.set(0, 0, cameraDistance);
  shadowModel3dCamera.lookAt(0, 0, 0);
  shadowModel3dCamera.updateProjectionMatrix();
}

function updateWindowShadow3dSun(solar) {
  if (!shadowModel3dSunLight) return;

  const cameraSize = Math.max(shadowModel3dBaseDistance * 1.35, 2.5);
  shadowModel3dSunLight.shadow.camera.left = -cameraSize;
  shadowModel3dSunLight.shadow.camera.right = cameraSize;
  shadowModel3dSunLight.shadow.camera.top = cameraSize;
  shadowModel3dSunLight.shadow.camera.bottom = -cameraSize;
  shadowModel3dSunLight.shadow.camera.near = 0.01;
  shadowModel3dSunLight.shadow.camera.far = Math.max(cameraSize * 8, 12);

  if (!solar.direct || !solar.sun) {
    shadowModel3dSunLight.intensity = 0;
    shadowModel3dSunLight.castShadow = false;
    shadowModel3dSunLight.position.set(0, 3, 4);
    shadowModel3dSunLight.target.position.set(0, 0, 0);
    shadowModel3dSunLight.target.updateMatrixWorld();
    shadowModel3dSunLight.shadow.camera.updateProjectionMatrix();
    if (shadowModel3dRenderer) shadowModel3dRenderer.shadowMap.needsUpdate = true;
    return;
  }

  const THREE = threeModule;
  const source = new THREE.Vector3(solar.sun.sy, solar.sun.sz, solar.sun.sx).normalize();
  const distance = Math.max(shadowModel3dBaseDistance * 3.2, 6);
  shadowModel3dSunLight.intensity = 5.2;
  shadowModel3dSunLight.castShadow = true;
  shadowModel3dSunLight.position.copy(source.multiplyScalar(distance));
  shadowModel3dSunLight.target.position.set(0, 0, 0);
  shadowModel3dSunLight.target.updateMatrixWorld();
  shadowModel3dSunLight.shadow.camera.updateProjectionMatrix();
  if (shadowModel3dRenderer) shadowModel3dRenderer.shadowMap.needsUpdate = true;
}

async function renderWindowShadow3d(state, solar = getShadowSun(state)) {
  if (!refs.windowShadowModal.classList.contains("open")) return;
  const renderToken = ++shadowModel3dRenderToken;

  try {
    await loadThreeModule();
    if (renderToken !== shadowModel3dRenderToken) return;
    initWindowShadow3dScene();
    const metrics = rebuildModel3d(state, shadowModel3dGroup, {
      includeGrid: false,
      updateBaseDistance: false
    });
    if (renderToken !== shadowModel3dRenderToken) return;
    shadowModel3dBaseDistance = Math.max(metrics ? metrics.modelSpan : 3, 2.2);
    if (solar.direct) addWindowShadowReceiver(state);
    if (shadowModel3dGroup) shadowModel3dGroup.rotation.set(0, 0, 0);
    updateWindowShadow3dSun(solar);
    resizeWindowShadow3dRenderer();
    shadowModel3dRenderer.render(shadowModel3dScene, shadowModel3dCamera);
  } catch (error) {
    console.error(error);
    refs.windowShadowStatus.textContent = "Não foi possível carregar a vista 3D da sombra.";
  }
}

function getReportSeasonalShadowMoments() {
  return [
    { label: "Solstício de verão", dateLabel: "21 dez", day: 355 },
    { label: "Equinócio de outono", dateLabel: "20 mar", day: 79 },
    { label: "Solstício de inverno", dateLabel: "21 jun", day: 172 },
    { label: "Equinócio de primavera", dateLabel: "22 set", day: 265 }
  ].map((season) => ({
    ...season,
    views: [9, 12, 15].map((hour) => ({
      hour,
      timeLabel: formatSolarTime(hour)
    }))
  }));
}

async function captureWindowShadow3dReportImage(state, solar, size = { width: 420, height: 280 }) {
  await loadThreeModule();
  initWindowShadow3dScene();
  const metrics = rebuildModel3d(state, shadowModel3dGroup, {
    includeGrid: false,
    updateBaseDistance: false
  });
  shadowModel3dBaseDistance = Math.max(metrics ? metrics.modelSpan : 3, 2.2);
  if (solar.direct) addWindowShadowReceiver(state);
  if (shadowModel3dGroup) shadowModel3dGroup.rotation.set(0, 0, 0);
  updateWindowShadow3dSun(solar);
  resizeWindowShadow3dRenderer(size);
  shadowModel3dRenderer.render(shadowModel3dScene, shadowModel3dCamera);
  await nextFrame();
  return getCanvasDataUrl(refs.windowShadow3dCanvas, "A vista frontal 3D");
}

async function captureSeasonalShadowReportViews(state) {
  const seasons = getReportSeasonalShadowMoments();

  for (const season of seasons) {
    for (const view of season.views) {
      const solar = getShadowSunForMoment(state, season.day, view.hour);
      const ratio = solar.direct ? getWindowShadeRatioForSun(solar.sun, state, 43, 43) : 0;
      view.direct = solar.direct;
      view.reason = solar.reason;
      view.percent = ratio * 100;
      view.image = await captureWindowShadow3dReportImage(state, solar);
    }
  }

  if (refs.windowShadowModal.classList.contains("open")) {
    renderWindowShadow(state);
  }

  return seasons;
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

function getProjectPayload() {
  return {
    app: "BriseLab",
    type: "briselab-project",
    version: PROJECT_FILE_VERSION,
    savedAt: new Date().toISOString(),
    config: getPersistableConfig()
  };
}

function downloadProjectFile() {
  closeChartActionsMenu();
  const state = getState();
  const today = new Date().toISOString().slice(0, 10);
  const payload = JSON.stringify(getProjectPayload(), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  downloadBlob(blob, `projeto-briselab-${getSafeFilePart(state.local.cidade)}-${today}.json`);
}

function loadProjectFromFile(file) {
  if (!file) return;

  setUiBlocked(true, "Carregando Projeto");
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || "{}"));
      const config = payload.config || payload;
      if (!config || !config.fields) {
        throw new Error("Arquivo de projeto inválido.");
      }

      applyPersistableConfig(config);
      saveAppConfig();
      render({ updateMask: true });
    } catch (error) {
      setUiBlocked(false);
      alert(`Não foi possível carregar o projeto.\n\nDetalhe: ${error.message || error}`);
    } finally {
      refs.projectFileInput.value = "";
      setUiBlocked(false);
    }
  };
  reader.onerror = () => {
    setUiBlocked(false);
    alert("Não foi possível ler o arquivo de projeto.");
    refs.projectFileInput.value = "";
  };
  reader.readAsText(file);
}

function openProjectFilePicker() {
  closeChartActionsMenu();
  refs.projectFileInput.click();
}

function setChartActionsMenu(open) {
  const menuRoot = refs.chartActionsButton.closest(".action-menu");
  menuRoot.classList.toggle("open", open);
  refs.chartActionsButton.setAttribute("aria-expanded", open ? "true" : "false");
  refs.chartActionsMenu.setAttribute("aria-hidden", open ? "false" : "true");
}

function toggleChartActionsMenu() {
  const menuRoot = refs.chartActionsButton.closest(".action-menu");
  setChartActionsMenu(!menuRoot.classList.contains("open"));
}

function closeChartActionsMenu() {
  setChartActionsMenu(false);
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

function drawExportHeatScale(context, parentRect) {
  const scale = refs.chartCard.querySelector(".heat-scale");
  if (!scale) return;

  const scaleStyle = window.getComputedStyle(scale);
  const title = scale.querySelector(".heat-scale-title");
  const bar = scale.querySelector(".heat-scale-bar");
  const ticks = scale.querySelector(".heat-scale-ticks");
  const titleRect = getRelativeRect(title, parentRect);
  const barRect = getRelativeRect(bar, parentRect);
  const isHorizontal = barRect.w > barRect.h;
  const gradient = isHorizontal
    ? context.createLinearGradient(barRect.x, 0, barRect.x + barRect.w, 0)
    : context.createLinearGradient(0, barRect.y + barRect.h, 0, barRect.y);

  gradient.addColorStop(0, "rgba(186, 77, 45, 0.12)");
  gradient.addColorStop(0.34, "rgba(226, 163, 88, 0.38)");
  gradient.addColorStop(0.66, "rgba(206, 112, 54, 0.56)");
  gradient.addColorStop(1, "rgba(186, 77, 45, 0.72)");

  context.fillStyle = scaleStyle.color;
  context.font = `700 ${scaleStyle.fontSize} ${scaleStyle.fontFamily}`;
  context.textBaseline = "top";
  context.fillText(title.innerText.trim(), titleRect.x, titleRect.y);

  context.fillStyle = gradient;
  drawRoundedRect(context, barRect.x, barRect.y, barRect.w, barRect.h, 6);
  context.fill();
  context.strokeStyle = "rgba(126, 81, 52, 0.35)";
  context.lineWidth = 1;
  context.stroke();

  const tickStyle = window.getComputedStyle(ticks);
  context.fillStyle = tickStyle.color;
  context.font = `${tickStyle.fontWeight} ${tickStyle.fontSize} ${tickStyle.fontFamily}`;
  ticks.querySelectorAll("span").forEach((tick) => {
    const tickRect = getRelativeRect(tick, parentRect);
    context.fillText(tick.innerText.trim(), tickRect.x, tickRect.y);
  });

  const filter = readShadeFilter();
  const drawMarker = (percent, side) => {
    const label = `${percent}%`;

    context.save();
    context.fillStyle = "#7b3f2a";
    context.strokeStyle = "rgba(47, 34, 22, 0.16)";
    context.lineWidth = 1;
    context.beginPath();

    if (isHorizontal) {
      const x = barRect.x + barRect.w * (percent / 100);
      const y = side === "max" ? barRect.y - 4 : barRect.y + barRect.h + 4;
      if (side === "max") {
        context.moveTo(x - 7, y - 8);
        context.lineTo(x + 7, y - 8);
        context.lineTo(x, y);
      } else {
        context.moveTo(x, y);
        context.lineTo(x + 7, y + 8);
        context.lineTo(x - 7, y + 8);
      }
      context.closePath();
      context.fill();
      context.stroke();
      context.font = `700 10px ${scaleStyle.fontFamily}`;
      context.textAlign = "center";
      context.textBaseline = side === "max" ? "bottom" : "top";
      context.fillText(label, x, side === "max" ? y - 10 : y + 10);
    } else {
      const y = barRect.y + barRect.h * (1 - percent / 100);
      const x = side === "max" ? barRect.x - 4 : barRect.x + barRect.w + 4;
      if (side === "max") {
        context.moveTo(x - 8, y - 7);
        context.lineTo(x, y);
        context.lineTo(x - 8, y + 7);
      } else {
        context.moveTo(x, y);
        context.lineTo(x + 8, y - 7);
        context.lineTo(x + 8, y + 7);
      }
      context.closePath();
      context.fill();
      context.stroke();
      context.font = `700 10px ${scaleStyle.fontFamily}`;
      context.textAlign = side === "max" ? "right" : "left";
      context.textBaseline = "middle";
      context.fillText(label, side === "max" ? x - 10 : x + 10, y);
    }

    context.restore();
  };

  drawMarker(filter.max, "max");
  drawMarker(filter.min, "min");
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

  if (colonIndex > 0 && !line.startsWith("Observação")) {
    const label = line.slice(0, colonIndex + 1);
    const value = line.slice(colonIndex + 1);
    context.font = `700 ${style.fontSize} ${style.fontFamily}`;
    context.fillText(label, x, y);
    const labelWidth = context.measureText(label).width;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.fillText(value, x + labelWidth + 4, y);
    return;
  }

  context.font = line.startsWith("Observação")
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

function createSolarChartExportCanvas(scale = 2) {
  const cardRect = refs.chartCard.getBoundingClientRect();
  const width = Math.ceil(cardRect.width);
  const height = Math.ceil(cardRect.height);
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  exportCtx.scale(scale, scale);
  drawExportCardBackground(exportCtx, width, height);
  drawElementText(exportCtx, refs.chartCard.querySelector(".chart-head h2"), cardRect);
  drawElementText(exportCtx, refs.chartCard.querySelector(".chart-head p"), cardRect);
  drawExportSolarCanvas(exportCtx, cardRect);
  drawExportHeatScale(exportCtx, cardRect);
  drawExportLegend(exportCtx, cardRect);
  drawExportSummary(exportCtx, cardRect);
  return exportCanvas;
}

function drawReportHeatScale(context, x, y, width, height) {
  const gradient = context.createLinearGradient(0, y + height, 0, y);
  const filter = readShadeFilter();

  gradient.addColorStop(0, "rgba(186, 77, 45, 0.12)");
  gradient.addColorStop(0.34, "rgba(226, 163, 88, 0.38)");
  gradient.addColorStop(0.66, "rgba(206, 112, 54, 0.56)");
  gradient.addColorStop(1, "rgba(186, 77, 45, 0.72)");

  context.fillStyle = "#4d473f";
  context.font = "700 15px 'Sora', 'Segoe UI', sans-serif";
  context.textBaseline = "top";
  context.textAlign = "center";
  context.fillText("Sombreamento", x + width / 2, y - 34);

  context.fillStyle = gradient;
  drawRoundedRect(context, x, y, width, height, 8);
  context.fill();
  context.strokeStyle = "rgba(126, 81, 52, 0.35)";
  context.lineWidth = 1.2;
  context.stroke();

  context.font = "700 14px 'IBM Plex Sans', 'Segoe UI', sans-serif";
  context.fillStyle = "#6b6259";
  context.textAlign = "left";
  [100, 75, 50, 25, 0].forEach((tick) => {
    const tickY = y + height * (1 - tick / 100);
    context.fillText(`${tick}%`, x + width + 22, tickY - 7);
  });

  const drawMarker = (percent, side) => {
    const markerY = y + height * (1 - percent / 100);
    const markerX = side === "max" ? x - 8 : x + width + 8;
    context.save();
    context.fillStyle = "#7b3f2a";
    context.strokeStyle = "rgba(47, 34, 22, 0.16)";
    context.lineWidth = 1;
    context.beginPath();
    if (side === "max") {
      context.moveTo(markerX - 11, markerY - 8);
      context.lineTo(markerX, markerY);
      context.lineTo(markerX - 11, markerY + 8);
    } else {
      context.moveTo(markerX, markerY);
      context.lineTo(markerX + 11, markerY - 8);
      context.lineTo(markerX + 11, markerY + 8);
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.font = "700 13px 'IBM Plex Sans', 'Segoe UI', sans-serif";
    context.textBaseline = "middle";
    context.textAlign = side === "max" ? "right" : "left";
    context.fillText(`${percent}%`, side === "max" ? markerX - 14 : markerX + 14, markerY);
    context.restore();
  };

  drawMarker(filter.max, "max");
  drawMarker(filter.min, "min");
}

function drawReportLegend(context, x, y) {
  const items = [
    { color: "#c8baa5", text: "Grade estereogrÃ¡fica" },
    { color: "#0f5f7a", text: "TrajetÃ³rias solares (meses)" },
    { color: "#4c9464", text: "Linhas horÃ¡rias" },
    { color: "#7b1f1b", text: "Linha da fachada" },
    { color: "#d58c73", text: "Mapa de calor da Ã¡rea sombreada" }
  ];
  let cursorX = x;

  context.font = "500 14px 'IBM Plex Sans', 'Segoe UI', sans-serif";
  context.textBaseline = "middle";
  context.fillStyle = "#635a50";

  items.forEach((item) => {
    context.fillStyle = item.color;
    drawRoundedRect(context, cursorX, y - 6, 18, 12, 4);
    context.fill();
    context.fillStyle = "#635a50";
    context.fillText(item.text, cursorX + 26, y);
    cursorX += context.measureText(item.text).width + 54;
  });
}

function createSolarChartReportCanvas(scale = 2) {
  const width = 1200;
  const height = 900;
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");
  const header = refs.chartCard.querySelector(".chart-head");
  const title = header.querySelector("h2").innerText.trim();
  const subtitle = header.querySelector("p").innerText.trim();
  const chartSize = 680;
  const chartX = 76;
  const chartY = 118;

  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  exportCtx.scale(scale, scale);

  drawExportCardBackground(exportCtx, width, height);
  exportCtx.fillStyle = "#24201c";
  exportCtx.font = "700 24px 'Sora', 'Segoe UI', sans-serif";
  exportCtx.textBaseline = "top";
  exportCtx.fillText(title, 36, 32);
  exportCtx.fillStyle = "#676058";
  exportCtx.font = "600 15px 'IBM Plex Sans', 'Segoe UI', sans-serif";
  exportCtx.fillText(subtitle, 36, 66);

  exportCtx.save();
  drawRoundedRect(exportCtx, chartX, chartY, chartSize, chartSize, 16);
  exportCtx.clip();
  exportCtx.fillStyle = "#fff8f0";
  exportCtx.fillRect(chartX, chartY, chartSize, chartSize);
  exportCtx.drawImage(refs.canvas, chartX, chartY, chartSize, chartSize);
  exportCtx.restore();
  exportCtx.strokeStyle = "#d4c6b3";
  exportCtx.lineWidth = 1.2;
  drawRoundedRect(exportCtx, chartX, chartY, chartSize, chartSize, 16);
  exportCtx.stroke();

  drawReportHeatScale(exportCtx, 850, 176, 24, 548);
  drawReportLegend(exportCtx, 76, 835);

  return exportCanvas;
}

function downloadSolarChartImage() {
  render();

  const state = getState();
  const exportCanvas = createSolarChartExportCanvas(2);

  getCanvasBlob(exportCanvas, "A carta solar").then((blob) => {
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `carta-solar-${getSafeFilePart(state.local.cidade)}-${today}.png`);
  }).catch((error) => {
    alert(error.message || error);
  });
}

function loadJsPdfModule() {
  if (window.jspdf && window.jspdf.jsPDF) {
    return Promise.resolve(window.jspdf.jsPDF);
  }

  if (!jsPdfLoadPromise) {
    jsPdfLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = JSPDF_CDN_URL;
      script.async = true;
      script.onload = () => {
        if (window.jspdf && window.jspdf.jsPDF) {
          resolve(window.jspdf.jsPDF);
        } else {
          reject(new Error("jsPDF carregou, mas não expôs window.jspdf.jsPDF."));
        }
      };
      script.onerror = () => reject(new Error("Falha ao carregar jsPDF via CDN."));
      document.head.appendChild(script);
    });
  }

  return jsPdfLoadPromise;
}

function getActiveProtectionReportLines(state) {
  const lines = [];
  const h = state.briseHorizontal;
  if (h.ativo) {
    lines.push(
      "Brise horizontal",
      `Lâminas: ${h.numero}`,
      `Espaçamento vertical: ${h.espacamento.toFixed(2)} m`,
      `Ângulo: ${h.angulo.toFixed(1)}°`,
      `Distância da janela: ${h.distancia.toFixed(2)} m`,
      `Profundidade: ${h.profundidade.toFixed(2)} m`,
      `Espessura: ${h.espessura.toFixed(2)} m`,
      `Afastamento do topo: ${h.offsetTopo.toFixed(2)} m`,
      `Sobreposição lateral: ${h.sobreposicao.toFixed(2)} m`
    );
  }

  const left = state.briseVertical.esquerdo;
  const right = state.briseVertical.direito;
  if (left.ativo || right.ativo) {
    lines.push("Brise vertical");
    if (left.ativo) {
      lines.push(
        `Lado esquerdo: projeção ${left.projecao.toFixed(2)} m, espessura ${left.espessura.toFixed(2)} m, afastamento ${left.offset.toFixed(2)} m, sobreposição superior ${left.top.toFixed(2)} m`
      );
    }
    if (right.ativo) {
      lines.push(
        `Lado direito: projeção ${right.projecao.toFixed(2)} m, espessura ${right.espessura.toFixed(2)} m, afastamento ${right.offset.toFixed(2)} m, sobreposição superior ${right.top.toFixed(2)} m`
      );
    }
  }

  const mq = state.marquise;
  if (mq.ativo) {
    lines.push(
      "Marquise",
      `Afastamento do topo: ${mq.offsetTopo.toFixed(2)} m`,
      `Projeção: ${mq.projecao.toFixed(2)} m`,
      `Espessura: ${mq.espessura.toFixed(2)} m`,
      `Sobreposição lateral: ${mq.sobreposicao.toFixed(2)} m`
    );
  }

  return lines.length ? lines : ["Nenhuma proteção ativa"];
}

function getProtectionReportSections(state) {
  const h = state.briseHorizontal;
  const left = state.briseVertical.esquerdo;
  const right = state.briseVertical.direito;
  const mq = state.marquise;

  const horizontalLines = h.ativo
    ? [
      `Lâminas: ${h.numero}`,
      `Espaç. vertical: ${h.espacamento.toFixed(2)} m`,
      `Ângulo: ${h.angulo.toFixed(1)}°`,
      `Dist. janela: ${h.distancia.toFixed(2)} m`,
      `Profundidade: ${h.profundidade.toFixed(2)} m`,
      `Espessura: ${h.espessura.toFixed(2)} m`,
      `Afast. topo: ${h.offsetTopo.toFixed(2)} m`,
      `Sobrep. lateral: ${h.sobreposicao.toFixed(2)} m`
    ]
    : ["Não ativo"];

  const verticalLines = [];
  if (left.ativo) {
    verticalLines.push(
      "Esquerdo",
      `Proj.: ${left.projecao.toFixed(2)} m`,
      `Esp.: ${left.espessura.toFixed(2)} m`,
      `Afast.: ${left.offset.toFixed(2)} m`,
      `Sobrep. sup.: ${left.top.toFixed(2)} m`
    );
  }
  if (right.ativo) {
    verticalLines.push(
      "Direito",
      `Proj.: ${right.projecao.toFixed(2)} m`,
      `Esp.: ${right.espessura.toFixed(2)} m`,
      `Afast.: ${right.offset.toFixed(2)} m`,
      `Sobrep. sup.: ${right.top.toFixed(2)} m`
    );
  }
  if (!verticalLines.length) verticalLines.push("Não ativo");

  const marquiseLines = mq.ativo
    ? [
      `Afast. topo: ${mq.offsetTopo.toFixed(2)} m`,
      `Projeção: ${mq.projecao.toFixed(2)} m`,
      `Espessura: ${mq.espessura.toFixed(2)} m`,
      `Sobrep. lateral: ${mq.sobreposicao.toFixed(2)} m`
    ]
    : ["Não ativa"];

  return [
    { title: "Brise horizontal", lines: horizontalLines },
    { title: "Brise vertical", lines: verticalLines },
    { title: "Marquise", lines: marquiseLines }
  ];
}

function addReportText(doc, text, x, y, options = {}) {
  const size = options.size || 10;
  const color = options.color || [57, 53, 47];
  const style = options.style || "normal";
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  if (options.align) {
    doc.text(String(text), x, y, { align: options.align });
  } else {
    doc.text(String(text), x, y);
  }
}

function addReportSectionTitle(doc, title, x, y) {
  doc.setDrawColor(186, 77, 45);
  doc.setLineWidth(1.2);
  doc.line(x, y + 4, x + 34, y + 4);
  addReportText(doc, title.toUpperCase(), x + 42, y + 7, {
    size: 9,
    color: [97, 74, 56],
    style: "bold"
  });
}

function addReportCard(doc, x, y, width, height, fill = [255, 255, 255]) {
  doc.setFillColor(...fill);
  doc.setDrawColor(215, 206, 192);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, 8, 8, "FD");
}

function addReportWrappedLines(doc, lines, x, y, maxWidth, lineHeight = 13) {
  let cursorY = y;
  lines.forEach((line, index) => {
    const isHeading = index === 0 || ["Brise horizontal", "Brise vertical", "Marquise"].includes(line);
    doc.setFont("helvetica", isHeading ? "bold" : "normal");
    doc.setFontSize(isHeading ? 10.5 : 9.2);
    doc.setTextColor(isHeading ? 62 : 73, isHeading ? 52 : 67, isHeading ? 43 : 57);
    const wrapped = doc.splitTextToSize(line, maxWidth);
    doc.text(wrapped, x, cursorY);
    cursorY += wrapped.length * lineHeight + (isHeading ? 3 : 0);
  });
  return cursorY;
}

function addReportProtectionColumns(doc, sections, x, y, width, maxHeight) {
  const gap = 12;
  const columnWidth = (width - gap * 2) / 3;
  const headingSize = 8.4;
  const bodySize = 6.7;
  const lineHeight = 6.7;

  sections.forEach((section, index) => {
    const columnX = x + index * (columnWidth + gap);
    let cursorY = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(headingSize);
    doc.setTextColor(62, 52, 43);
    doc.text(section.title, columnX, cursorY);
    cursorY += 9;

    section.lines.forEach((line) => {
      const isSubheading = ["Esquerdo", "Direito"].includes(line);
      doc.setFont("helvetica", isSubheading ? "bold" : "normal");
      doc.setFontSize(isSubheading ? 7.6 : bodySize);
      doc.setTextColor(isSubheading ? 62 : 73, isSubheading ? 52 : 67, isSubheading ? 43 : 57);

      const wrapped = doc.splitTextToSize(line, columnWidth);
      doc.text(wrapped, columnX, cursorY);
      cursorY += wrapped.length * lineHeight + (isSubheading ? 0.8 : 0);
    });
  });
}

function addOrientationDiagram(doc, state, cx, cy, radius) {
  doc.setDrawColor(203, 186, 165);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, radius, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(74, 64, 53);
  doc.text("N", cx, cy - radius - 7, { align: "center" });
  doc.text("S", cx, cy + radius + 13, { align: "center" });
  doc.text("O", cx - radius - 10, cy + 3, { align: "center" });
  doc.text("L", cx + radius + 10, cy + 3, { align: "center" });

  doc.setDrawColor(220, 207, 189);
  doc.line(cx, cy - radius, cx, cy + radius);
  doc.line(cx - radius, cy, cx + radius, cy);

  const angle = state.local.orientacao * DEG;
  const x = cx + Math.sin(angle) * radius * 0.86;
  const y = cy - Math.cos(angle) * radius * 0.86;
  doc.setDrawColor(186, 77, 45);
  doc.setFillColor(186, 77, 45);
  doc.setLineWidth(2.2);
  doc.line(cx, cy, x, y);
  doc.circle(x, y, 3.2, "F");
  addReportText(doc, `${Math.round(state.local.orientacao)}°`, cx, cy + radius + 28, {
    size: 9,
    color: [74, 64, 53],
    style: "bold",
    align: "center"
  });
}

function addImageFit(doc, imageData, x, y, maxWidth, maxHeight) {
  const props = doc.getImageProperties(imageData);
  const ratio = Math.min(maxWidth / props.width, maxHeight / props.height);
  const width = props.width * ratio;
  const height = props.height * ratio;
  const drawX = x + (maxWidth - width) / 2;
  doc.addImage(imageData, "PNG", drawX, y, width, height, undefined, "FAST");
  return { x: drawX, y, width, height };
}

function getCanvasDataUrl(canvas, label) {
  try {
    return canvas.toDataURL("image/png");
  } catch (error) {
    if (error && error.name === "SecurityError") {
      throw new Error(`${label} nao pode ser exportado porque o navegador marcou o canvas como inseguro. Recarregue a aplicacao por http://127.0.0.1 ou http://localhost e tente novamente.`);
    }
    throw error;
  }
}

function getCanvasBlob(canvas, label) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`${label} nao gerou imagem para download.`));
        }
      }, "image/png");
    } catch (error) {
      if (error && error.name === "SecurityError") {
        reject(new Error(`${label} nao pode ser exportado porque o navegador marcou o canvas como inseguro. Recarregue a aplicacao por http://127.0.0.1 ou http://localhost e tente novamente.`));
        return;
      }
      reject(error);
    }
  });
}

async function waitForReportBrandFont() {
  if (!document.fonts) return;

  try {
    if (document.fonts.load) {
      await Promise.race([
        document.fonts.load('700 34px "Sora"'),
        new Promise((resolve) => window.setTimeout(resolve, 700))
      ]);
    }
    if (document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => window.setTimeout(resolve, 700))
      ]);
    }
  } catch (error) {
    // Font loading can fail offline; the canvas will fall back to the app's sans-serif stack.
  }
}

function createReportBrandImage() {
  const scale = 3;
  const canvas = document.createElement("canvas");
  const width = 178;
  const height = 50;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.clearRect(0, 0, width, height);
  context.font = '700 34px "Sora", "Segoe UI", sans-serif';
  context.textBaseline = "alphabetic";

  const x = 2;
  const y = 37;
  const brise = "Brise";
  context.fillStyle = "#1f1f1a";
  context.fillText(brise, x, y);
  context.fillStyle = "#ba4d2d";
  context.fillText("Lab", x + context.measureText(brise).width, y);

  return getCanvasDataUrl(canvas, "A marca BriseLab");
}

function addReportHeaderBrand(doc, pageW, margin, brandImage) {
  doc.addImage(brandImage, "PNG", pageW - margin - 108, 30, 108, 30, undefined, "FAST");
}

function addReportFooter(doc, pageW, pageH, margin, reportDate) {
  addReportText(doc, reportDate, margin, pageH - 28, {
    size: 9,
    color: [130, 112, 89],
    style: "bold"
  });
  addReportText(doc, "https://briselab.netlify.app", pageW - margin, pageH - 28, {
    size: 9,
    color: [130, 112, 89],
    style: "bold",
    align: "right"
  });
}

function formatReportPercent(value) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function addSeasonalShadowReportPage(doc, seasonalViews, pageW, pageH, margin, reportDate, brandImage) {
  const contentW = pageW - margin * 2;
  const columnGap = 10;
  const cellW = (contentW - columnGap * 2) / 3;
  const cellH = 126;
  const rowPitch = 164;
  const startY = 108;

  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");
  addReportHeaderBrand(doc, pageW, margin, brandImage);

  addReportText(doc, "Vistas frontais de sombreamento", margin, 54, {
    size: 20,
    style: "bold",
    color: [31, 31, 26]
  });
  addReportText(doc, "Solstícios e equinócios às 09:00, 12:00 e 15:00", margin, 75, {
    size: 10,
    color: [90, 90, 82]
  });

  seasonalViews.forEach((season, rowIndex) => {
    const rowY = startY + rowIndex * rowPitch;
    addReportText(doc, `${season.label} · ${season.dateLabel}`, margin, rowY, {
      size: 10,
      color: [97, 74, 56],
      style: "bold"
    });

    season.views.forEach((view, columnIndex) => {
      const x = margin + columnIndex * (cellW + columnGap);
      const y = rowY + 12;
      addReportCard(doc, x, y, cellW, cellH);
      addReportText(doc, view.timeLabel, x + 10, y + 18, {
        size: 9,
        color: [62, 52, 43],
        style: "bold"
      });
      addReportText(doc, `Sombra ${formatReportPercent(view.percent)}`, x + cellW - 10, y + 18, {
        size: 8.5,
        color: view.direct ? [186, 77, 45] : [130, 112, 89],
        style: "bold",
        align: "right"
      });

      addImageFit(doc, view.image, x + 9, y + 28, cellW - 18, 74);
      addReportText(doc, view.direct ? "Incidência direta" : "Sem sol direto", x + cellW / 2, y + 113, {
        size: 7.8,
        color: [90, 90, 82],
        align: "center"
      });
    });
  });

  addReportFooter(doc, pageW, pageH, margin, reportDate);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function captureModel3dReportImages(state) {
  await loadThreeModule();
  initModel3dScene();

  const savedZoom = model3dZoom;
  const savedRotation = model3dGroup
    ? { x: model3dGroup.rotation.x, y: model3dGroup.rotation.y, z: model3dGroup.rotation.z }
    : null;

  renderWindowModel3d(state);

  const capture = async ({ rotationY, cameraView = "perspective" }) => {
    if (model3dGroup) {
      model3dGroup.rotation.x = MODEL3D_DEFAULT_ROTATION_X;
      model3dGroup.rotation.y = rotationY;
      model3dGroup.rotation.z = 0;
    }
    model3dZoom = 1;
    renderModel3dScene(cameraView);
    await nextFrame();
    return getCanvasDataUrl(refs.windowModel3dCanvas, "O modelo 3D");
  };

  const images = {
    perspective: await capture({ rotationY: MODEL3D_DEFAULT_ROTATION_Y }),
    front: await capture({ rotationY: 0, cameraView: "front" }),
    side: await capture({ rotationY: 0, cameraView: "side" })
  };

  model3dZoom = savedZoom;
  if (model3dGroup && savedRotation) {
    model3dGroup.rotation.set(savedRotation.x, savedRotation.y, savedRotation.z);
  }
  renderModel3dScene();
  return images;
}

async function downloadSolarReportPdf() {
  setUiBlocked(true);
  try {
    render({ updateMask: true });
    await nextFrame();

    const state = getState();
    const jsPDF = await loadJsPdfModule();
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 38;
    const contentW = pageW - margin * 2;
    const generatedAt = new Date();
    const today = generatedAt.toLocaleDateString("pt-BR");
    const reportDate = generatedAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    const chartImage = getCanvasDataUrl(createSolarChartReportCanvas(1.7), "A carta solar");
    const modelImages = await captureModel3dReportImages(state);
    const seasonalShadowViews = await captureSeasonalShadowReportViews(state);
    await waitForReportBrandFont();
    const brandImage = createReportBrandImage();
    const directSunStats = estimateBlockedDirectSunHours(state);
    const protectionSections = getProtectionReportSections(state);

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW, pageH, "F");
    addReportHeaderBrand(doc, pageW, margin, brandImage);

    addReportText(doc, "Relatório de análise solar", margin, 54, {
      size: 22,
      style: "bold",
      color: [31, 31, 26]
    });
    addReportText(doc, `${state.local.cidade} · ${today}`, margin, 76, {
      size: 10,
      color: [90, 90, 82]
    });

    addReportCard(doc, margin, 102, contentW, 132);
    addReportSectionTitle(doc, "Local e orientação", margin + 18, 124);
    addReportText(doc, "Cidade", margin + 18, 154, { size: 8.5, color: [90, 90, 82], style: "bold" });
    addReportText(doc, state.local.cidade, margin + 18, 170, { size: 14, style: "bold" });
    addReportText(doc, "Latitude", margin + 18, 196, { size: 8.5, color: [90, 90, 82], style: "bold" });
    addReportText(doc, `${state.local.latitude.toFixed(2)}°`, margin + 18, 212, { size: 12, style: "bold" });
    addOrientationDiagram(doc, state, margin + contentW - 82, 168, 40);

    addReportCard(doc, margin, 252, contentW, 95);
    addReportSectionTitle(doc, "Janela", margin + 18, 274);
    addReportText(doc, `${state.janela.largura.toFixed(2)} m × ${state.janela.altura.toFixed(2)} m`, margin + 18, 308, {
      size: 18,
      style: "bold",
      color: [47, 92, 104]
    });
    addReportText(doc, "Largura × altura", margin + 18, 328, { size: 9, color: [90, 90, 82] });

    addReportCard(doc, margin, 365, contentW, 260);
    addReportSectionTitle(doc, "Modelo 3D", margin + 18, 387);
    const modelImageY = 409;
    const perspectiveW = 300;
    const sideColumnX = margin + 18 + perspectiveW + 18;
    const sideColumnW = contentW - 36 - perspectiveW - 18;
    const perspectiveImage = addImageFit(doc, modelImages.perspective, margin + 18, modelImageY, perspectiveW, 176);
    addReportText(doc, "Perspectiva", perspectiveImage.x + perspectiveImage.width / 2, perspectiveImage.y + perspectiveImage.height + 13, {
      size: 8.5,
      color: [90, 90, 82],
      style: "bold",
      align: "center"
    });
    const frontImage = addImageFit(doc, modelImages.front, sideColumnX, modelImageY, sideColumnW, 78);
    addReportText(doc, "Vista frontal", frontImage.x + frontImage.width / 2, frontImage.y + frontImage.height + 11, {
      size: 8.5,
      color: [90, 90, 82],
      style: "bold",
      align: "center"
    });
    const sideImage = addImageFit(doc, modelImages.side, sideColumnX, modelImageY + 105, sideColumnW, 78);
    addReportText(doc, "Vista lateral", sideImage.x + sideImage.width / 2, sideImage.y + sideImage.height + 11, {
      size: 8.5,
      color: [90, 90, 82],
      style: "bold",
      align: "center"
    });

    addReportCard(doc, margin, 643, contentW, 142);
    addReportSectionTitle(doc, "Proteções ativas", margin + 18, 665);
    addReportProtectionColumns(doc, protectionSections, margin + 18, 690, contentW - 36, 82);
    addReportFooter(doc, pageW, pageH, margin, reportDate);

    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW, pageH, "F");
    addReportHeaderBrand(doc, pageW, margin, brandImage);
    addReportText(doc, "Carta solar e desempenho", margin, 54, {
      size: 20,
      style: "bold",
      color: [31, 31, 26]
    });
    addReportText(doc, "Mapa de calor da área sombreada na janela", margin, 75, {
      size: 10,
      color: [90, 90, 82]
    });

    addReportCard(doc, margin, 96, contentW, 486);
    addImageFit(doc, chartImage, margin + 16, 116, contentW - 32, 446);

    addReportCard(doc, margin, 604, contentW, 138);
    addReportSectionTitle(doc, "Dados da carta solar", margin + 18, 626);
    addReportText(doc, "Sombreamento médio da janela no mapa", margin + 18, 660, {
      size: 9,
      color: [90, 90, 82],
      style: "bold"
    });
    addReportText(doc, `${(lastMaskStats.ratio * 100).toFixed(1)}%`, margin + 18, 684, {
      size: 22,
      color: [186, 77, 45],
      style: "bold"
    });
    addReportText(doc, "Horas equivalentes de área sombreada", margin + 250, 660, {
      size: 9,
      color: [90, 90, 82],
      style: "bold"
    });
    addReportText(doc, `${directSunStats.percent}%`, margin + 250, 684, {
      size: 22,
      color: [47, 92, 104],
      style: "bold"
    });
    addReportText(doc, `${directSunStats.blockedHours} h-eq de ${directSunStats.directHours} h/ano estimadas`, margin + 250, 706, {
      size: 9,
      color: [73, 67, 57]
    });

    addReportFooter(doc, pageW, pageH, margin, reportDate);
    addSeasonalShadowReportPage(doc, seasonalShadowViews, pageW, pageH, margin, reportDate, brandImage);

    const filename = `relatorio-solar-${getSafeFilePart(state.local.cidade)}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error(error);
    alert(`Não foi possível gerar o relatório em PDF.\n\nDetalhe: ${error.message || error}`);
  } finally {
    setUiBlocked(false);
  }
}

function updateSolarChartLayoutSize() {
  const row = refs.canvas.closest(".chart-canvas-row");
  const scale = refs.chartCard.querySelector(".heat-scale");
  if (!row) return 1;

  const rowRect = row.getBoundingClientRect();
  const scaleRect = scale ? scale.getBoundingClientRect() : { width: 0 };
  const rowStyle = window.getComputedStyle(row);
  const gap = parseFloat(rowStyle.columnGap) || 0;
  const isStacked = window.matchMedia("(max-width: 760px)").matches;
  const availableWidth = Math.max(1, rowRect.width - (isStacked ? 0 : scaleRect.width + gap));
  const availableHeight = Math.max(1, rowRect.height);
  const size = Math.floor(Math.min(availableWidth, availableHeight, 860));

  row.style.setProperty("--solar-chart-size", `${size}px`);
  return size;
}

function resizeCanvasForDpr() {
  const dpr = window.devicePixelRatio || 1;
  updateSolarChartLayoutSize();
  const slot = refs.canvas.parentElement;
  const rect = slot.getBoundingClientRect();
  const size = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));

  if (solarCanvasCssSize !== size) {
    refs.canvas.style.width = `${size}px`;
    refs.canvas.style.height = `${size}px`;
  }

  if (solarCanvasCssSize !== size || solarCanvasDpr !== dpr) {
    refs.canvas.width = size * dpr;
    refs.canvas.height = size * dpr;
    solarCanvasCssSize = size;
    solarCanvasDpr = dpr;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawSolarChart(state, { updateMask = true } = {}) {
  resizeCanvasForDpr();
  const width = refs.canvas.width / (window.devicePixelRatio || 1);
  const height = refs.canvas.height / (window.devicePixelRatio || 1);
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) * 0.44;

  drawBaseChart(center, radius);
  const shouldCalculateMask = updateMask || !lastMaskSamples.length;
  const stats = shouldCalculateMask
    ? drawShadeMask(state, center, radius)
    : drawCachedShadeMask(state, center, radius);
  if (shouldCalculateMask) {
    lastMaskStats = stats;
  }
  if (updateMask) {
    maskNeedsUpdate = false;
    setMaskUpdateOverlay(false);
  }
  drawSolarDatePaths(state, center, radius);
  drawHourLines(state, center, radius);
  drawSolarMonthLabels(state, center, radius);
  drawFacadePlaneLine(state, center, radius);
  drawFacadeDirection(state, center, radius);
  return stats;
}

function renderOrientationPreview() {
  const state = getState();
  updateChartHeader(state);
  drawSolarChart(state, { updateMask: false });
}

function scheduleOrientationPreview() {
  if (orientationRenderFrame) return;
  orientationRenderFrame = requestAnimationFrame(() => {
    orientationRenderFrame = 0;
    renderOrientationPreview();
  });
}

function renderOrientationFinal() {
  if (orientationRenderFrame) {
    cancelAnimationFrame(orientationRenderFrame);
    orientationRenderFrame = 0;
  }
  const state = getState();
  const stats = drawSolarChart(state, { updateMask: false });
  updateSummary(state, stats);
  renderWindowShadow(state);
}

function updateShadeFilterFromUserAction(input) {
  syncShadeFilterControls(input, { writeValues: false });
  hideShadowPointTooltip();
}

function flushShadeFilterRender(input) {
  syncShadeFilterControls(input);
  hideShadowPointTooltip();

  runWithSolarChartLoading(() => {
    const state = getState();
    const stats = drawSolarChart(state, { updateMask: false });
    updateSummary(state, stats);
  });
}

function getShadeValueFromPointer(limit, event) {
  const rect = refs.heatScaleControl.getBoundingClientRect();
  const isStacked = window.matchMedia("(max-width: 760px)").matches;
  const raw = isStacked
    ? ((event.clientX - rect.left) / rect.width) * 100
    : 100 - ((event.clientY - rect.top) / rect.height) * 100;
  return clamp(Math.round(raw), SHADE_FILTER_MIN, SHADE_FILTER_MAX);
}

function setShadeLimitFromPointer(label, event, shouldFlush = false) {
  const limit = label.dataset.shadeLimit;
  const input = limit === "max" ? refs.shadeMax : refs.shadeMin;
  input.value = String(getShadeValueFromPointer(limit, event));
  syncShadeFilterControls(input, { writeValues: shouldFlush });

  if (shouldFlush) {
    flushShadeFilterRender(input);
    saveAppConfig();
  }
}

function bindShadeLimitSliders() {
  refs.heatScaleControl.querySelectorAll(".shade-limit").forEach((label) => {
    label.addEventListener("click", (event) => {
      event.preventDefault();
    });

    label.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      label.setPointerCapture(event.pointerId);
      setShadeLimitFromPointer(label, event);
    });

    label.addEventListener("pointermove", (event) => {
      if (!label.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      setShadeLimitFromPointer(label, event);
    });

    const finishDrag = (event) => {
      if (!label.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      setShadeLimitFromPointer(label, event, true);
      label.releasePointerCapture(event.pointerId);
    };

    label.addEventListener("pointerup", finishDrag);
    label.addEventListener("pointercancel", finishDrag);
  });
}

function render({ updateMask = true } = {}) {
  syncShadeFilterControls();
  updateBriseSpacingDisplay();
  const state = getState();
  const stats = drawSolarChart(state, { updateMask });
  updateSummary(state, stats);
  renderWindowShadow(state);
  renderWindowModel3d(state);
}

function refreshLayoutSurfaces() {
  updateBriseSpacingDisplay();
  const state = getState();
  updateChartHeader(state);
  drawSolarChart(state, { updateMask: false });
  renderWindowShadow(state);
  renderModel3dScene();
}

function scheduleRender() {
  if (renderFrame) cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    refreshLayoutSurfaces();
  });
}

function updateMaskFromUserAction() {
  if (isUpdatingMask) return;
  isUpdatingMask = true;
  setMaskUpdateOverlay(false);
  runWithSolarChartLoading(() => {
    try {
      render({ updateMask: true });
      saveAppConfig();
    } finally {
      isUpdatingMask = false;
    }
  });
}

function updateBriseSpacingDisplay() {
  const height = Math.max(0.1, Number(refs.janelaAltura.value) || 1.5);
  const numero = Math.max(2, Math.floor(Number(refs.bhNumero.value) || 2));
  const espacamento = calculateHorizontalBriseSpacing(height, numero);
  refs.bhEspacamentoDisplay.textContent = espacamento.toFixed(2);
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
      saveAppConfig();
    });
  });
}

function bindInputs() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    if (input.type === "file") return;

    input.addEventListener("input", () => {
      if (input === refs.shadowDate || input === refs.shadowTime) {
        renderWindowShadow();
        saveAppConfig();
        return;
      }

      if (input === refs.shadeMin || input === refs.shadeMax) {
        updateShadeFilterFromUserAction(input);
        return;
      }

      if (input === refs.orientacao) {
        scheduleOrientationPreview();
        saveAppConfig();
        return;
      }

      renderLiveSurfaces();
      markMaskNeedsUpdate();
      saveAppConfig();
    });
    input.addEventListener("change", () => {
      if (input === refs.shadowDate || input === refs.shadowTime) {
        renderWindowShadow();
        saveAppConfig();
        return;
      }

      if (input === refs.shadeMin || input === refs.shadeMax) {
        flushShadeFilterRender(input);
        saveAppConfig();
        return;
      }

      if (input === refs.orientacao) {
        renderOrientationFinal();
        saveAppConfig();
        return;
      }

      renderLiveSurfaces();
      markMaskNeedsUpdate();
      saveAppConfig();
    });
  });

  refs.capitalSelector.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "custom") {
      refs.cidade.disabled = false;
      refs.latitude.disabled = false;
      saveAppConfig();
      return;
    }

    const [lat, lon, city] = val.split(":");
    refs.latitude.value = parseFloat(lat);
    refs.cidade.value = city;
    refs.cidade.disabled = true;
    refs.latitude.disabled = true;
    renderLiveSurfaces();
    markMaskNeedsUpdate();
    saveAppConfig();
  });

  refs.cidade.addEventListener("input", () => {
    if (refs.cidade.disabled) return;
    refs.capitalSelector.value = "custom";
    saveAppConfig();
  });

  refs.latitude.addEventListener("input", () => {
    if (refs.latitude.disabled) return;
    refs.capitalSelector.value = "custom";
    saveAppConfig();
  });

  window.addEventListener("resize", scheduleRender);

  refs.canvas.addEventListener("mousemove", updateShadowPointTooltip);
  refs.canvas.addEventListener("mouseleave", hideShadowPointTooltip);
  refs.chartActionsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleChartActionsMenu();
  });
  refs.chartActionsMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  refs.downloadSolarChart.addEventListener("click", () => {
    closeChartActionsMenu();
    downloadSolarChartImage();
  });
  refs.downloadSolarReport.addEventListener("click", () => {
    closeChartActionsMenu();
    downloadSolarReportPdf();
  });
  refs.saveProject.addEventListener("click", downloadProjectFile);
  refs.loadProject.addEventListener("click", openProjectFilePicker);
  refs.projectFileInput.addEventListener("change", () => {
    loadProjectFromFile(refs.projectFileInput.files && refs.projectFileInput.files[0]);
  });
  refs.updateMaskButton.addEventListener("click", updateMaskFromUserAction);
  refs.resetModel3dView.addEventListener("click", resetModel3dView);
  refs.resetModel3dViewModal.addEventListener("click", resetModel3dView);
  refs.expandModel3d.addEventListener("click", openModel3dModal);
  refs.closeModel3dModal.addEventListener("click", closeModel3dModal);
  refs.model3dModal.addEventListener("click", (event) => {
    if (event.target === refs.model3dModal) closeModel3dModal();
  });
  refs.openWindowShadow.addEventListener("click", openWindowShadowModal);
  refs.closeWindowShadow.addEventListener("click", closeWindowShadowModal);
  refs.windowShadowModal.addEventListener("click", (event) => {
    if (event.target === refs.windowShadowModal) closeWindowShadowModal();
  });
  document.querySelectorAll("[data-shadow-step]").forEach((button) => {
    button.addEventListener("click", () => {
      shiftShadowControl(button.dataset.shadowStep, button.dataset.delta);
    });
  });
  document.querySelectorAll("[data-shadow-date]").forEach((button) => {
    button.addEventListener("click", () => {
      jumpToShadowDate(button.dataset.shadowDate);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && refs.windowShadowModal.classList.contains("open")) {
      closeWindowShadowModal();
    }
    if (event.key === "Escape") {
      closeChartActionsMenu();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".action-menu")) {
      closeChartActionsMenu();
    }
  });
}

function initApp() {
  syncLocalFieldLocks();

  if (!didRestoreConfig) refs.shadowDate.value = getDayOfYear(new Date());
}

function initLayoutObservers() {
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleRender);
    observer.observe(refs.canvas.parentElement);
    observer.observe(refs.chartCard);
    observer.observe(refs.windowModel3dSlot);
    observer.observe(refs.model3dModalSlot);
    observer.observe(refs.windowShadow3dCanvas.parentElement);
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
restoreAppConfig();
syncShadeFilterControls();
bindInputs();
bindShadeLimitSliders();
initApp();
render();
requestAnimationFrame(scheduleRender);
initLayoutObservers();
initWindowModel3d();
initSplashScreen();

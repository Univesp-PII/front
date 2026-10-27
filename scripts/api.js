const apiConfig = {
  baseUrl: 'https://back-receba-2.onrender.com',
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

const root = typeof window !== 'undefined' ? window : globalThis;
let activeApiRequests = 0;
let loadingStartedAt = 0;
let loadingHideTimeout = null;

function showApiLoading() {
  activeApiRequests += 1;
  clearTimeout(loadingHideTimeout);

  if (activeApiRequests !== 1 || typeof document === 'undefined') return;

  let overlay = document.getElementById('apiLoadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'apiLoadingOverlay';
    overlay.className = 'api-loading-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-atomic', 'true');
    overlay.innerHTML = '<span class="api-loading-spinner" aria-hidden="true"></span><span>Carregando...</span>';
    document.body.appendChild(overlay);
  }

  loadingStartedAt = Date.now();
  overlay.hidden = false;
  document.body.setAttribute('aria-busy', 'true');
}

function hideApiLoading() {
  activeApiRequests = Math.max(0, activeApiRequests - 1);
  if (activeApiRequests !== 0 || typeof document === 'undefined') return;

  const remainingTime = Math.max(0, 250 - (Date.now() - loadingStartedAt));
  loadingHideTimeout = setTimeout(() => {
    if (activeApiRequests !== 0) return;

    const overlay = document.getElementById('apiLoadingOverlay');
    if (overlay) overlay.hidden = true;
    document.body.removeAttribute('aria-busy');
  }, remainingTime);
}

function normalizeEndpoint(endpoint) {
  return String(endpoint || '').replace(/^\/+|\/+$/g, '');
}

function clearAuthAndRedirect() {
  root.sessionStorage?.removeItem('recebaToken');
  root.sessionStorage?.removeItem('recebaUser');

  if (root.location) {
    const loginPath = root.location.pathname.includes('/pages/') ? '../index.html' : './index.html';
    root.location.href = loginPath;
  }
}

const apiService = {
  config: apiConfig,

  setBaseUrl(url) {
    if (!url || !url.trim()) {
      throw new Error('A URL da API precisa ser informada.');
    }
    apiConfig.baseUrl = url.replace(/\/+$/, '');
    return apiConfig;
  },

  async request(endpoint, options = {}) {
    const resource = normalizeEndpoint(endpoint);
    const method = (options.method || 'GET').toUpperCase();
    const id = options.id ?? null;
    const body = options.body ?? null;
    const headers = { ...(apiConfig.defaultHeaders || {}), ...(options.headers || {}) };
    const isLoginRequest = resource === 'api/auth/login';
    const token = root.sessionStorage?.getItem('recebaToken');

    if (token && !isLoginRequest) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = new URL(`${apiConfig.baseUrl.replace(/\/+$/, '')}/${resource}${id !== null && id !== undefined ? `/${id}` : ''}`);

    const requestOptions = {
      method,
      headers
    };

    if (body !== null && body !== undefined && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    showApiLoading();
    try {
      const response = await fetch(url, requestOptions);

      if (response.status === 401 && !isLoginRequest) {
        clearAuthAndRedirect();
      }

      if (!response.ok) {
        let message = `Falha ao acessar ${resource}: ${response.status}`;
        try {
          const errorData = await response.json();
          message = errorData?.message || errorData?.error || message;
        } catch {}
        throw new Error(message);
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } finally {
      hideApiLoading();
    }
  },

  async get(endpoint, id = null) {
    return this.request(endpoint, { method: 'GET', id });
  },

  async post(endpoint, payload) {
    return this.request(endpoint, { method: 'POST', body: payload });
  },

  async put(endpoint, id, payload) {
    return this.request(endpoint, { method: 'PUT', id, body: payload });
  },

  async del(endpoint, id) {
    return this.request(endpoint, { method: 'DELETE', id });
  }
};

async function getDataApi(endpoint, id = null) {
  const result = await apiService.get(endpoint, id);

  if (result && result.data !== undefined) {
    return result;
  }

  return { data: result, message: 'Dados carregados com sucesso.' };
}

async function sendDataApi(endpoint, payload, id = null) {
  const result = id === null || id === undefined
    ? await apiService.post(endpoint, payload)
    : await apiService.put(endpoint, id, payload);

  if (result && result.data !== undefined) {
    return result;
  }

  return { data: result, message: 'Operação concluída com sucesso.' };
}

async function deleteDataApi(endpoint, id) {
  const result = await apiService.del(endpoint, id);
  if (result && result.data !== undefined) {
    return result;
  }
  return { data: result, message: 'Registro removido com sucesso.' };
}

root.apiConfig = apiConfig;
root.apiService = apiService;
root.getDataApi = getDataApi;
root.sendDataApi = sendDataApi;
root.deleteDataApi = deleteDataApi;

const apiConfig = {
  baseUrl: 'http://localhost:8000',
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

const root = typeof window !== 'undefined' ? window : globalThis;

function normalizeEndpoint(endpoint) {
  return String(endpoint || '').replace(/^\/+|\/+$/g, '');
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

    const url = new URL(`${apiConfig.baseUrl.replace(/\/+$/, '')}/${resource}${id !== null && id !== undefined ? `/${id}` : ''}`);

    const requestOptions = {
      method,
      headers
    };

    if (body !== null && body !== undefined && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

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

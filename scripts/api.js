const apiConfig = {
  baseUrl: '',
  useMock: true,
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
};

const root = typeof window !== 'undefined' ? window : globalThis;

const defaultMockData = {
  porteiro: [
    { id: 1, nome: 'Carlos Silva', matricula: 'P-101', turno: 'Manhã' },
    { id: 2, nome: 'Mariana Lopes', matricula: 'P-202', turno: 'Tarde' }
  ],
  morador: [
    { id: 1, nome: 'Ana Souza', bloco: 'A', apartamento: '101', telefone: '(11) 99999-1111' },
    { id: 5, nome: 'Ana Dias', bloco: 'C', apartamento: '102', telefone: '(11) 99999-1111' },
    { id: 2, nome: 'Bruno Costa', bloco: 'B', apartamento: '205', telefone: '(11) 99999-2222' },
    { id: 3, nome: 'Carla Mendes', bloco: 'C', apartamento: '310', telefone: '(11) 99999-3333' },
    { id: 4, nome: 'Carla Machado', bloco: 'C', apartamento: '300', telefone: '(11) 99999-4444' },
  ],
  encomenda: [
    { id: 1001, codigo: '103', empresa: 'Amazon', entregador: 'João da Silva', nomeMorador: 'Ana Souza', blocoMorador: 'A', apartamento: '101', status: 'pendente', dataRegistro: '2026-09-20T08:30:00' },
    { id: 1002, codigo: '103', empresa: 'Magazine Luiza', entregador: 'Pedro Rocha', nomeMorador: 'Bruno Costa', blocoMorador: 'B', apartamento: '205', status: 'retirada', dataRegistro: '2026-09-21T09:15:00', dataRetirada: '2026-09-21T18:05:00' },
    { id: 1003, codigo: '103', empresa: 'Mercado Livre', entregador: 'Maria Alves', nomeMorador: 'Carla Mendes', blocoMorador: 'C', apartamento: '310', status: 'pendente', dataRegistro: '2026-09-22T10:00:00' },
    { id: 1004, codigo: '103', empresa: 'Shopee', entregador: 'Rafael Nunes', nomeMorador: 'Ana Souza', blocoMorador: 'A', apartamento: '101', status: 'retirada', dataRegistro: '2026-09-23T07:40:00', dataRetirada: '2026-09-23T16:45:00' },
    { id: 1005, codigo: '103', empresa: 'AliExpress', entregador: 'Lucas Pereira', nomeMorador: 'Bruno Costa', blocoMorador: 'B', apartamento: '205', status: 'pendente', dataRegistro: '2026-09-24T12:20:00' }
  ],
  historico: [
    { id: 1002, cod: '103', empresa: 'Magazine Luiza', entregador: 'Pedro Rocha', morador_nome: 'Bruno Costa', porteiro_nome: 'Carlos Silva', retirada_porteiro_nome: 'Carlos Silva', porteiro_retirada: 'Carlos Silva', status: 'retirada', data_registro: '2026-09-21T09:15:00', data_retirada: '2026-09-21T18:05:00' },
    { id: 1004, cod: '103', empresa: 'Shopee', entregador: 'Rafael Nunes', morador_nome: 'Ana Souza', porteiro_nome: 'Mariana Lopes', retirada_porteiro_nome: 'Mariana Lopes', porteiro_retirada: 'Mariana Lopes', status: 'retirada', data_registro: '2026-09-23T07:40:00', data_retirada: '2026-09-23T16:45:00' }
  ]
};

const mockDb = root.memoryStore || JSON.parse(JSON.stringify(defaultMockData));

root.memoryStore = mockDb;
apiConfig.mockData = mockDb;

function normalizeEndpoint(endpoint) {
  return String(endpoint || '').replace(/^\/+|\/+$/g, '');
}

function getNextId(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return 1;
  }

  return Math.max(...list.map((item) => Number(item.id || 0))) + 1;
}

function mockRequest(endpoint, { method = 'GET', id = null, body = null } = {}) {
  const resource = normalizeEndpoint(endpoint);
  const store = root.memoryStore || apiConfig.mockData || mockDb;

  if (!store[resource]) {
    return Promise.resolve([]);
  }

  if (method === 'GET') {
    if (id === null || id === undefined) {
      return Promise.resolve(store[resource]);
    }

    const item = store[resource].find((entry) => String(entry.id) === String(id));
    return Promise.resolve(item || null);
  }

  if (method === 'POST') {
    const payload = { ...(body || {}) };

    if (payload.id === undefined) {
      payload.id = getNextId(store[resource]);
    }

    store[resource].push(payload);
    return Promise.resolve(payload);
  }

  if (method === 'PUT') {
    if (id === null || id === undefined) {
      return Promise.resolve(null);
    }

    const index = store[resource].findIndex((entry) => String(entry.id) === String(id));
    if (index === -1) {
      return Promise.resolve(null);
    }

    const updated = { ...store[resource][index], ...(body || {}) };
    store[resource][index] = updated;
    return Promise.resolve(updated);
  }

  if (method === 'DELETE') {
    if (id === null || id === undefined) {
      return Promise.resolve(false);
    }

    const beforeLength = store[resource].length;
    store[resource] = store[resource].filter((entry) => String(entry.id) !== String(id));
    return Promise.resolve(store[resource].length !== beforeLength);
  }

  return Promise.resolve(null);
}

const apiService = {
  config: apiConfig,

  setBaseUrl(url) {
    apiConfig.baseUrl = url || '';
    apiConfig.useMock = !url || url.trim() === '';
    return apiConfig;
  },

  useMock(value = true) {
    apiConfig.useMock = Boolean(value);
    return apiConfig.useMock;
  },

  async request(endpoint, options = {}) {
    const resource = normalizeEndpoint(endpoint);
    const method = (options.method || 'GET').toUpperCase();
    const id = options.id ?? null;
    const body = options.body ?? null;
    const headers = { ...(apiConfig.defaultHeaders || {}), ...(options.headers || {}) };

    if (apiConfig.useMock || !apiConfig.baseUrl) {
      return mockRequest(resource, { method, id, body });
    }

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
      throw new Error(`Falha ao acessar ${resource}: ${response.status}`);
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

root.apiConfig = apiConfig;
root.apiService = apiService;
root.getDataApi = getDataApi;
root.sendDataApi = sendDataApi;

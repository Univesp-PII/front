const mockData = {
  porteiro: [
    {
      id: 1,
      nome: 'Carlos Silva',
      matricula: 'P-101',
      turno: 'Manhã'
    },
    {
      id: 2,
      nome: 'Mariana Lopes',
      matricula: 'P-202',
      turno: 'Tarde'
    }
  ],
  morador: [
    {
      id: 1,
      nome: 'Ana Souza',
      bloco: 'A',
      apartamento: '101',
      telefone: '(11) 99999-1111'
    },
    {
      id: 2,
      nome: 'Bruno Costa',
      bloco: 'B',
      apartamento: '205',
      telefone: '(11) 99999-2222'
    },
    {
      id: 3,
      nome: 'Carla Mendes',
      bloco: 'C',
      apartamento: '310',
      telefone: '(11) 99999-3333'
    }
  ],
  encomenda: [
    {
      id: 1001,
      codigo: 'RC-1001',
      empresa: 'Amazon',
      entregador: 'João da Silva',
      nomeMorador: 'Ana Souza',
      blocoMorador: 'A',
      apartamento: '101',
      status: 'pendente',
      dataRegistro: '2026-09-20T08:30:00'
    },
    {
      id: 1002,
      codigo: 'RC-1002',
      empresa: 'Magazine Luiza',
      entregador: 'Pedro Rocha',
      nomeMorador: 'Bruno Costa',
      blocoMorador: 'B',
      apartamento: '205',
      status: 'retirada',
      dataRegistro: '2026-09-21T09:15:00',
      dataRetirada: '2026-09-21T18:05:00'
    },
    {
      id: 1003,
      codigo: 'RC-1003',
      empresa: 'Mercado Livre',
      entregador: 'Maria Alves',
      nomeMorador: 'Carla Mendes',
      blocoMorador: 'C',
      apartamento: '310',
      status: 'pendente',
      dataRegistro: '2026-09-22T10:00:00'
    },
    {
      id: 1004,
      codigo: 'RC-1004',
      empresa: 'Shopee',
      entregador: 'Rafael Nunes',
      nomeMorador: 'Ana Souza',
      blocoMorador: 'A',
      apartamento: '101',
      status: 'retirada',
      dataRegistro: '2026-09-23T07:40:00',
      dataRetirada: '2026-09-23T16:45:00'
    },
    {
      id: 1005,
      codigo: 'RC-1005',
      empresa: 'AliExpress',
      entregador: 'Lucas Pereira',
      nomeMorador: 'Bruno Costa',
      blocoMorador: 'B',
      apartamento: '205',
      status: 'pendente',
      dataRegistro: '2026-09-24T12:20:00'
    }
  ],
  historico: [
    {
      uuid: '1002',
      cod: 'RC-1002',
      empresa: 'Magazine Luiza',
      entregador: 'Pedro Rocha',
      morador_nome: 'Bruno Costa',
      porteiro_nome: 'Carlos Silva',
      retirada_porteiro_nome: 'Carlos Silva',
      porteiro_retirada: 'Carlos Silva',
      status: 'retirada',
      data_registro: '2026-09-21T09:15:00',
      data_retirada: '2026-09-21T18:05:00'
    },
    {
      uuid: '1004',
      cod: 'RC-1004',
      empresa: 'Shopee',
      entregador: 'Rafael Nunes',
      morador_nome: 'Ana Souza',
      porteiro_nome: 'Mariana Lopes',
      retirada_porteiro_nome: 'Mariana Lopes',
      porteiro_retirada: 'Mariana Lopes',
      status: 'retirada',
      data_registro: '2026-09-23T07:40:00',
      data_retirada: '2026-09-23T16:45:00'
    }
  ]
};

window.memoryStore = mockData;
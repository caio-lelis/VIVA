from __future__ import annotations

from datetime import date

MODULES = [
    {
        "href": "/upload",
        "title": "Documentos",
        "description": "Envie e gerencie atas, contratos, boletos e demais arquivos do condomínio.",
        "badge": None,
        "available": True,
    },
    {
        "href": "/avisos",
        "title": "Avisos e Comunicados",
        "description": "Acesse os comunicados e notificações enviados pela administração.",
        "badge": "3 novos",
        "available": True,
    },
    {
        "href": "/reservas",
        "title": "Reservas de Espaços",
        "description": "Reserve salões, quadras e áreas de lazer com facilidade.",
        "badge": None,
        "available": True,
    },
    {
        "href": "/chamados",
        "title": "Chamados de Manutenção",
        "description": "Abra e acompanhe ordens de serviço para manutenções no condomínio.",
        "badge": "1 aberto",
        "available": True,
    },
    {
        "href": "/financeiro",
        "title": "Financeiro",
        "description": "Consulte boletos, extratos e a posição financeira da sua unidade.",
        "badge": None,
        "available": True,
    },
    {
        "href": "/moradores",
        "title": "Moradores",
        "description": "Diretório de moradores, visitantes autorizados e veículos cadastrados.",
        "badge": None,
        "available": True,
    },
    {
        "href": "/enquetes",
        "title": "Enquetes e Votações",
        "description": "Participe de enquetes e votações sobre decisões do condomínio.",
        "badge": "1 ativa",
        "available": True,
    },
    {
        "href": "/relatorios",
        "title": "Relatórios",
        "description": "Visualize relatórios de consumo, manutenções e outras métricas.",
        "badge": None,
        "available": True,
    },
    {
        "href": "/infraestrutura",
        "title": "Infraestrutura da Home",
        "description": "Gerencie imagens e descrições da página pública de infraestrutura.",
        "badge": "admin",
        "available": True,
    },
]

RECENT_ACTIVITY = [
    {"title": "Ata da Assembleia enviada", "time": "Há 2 horas", "type": "success"},
    {"title": "Manutenção da bomba d'água agendada", "time": "Há 1 dia", "type": "warning"},
    {"title": "Novo comunicado: Pintura do corredor", "time": "Há 2 dias", "type": "info"},
    {"title": "Reserva do salão confirmada — Ap. 204", "time": "Há 3 dias", "type": "neutral"},
]

AVISOS = [
    {
        "id": "1",
        "title": "Manutenção no elevador - Bloco A",
        "content": "O elevador do Bloco A ficará em manutenção no dia 15/04. Use as escadas ou o elevador do Bloco B.",
        "type": "urgente",
        "date": "2026-04-07",
        "pinned": True,
        "read": False,
    },
    {
        "id": "2",
        "title": "Assembleia Ordinária - Abril 2026",
        "content": "Convocamos todos os condôminos para a Assembleia Ordinária no dia 20/04 às 19h no salão de festas.",
        "type": "importante",
        "date": "2026-04-05",
        "pinned": True,
        "read": False,
    },
    {
        "id": "3",
        "title": "Novo horário da piscina",
        "content": "A partir de maio, a piscina funcionará das 8h às 22h. Confira o novo regulamento na portaria.",
        "type": "informativo",
        "date": "2026-04-03",
        "pinned": False,
        "read": True,
    },
]

CHAMADOS = [
    {
        "id": "c1",
        "title": "Vazamento no banheiro",
        "description": "Existe um vazamento embaixo da pia do banheiro social.",
        "category": "hidraulica",
        "status": "em_andamento",
        "location": "Apartamento 204 - Banheiro social",
        "createdAt": "2026-04-05",
        "updatedAt": "2026-04-06",
        "unit": "Ap. 204",
    },
    {
        "id": "c2",
        "title": "Lampada queimada no corredor",
        "description": "A lampada do corredor do 2o andar esta queimada ha 3 dias.",
        "category": "eletrica",
        "status": "aberto",
        "location": "Corredor 2o andar",
        "createdAt": "2026-04-07",
        "updatedAt": "2026-04-07",
        "unit": "Ap. 204",
    },
]

ENQUETES = [
    {
        "id": "e1",
        "title": "Horario de funcionamento da piscina",
        "description": "Vote no novo horario de funcionamento da piscina durante o verao.",
        "status": "ativa",
        "startDate": "2026-04-01",
        "endDate": "2026-04-15",
        "options": [
            {"id": "o1", "text": "6h as 22h", "votes": 23},
            {"id": "o2", "text": "7h as 21h", "votes": 15},
            {"id": "o3", "text": "8h as 20h", "votes": 8},
        ],
        "totalVotes": 46,
        "userVoted": False,
        "userVote": None,
    },
    {
        "id": "e2",
        "title": "Instalacao de cameras no estacionamento",
        "description": "Voce aprova a instalacao de cameras de seguranca adicionais no estacionamento?",
        "status": "ativa",
        "startDate": "2026-04-05",
        "endDate": "2026-04-20",
        "options": [
            {"id": "o1", "text": "Sim, aprovo", "votes": 32},
            {"id": "o2", "text": "Nao, discordo", "votes": 5},
            {"id": "o3", "text": "Preciso de mais informacoes", "votes": 10},
        ],
        "totalVotes": 47,
        "userVoted": True,
        "userVote": "o1",
    },
]

BOLETOS = [
    {
        "id": "b1",
        "reference": "04/2026",
        "description": "Taxa de Condominio - Abril 2026",
        "amount": 850.0,
        "dueDate": "2026-04-10",
        "status": "pendente",
        "paidAt": None,
    },
    {
        "id": "b2",
        "reference": "03/2026",
        "description": "Taxa de Condominio - Marco 2026",
        "amount": 850.0,
        "dueDate": "2026-03-10",
        "status": "pago",
        "paidAt": "2026-03-08",
    },
]

EXTRATO = [
    {
        "id": "e1",
        "date": "2026-03-08",
        "description": "Pagamento taxa condominio 03/2026",
        "amount": 850.0,
        "type": "saida",
    },
    {
        "id": "e2",
        "date": "2026-02-10",
        "description": "Pagamento taxa condominio 02/2026",
        "amount": 850.0,
        "type": "saida",
    },
]

MORADORES = [
    {
        "id": "m1",
        "name": "Carlos Silva",
        "unit": "204",
        "block": "A",
        "phone": "(11) 99999-1234",
        "email": "carlos@email.com",
        "type": "proprietario",
        "vehicles": [{"plate": "ABC-1234", "model": "Honda Civic Preto"}],
    },
    {
        "id": "m2",
        "name": "Maria Santos",
        "unit": "101",
        "block": "A",
        "phone": "(11) 99999-5678",
        "email": "maria@email.com",
        "type": "inquilino",
        "vehicles": [],
    },
]

ESPACOS = [
    {
        "id": "salao",
        "name": "Salao de Festas",
        "description": "Espaco amplo com cozinha e ar condicionado.",
        "capacity": 80,
        "rules": ["Reservar com 7 dias de antecedencia", "Horario maximo: 23h", "Taxa: R$ 200"],
    },
    {
        "id": "churrasqueira",
        "name": "Churrasqueira",
        "description": "Area coberta com churrasqueira, mesas e banheiro.",
        "capacity": 30,
        "rules": ["Reservar com 3 dias de antecedencia", "Horario maximo: 22h", "Gratuito"],
    },
]

RESERVAS = [
    {
        "id": "r1",
        "espacoId": "salao",
        "date": "2026-04-12",
        "startTime": "18:00",
        "endTime": "23:00",
        "status": "confirmada",
        "unit": "Ap. 204",
    },
    {
        "id": "r2",
        "espacoId": "churrasqueira",
        "date": "2026-04-10",
        "startTime": "12:00",
        "endTime": "17:00",
        "status": "pendente",
        "unit": "Ap. 101",
    },
]

RELATORIOS = [
    {
        "id": "r1",
        "title": "Consumo de Agua - Marco 2026",
        "description": "Relatorio detalhado do consumo de agua por unidade.",
        "category": "consumo",
        "period": "Marco 2026",
        "generatedAt": "2026-04-01",
    },
    {
        "id": "r2",
        "title": "Balanco Financeiro - 1o Trimestre 2026",
        "description": "Balanco financeiro completo do primeiro trimestre.",
        "category": "financeiro",
        "period": "Jan-Mar 2026",
        "generatedAt": "2026-04-05",
    },
]

CONSUMO_DATA = [
    {"month": "Out", "agua": 450, "energia": 1200},
    {"month": "Nov", "agua": 420, "energia": 1350},
    {"month": "Dez", "agua": 480, "energia": 1500},
    {"month": "Jan", "agua": 520, "energia": 1400},
    {"month": "Fev", "agua": 490, "energia": 1300},
    {"month": "Mar", "agua": 460, "energia": 1250},
]


def next_id(prefix: str, existing_ids: list[str]) -> str:
    used_numbers = set()
    for eid in existing_ids:
        if eid.startswith(prefix):
            suffix = eid.removeprefix(prefix)
            if suffix.isdigit():
                used_numbers.add(int(suffix))

    candidate = 1
    while candidate in used_numbers:
        candidate += 1
    return f"{prefix}{candidate}"


def today_iso() -> str:
    return date.today().isoformat()

const today = new Date().toISOString().split("T")[0];

let deliveries = [
  { id: 1, date: today, status: "pending", recipient: "João Silva", recipient_name: "João Silva", address: "Rua Paranaíba, 1230", latitude: -20.7849, longitude: -51.7011, order_in_route: 1, estimated_time: "08:30" },
  { id: 2, date: today, status: "delivered", recipient: "Maria Paula", recipient_name: "Maria Paula", address: "Av. Antônio Trajano, 450", latitude: -20.7800, longitude: -51.7100, order_in_route: 2, delivered_at: new Date().toISOString(), estimated_time: "09:15" },
  { id: 3, date: today, status: "in_transit", recipient: "Carlos Mendes", recipient_name: "Carlos Mendes", address: "Rua Olinto Mancini, 78", latitude: -20.7870, longitude: -51.6950, order_in_route: 3, estimated_time: "10:00" },
  { id: 4, date: today, status: "pending", recipient: "Ana Beatriz", recipient_name: "Ana Beatriz", address: "Rua Elmano Soares, 320", latitude: -20.7920, longitude: -51.7080, order_in_route: 4, estimated_time: "10:45" },
  { id: 5, date: today, status: "delivered", recipient: "Fernando Gomes", recipient_name: "Fernando Gomes", address: "Av. Capitão Olinto Mancini, 1500", latitude: -20.7780, longitude: -51.7040, order_in_route: 5, delivered_at: new Date().toISOString(), estimated_time: "11:30" }
];

let alerts = [
  { id: 1, title: "Acidente na BR-262", description: "Colisão entre veículos, pista parcialmente interditada sentido Campo Grande.", type: "accident", severity: "high", active: true, latitude: -20.7900, longitude: -51.7050 },
  { id: 2, title: "Obras na Av. Ranulpho M. Leal", description: "Recapeamento asfáltico com desvio pela Rua Paranaíba.", type: "construction", severity: "medium", active: true, latitude: -20.7820, longitude: -51.7000 },
  { id: 3, title: "Alagamento na Lagoa Maior", description: "Nível da água subiu após chuva forte. Trecho alagado.", type: "flood", severity: "high", active: true, latitude: -20.7750, longitude: -51.6980 },
  { id: 4, title: "Trânsito intenso no Centro", description: "Congestionamento na hora de pico. Tempo estimado de espera: 15min.", type: "traffic", severity: "low", active: true, latitude: -20.7855, longitude: -51.7015 }
];

let busStops = [
  { id: 1, name: "Terminal Central", address: "Praça Ramez Tebet, Centro", latitude: -20.7850, longitude: -51.7010, has_shelter: true, accessibility: true, lines: ["01", "04", "12"] },
  { id: 2, name: "Rodoviária", address: "Av. Clodoaldo Garcia, 580", latitude: -20.7950, longitude: -51.7150, has_shelter: true, accessibility: true, lines: ["01", "12"] },
  { id: 3, name: "Lagoa Maior", address: "Av. Rosário Congro", latitude: -20.7760, longitude: -51.6960, has_shelter: true, accessibility: false, lines: ["04"] },
  { id: 4, name: "UPA 24h", address: "Rua Olinto Mancini, 900", latitude: -20.7880, longitude: -51.7060, has_shelter: false, accessibility: true, lines: ["01", "04"] },
  { id: 5, name: "Shopping Três Lagoas", address: "Av. Ranulpho M. Leal, 2200", latitude: -20.7810, longitude: -51.7120, has_shelter: true, accessibility: true, lines: ["04", "12"] }
];

let schedules = [
  { id: 1, line_number: "01", line_name: "Vila Nova – Centro – Rodoviária", active: true, fare: 4.50, estimated_duration: "35 min", departure_times: ["05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00"] },
  { id: 2, line_number: "04", line_name: "Interbairros (Circular)", active: true, fare: 4.50, estimated_duration: "50 min", departure_times: ["06:00", "06:45", "07:30", "08:15", "09:00", "09:45", "10:30"] },
  { id: 3, line_number: "12", line_name: "Jd. Alvorada – Centro – Shopping", active: true, fare: 4.50, estimated_duration: "40 min", departure_times: ["06:15", "07:00", "07:45", "08:30", "09:15", "10:00"] }
];

let companies = [
  { id: 1, name: "Viação Três Lagoas", active: true },
  { id: 2, name: "TransLog Express", active: true },
  { id: 3, name: "Rápido Paranaíba", active: false }
];

let feedbacks = [
  { id: 1, rating: 5, comment: "Rota excelente hoje!" },
  { id: 2, rating: 4, comment: "Boa rota, mas teve um desvio inesperado." },
  { id: 3, rating: 5, comment: "Consegui entregar tudo antes do almoço." }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const base44 = {
  auth: {
    me: async () => ({ id: 1, full_name: "Motorista Local", email: "motorista@rotatech.com", role: "admin", created_date: "2023-01-01T00:00:00Z" }),
    logout: async () => { alert("Simulação: Logout realizado com sucesso."); }
  },
  entities: {
    Delivery: {
      list: async () => { await delay(500); return [...deliveries]; },
      update: async (id, data) => { 
        await delay(300);
        const idx = deliveries.findIndex(d => d.id === id);
        if (idx !== -1) deliveries[idx] = { ...deliveries[idx], ...data };
        return deliveries[idx];
      }
    },
    RouteAlert: {
      list: async () => { await delay(500); return [...alerts]; },
      filter: async () => { await delay(500); return alerts.filter(a => a.active); },
      create: async (data) => { 
        await delay(300);
        const newAlert = { id: Date.now(), ...data, active: true };
        alerts.push(newAlert);
        return newAlert;
      },
      update: async (id, data) => {
        await delay(300);
        const idx = alerts.findIndex(a => a.id === id);
        if (idx !== -1) alerts[idx] = { ...alerts[idx], ...data };
        return alerts[idx];
      },
      delete: async (id) => {
        await delay(300);
        alerts = alerts.filter(a => a.id !== id);
        return true;
      }
    },
    BusStop: {
      list: async () => { await delay(500); return [...busStops]; },
      create: async (data) => { await delay(300); const n = {id: Date.now(), ...data}; busStops.push(n); return n; },
      update: async (id, data) => { await delay(300); return data; },
      delete: async (id) => { await delay(300); busStops = busStops.filter(x => x.id !== id); return true; }
    },
    BusSchedule: {
      list: async () => { await delay(500); return [...schedules]; },
      filter: async () => { await delay(500); return [...schedules]; },
      create: async (data) => { await delay(300); const n = {id: Date.now(), ...data}; schedules.push(n); return n; },
      update: async (id, data) => { await delay(300); return data; },
      delete: async (id) => { await delay(300); schedules = schedules.filter(x => x.id !== id); return true; }
    },
    Company: {
      list: async () => { await delay(500); return [...companies]; },
      create: async (data) => { await delay(300); const n = {id: Date.now(), ...data}; companies.push(n); return n; },
      update: async (id, data) => { await delay(300); return data; },
      delete: async (id) => { await delay(300); companies = companies.filter(x => x.id !== id); return true; }
    },
    RouteFeedback: {
      list: async () => { await delay(500); return [...feedbacks]; },
      create: async (data) => { await delay(300); const n = {id: Date.now(), ...data}; feedbacks.push(n); return n; }
    }
  }
};

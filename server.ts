import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper function to get Hostinger MySQL connection config from process.env or provided credentials
function getHostingerConfig(customConfig?: any) {
  const host = customConfig?.host || process.env.HOSTINGER_DB_HOST || 'localhost';
  const port = parseInt(customConfig?.port || process.env.HOSTINGER_DB_PORT || '3306', 10);
  const user = customConfig?.user || process.env.HOSTINGER_DB_USER || '';
  const password = customConfig?.password || process.env.HOSTINGER_DB_PASSWORD || '';
  const database = customConfig?.database || process.env.HOSTINGER_DB_NAME || '';
  const ssl = customConfig?.ssl !== undefined ? customConfig.ssl : (process.env.HOSTINGER_DB_SSL === 'true');

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 8000,
  };
}

// Global active MySQL pool
let dbPool: mysql.Pool | null = null;

function getDbPool(customConfig?: any): mysql.Pool | null {
  const cfg = getHostingerConfig(customConfig);
  if (!cfg.host || !cfg.user || !cfg.database) {
    return null;
  }
  if (!dbPool || customConfig) {
    dbPool = mysql.createPool({
      ...cfg,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return dbPool;
}

// Table Creation Queries for Hostinger MySQL
const INIT_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS cf_incomes (
    id VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date VARCHAR(20) NOT NULL,
    isRecurring TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS cf_fixed_expenses (
    id VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dueDay INT NOT NULL,
    active TINYINT(1) DEFAULT 1,
    paidMonths TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS cf_variable_expenses (
    id VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date VARCHAR(20) NOT NULL,
    paid TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS cf_credit_expenses (
    id VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    totalAmount DECIMAL(12,2) NOT NULL,
    installments INT NOT NULL,
    dueDay INT NOT NULL,
    purchaseDate VARCHAR(20) NOT NULL,
    startMonth VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cardName VARCHAR(100) DEFAULT 'Cartão Principal',
    paidInstallments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];

// Ensure tables exist on pool connection
async function ensureTablesExist(pool: mysql.Pool) {
  for (const sql of INIT_TABLES_SQL) {
    await pool.query(sql);
  }
}

// API Routes

// 1. Health check & DB status
app.get('/api/db/status', async (req, res) => {
  const cfg = getHostingerConfig();
  const configured = Boolean(cfg.host && cfg.user && cfg.database);

  if (!configured) {
    return res.json({
      configured: false,
      connected: false,
      message: 'Credenciais da Hostinger não configuradas.',
      config: {
        host: cfg.host || 'Não informado',
        port: cfg.port,
        user: cfg.user || 'Não informado',
        database: cfg.database || 'Não informado',
        hasPassword: Boolean(cfg.password),
      }
    });
  }

  const startTime = Date.now();
  try {
    const pool = getDbPool();
    if (!pool) {
      throw new Error('Não foi possível inicializar o pool MySQL.');
    }

    const [rows] = await pool.query('SELECT 1 as ping, NOW() as serverTime');
    await ensureTablesExist(pool);
    const latency = Date.now() - startTime;

    return res.json({
      configured: true,
      connected: true,
      latencyMs: latency,
      message: 'Conectado com sucesso ao Banco de Dados Hostinger!',
      serverTime: (rows as any)?.[0]?.serverTime,
      config: {
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        database: cfg.database,
        hasPassword: Boolean(cfg.password),
      }
    });
  } catch (err: any) {
    console.error('Hostinger DB connection error:', err);
    let errorMessage = err?.message || 'Erro desconhecido ao conectar ao MySQL da Hostinger.';

    if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Acesso negado: Usuário ou senha incorretos para o banco Hostinger.';
    } else if (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED') {
      errorMessage = `Não foi possível alcançar o servidor ${cfg.host}:${cfg.port}. Certifique-se de que ativou "MySQL Remoto" no hPanel da Hostinger e permitiu acesso ao IP %.`;
    } else if (err?.code === 'ER_BAD_DB_ERROR') {
      errorMessage = `O banco de dados "${cfg.database}" não foi encontrado na Hostinger.`;
    }

    return res.status(200).json({
      configured: true,
      connected: false,
      error: errorMessage,
      errorCode: err?.code,
      config: {
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        database: cfg.database,
        hasPassword: Boolean(cfg.password),
      }
    });
  }
});

// 2. Test Custom Credentials
app.post('/api/db/test-connection', async (req, res) => {
  const { host, port, user, password, database, ssl } = req.body || {};

  if (!host || !user || !database) {
    return res.status(400).json({
      success: false,
      message: 'Preencha Servidor (Host), Usuário e Nome do Banco de Dados.'
    });
  }

  const cfg = {
    host,
    port: parseInt(port || '3306', 10),
    user,
    password: password || '',
    database,
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 8000,
  };

  let tempConnection: mysql.Connection | null = null;
  const startTime = Date.now();

  try {
    tempConnection = await mysql.createConnection(cfg);
    await tempConnection.ping();
    const latency = Date.now() - startTime;

    // Try creating tables
    for (const sql of INIT_TABLES_SQL) {
      await tempConnection.query(sql);
    }

    await tempConnection.end();

    return res.json({
      success: true,
      latencyMs: latency,
      message: 'Conexão e tabelas validadas com sucesso no MySQL da Hostinger!'
    });
  } catch (err: any) {
    if (tempConnection) {
      try { await tempConnection.end(); } catch (_) {}
    }
    let errorDetails = err?.message || 'Falha ao conectar';
    if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
      errorDetails = 'Acesso negado: Usuário ou senha incorretos.';
    } else if (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED') {
      errorDetails = `Timeout ao conectar a ${host}:${port}. Verifique se ativou o "MySQL Remoto" (%) no painel da Hostinger.`;
    }

    return res.json({
      success: false,
      message: errorDetails,
      code: err?.code
    });
  }
});

// 3. Sync GET - Load all data from Hostinger MySQL
app.get('/api/db/sync', async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(400).json({
      success: false,
      message: 'Banco de dados Hostinger não configurado.'
    });
  }

  try {
    await ensureTablesExist(pool);

    const [incomesRows] = await pool.query('SELECT * FROM cf_incomes');
    const [fixedRows] = await pool.query('SELECT * FROM cf_fixed_expenses');
    const [variableRows] = await pool.query('SELECT * FROM cf_variable_expenses');
    const [creditRows] = await pool.query('SELECT * FROM cf_credit_expenses');

    const incomes = (incomesRows as any[]).map(row => ({
      id: row.id,
      description: row.description,
      amount: Number(row.amount),
      category: row.category,
      date: row.date,
      isRecurring: Boolean(row.isRecurring)
    }));

    const fixedExpenses = (fixedRows as any[]).map(row => ({
      id: row.id,
      description: row.description,
      amount: Number(row.amount),
      category: row.category,
      dueDay: Number(row.dueDay),
      active: Boolean(row.active),
      paidMonths: row.paidMonths ? JSON.parse(row.paidMonths) : []
    }));

    const variableExpenses = (variableRows as any[]).map(row => ({
      id: row.id,
      description: row.description,
      amount: Number(row.amount),
      category: row.category,
      date: row.date,
      paid: Boolean(row.paid)
    }));

    const creditExpenses = (creditRows as any[]).map(row => ({
      id: row.id,
      description: row.description,
      totalAmount: Number(row.totalAmount),
      installments: Number(row.installments),
      dueDay: Number(row.dueDay),
      purchaseDate: row.purchaseDate,
      startMonth: row.startMonth,
      category: row.category,
      cardName: row.cardName || 'Cartão Principal',
      paidInstallments: row.paidInstallments ? JSON.parse(row.paidInstallments) : []
    }));

    return res.json({
      success: true,
      data: {
        incomes,
        fixedExpenses,
        variableExpenses,
        creditExpenses
      }
    });
  } catch (err: any) {
    console.error('Error reading from Hostinger DB:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do MySQL Hostinger: ' + (err?.message || err)
    });
  }
});

// 4. Sync POST - Save all data to Hostinger MySQL
app.post('/api/db/sync', async (req, res) => {
  const pool = getDbPool();
  if (!pool) {
    return res.status(400).json({
      success: false,
      message: 'Banco de dados Hostinger não configurado.'
    });
  }

  const { incomes = [], fixedExpenses = [], variableExpenses = [], creditExpenses = [] } = req.body || {};

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM cf_incomes');
    await conn.query('DELETE FROM cf_fixed_expenses');
    await conn.query('DELETE FROM cf_variable_expenses');
    await conn.query('DELETE FROM cf_credit_expenses');

    // Insert Incomes
    for (const inc of incomes) {
      await conn.query(
        'INSERT INTO cf_incomes (id, description, amount, category, date, isRecurring) VALUES (?, ?, ?, ?, ?, ?)',
        [inc.id, inc.description, inc.amount, inc.category, inc.date, inc.isRecurring ? 1 : 0]
      );
    }

    // Insert Fixed Expenses
    for (const fix of fixedExpenses) {
      await conn.query(
        'INSERT INTO cf_fixed_expenses (id, description, amount, category, dueDay, active, paidMonths) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          fix.id,
          fix.description,
          fix.amount,
          fix.category,
          fix.dueDay,
          fix.active ? 1 : 0,
          JSON.stringify(fix.paidMonths || [])
        ]
      );
    }

    // Insert Variable Expenses
    for (const v of variableExpenses) {
      await conn.query(
        'INSERT INTO cf_variable_expenses (id, description, amount, category, date, paid) VALUES (?, ?, ?, ?, ?, ?)',
        [v.id, v.description, v.amount, v.category, v.date, v.paid ? 1 : 0]
      );
    }

    // Insert Credit Expenses
    for (const cr of creditExpenses) {
      await conn.query(
        'INSERT INTO cf_credit_expenses (id, description, totalAmount, installments, dueDay, purchaseDate, startMonth, category, cardName, paidInstallments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          cr.id,
          cr.description,
          cr.totalAmount,
          cr.installments,
          cr.dueDay,
          cr.purchaseDate,
          cr.startMonth,
          cr.category,
          cr.cardName || 'Cartão Principal',
          JSON.stringify(cr.paidInstallments || [])
        ]
      );
    }

    await conn.commit();
    conn.release();

    return res.json({
      success: true,
      message: 'Dados sincronizados com sucesso no banco da Hostinger!'
    });
  } catch (err: any) {
    await conn.rollback();
    conn.release();
    console.error('Error saving to Hostinger DB:', err);
    return res.status(500).json({
      success: false,
      message: 'Erro ao salvar dados no MySQL Hostinger: ' + (err?.message || err)
    });
  }
});

// Fallback handler for non-existent /api routes to prevent returning HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint de API não encontrado: ${req.method} ${req.path}`
  });
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

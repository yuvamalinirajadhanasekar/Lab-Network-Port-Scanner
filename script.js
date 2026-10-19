
/* =========================================================
   LAB NETWORK PORT SCANNER — MSEC
   JavaScript Front-End Demo
   Scan results are simulated; no real network scan is done.
========================================================= */

'use strict';

const $ = id => document.getElementById(id);

const labsByDepartment = {
  CSE: ['Lab 1', 'Lab 2', 'Programming Lab'],
  IT: ['Lab 1', 'Lab 2', 'Network Lab'],
  ECE: ['Lab 1', 'Communication Lab'],
  EEE: ['Lab 1', 'Electrical Lab'],
  CIVIL: ['Lab 1', 'CAD Lab'],
  MECHANICAL: ['Lab 1', 'Workshop Lab'],
  ADS: ['Lab 1', 'Data Analytics Lab']
};

const defaultServices = [
  { name: 'FTP', port: 21, protocol: 'TCP', enabled: true, available: true },
  { name: 'SSH', port: 22, protocol: 'TCP', enabled: true, available: true },
  { name: 'Telnet', port: 23, protocol: 'TCP', enabled: true, available: false },
  { name: 'DNS', port: 53, protocol: 'UDP', enabled: true, available: true },
  { name: 'HTTP', port: 80, protocol: 'TCP', enabled: true, available: true },
  { name: 'HTTPS', port: 443, protocol: 'TCP', enabled: true, available: true },
  { name: 'RDP', port: 3389, protocol: 'TCP', enabled: true, available: true }
];

let devices = [];
let services = defaultServices.map(s => ({ ...s }));
let scanHistory = [];
let selectedDeviceId = null;
let scanTimer = null;
let scanRunning = false;
let scanCancelled = false;
let nextScanNumber = 1004;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function makeDevices(department = 'IT', lab = 'Lab 1') {
  const serviceNames = ['HTTP', 'HTTPS', 'SSH', 'FTP', 'RDP'];

  return Array.from({ length: 40 }, (_, i) => {
    const online = i < 34;
    const openPorts = online
      ? (i % 4 === 0 ? [80, 443]
        : i % 3 === 0 ? [22, 80, 443]
        : [80, 443, 22])
      : [];

    return {
      id: i + 1,
      name: `PC-${String(i + 1).padStart(2, '0')}`,
      ip: `192.168.1.${101 + i}`,
      status: online ? 'online' : 'offline',
      openPorts,
      services: online
        ? (i % 2 ? ['HTTP', 'HTTPS'] : serviceNames.slice(0, 3))
        : [],
      lastSeen: online ? `${i % 5 + 1} min ago` : 'Not reachable',
      response: online ? `${8 + (i * 7) % 30} ms` : '—',
      department,
      lab,
      ports: [
        { port: 22, protocol: 'TCP', service: 'SSH',
          status: online && openPorts.includes(22) ? 'Open' : 'Closed' },
        { port: 80, protocol: 'TCP', service: 'HTTP',
          status: online && openPorts.includes(80) ? 'Open' : 'Closed' },
        { port: 443, protocol: 'TCP', service: 'HTTPS',
          status: online && openPorts.includes(443) ? 'Open' : 'Closed' },
        { port: 3389, protocol: 'TCP', service: 'RDP', status: 'Closed' }
      ]
    };
  });
}

function init() {
  devices = makeDevices();

  fillLabOptions('departmentSelect', 'labSelect');
  fillLabOptions('scanDepartment', 'scanLab');

  bindNavigation();

  $('loginForm')?.addEventListener('submit', handleLogin);

  $('departmentSelect')?.addEventListener('change', () => {
    fillLabOptions('departmentSelect', 'labSelect');
    syncDepartmentAndLab();
    updateDashboard();
  });

  $('labSelect')?.addEventListener('change', () => {
    syncDepartmentAndLab();
    updateDashboard();
  });

  $('scanDepartment')?.addEventListener('change', () => {
    fillLabOptions('scanDepartment', 'scanLab');
  });

  $('themeSelect')?.addEventListener('change', changeThemeFromSetting);

  renderAll();
}

function handleLogin(event) {
  event.preventDefault();

  const username = $('username')?.value.trim();
  const password = $('password')?.value;

  if (username === 'admin' && password === 'admin123') {
    if ($('loginError')) $('loginError').textContent = '';
    $('loginPage')?.classList.add('hidden');
    $('app')?.classList.remove('hidden');
    renderAll();
    showToast('Login successful. Welcome, Administrator.');
  } else {
    if ($('loginError')) {
      $('loginError').textContent = 'Invalid administrator ID or password.';
    }
  }
}

function togglePassword() {
  const input = $('password');
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function logout() {
  stopScan();
  $('app')?.classList.add('hidden');
  $('loginPage')?.classList.remove('hidden');
  if ($('password')) $('password').value = '';
  showToast('You have been logged out.');
}

function fillLabOptions(departmentId, labId) {
  const dept = $(departmentId);
  const lab = $(labId);
  if (!dept || !lab) return;

  const list = labsByDepartment[dept.value] || ['Lab 1'];
  const oldValue = lab.value;

  lab.innerHTML = list.map(name =>
    `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`
  ).join('');

  if (list.includes(oldValue)) lab.value = oldValue;
}

function currentDepartment() {
  return $('departmentSelect')?.value || 'IT';
}

function currentLab() {
  return $('labSelect')?.value || 'Lab 1';
}

function syncDepartmentAndLab() {
  const dept = currentDepartment();
  const lab = currentLab();

  const values = {
    headerDepartment: dept,
    headerLab: lab,
    dashboardLab: `${dept} - ${lab}`,
    deviceDepartmentTitle: dept,
    deviceLabTitle: lab,
    networkDepartment: dept,
    networkLab: lab
  };

  Object.entries(values).forEach(([id, value]) => {
    if ($(id)) $(id).textContent = value;
  });

  if ($('scanDepartment')) $('scanDepartment').value = dept;
  fillLabOptions('scanDepartment', 'scanLab');
  if ($('scanLab')) $('scanLab').value = lab;

  devices.forEach(d => {
    d.department = dept;
    d.lab = lab;
  });
}

function bindNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(button => {
    button.addEventListener('click', () => showPage(button.dataset.page));
  });
}

function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active-page');
  });

  $(`page-${pageName}`)?.classList.add('active-page');

  document.querySelectorAll('.nav-item').forEach(button => {
    button.classList.toggle('active', button.dataset.page === pageName);
  });

  $('sidebar')?.classList.remove('sidebar-open');

  if (pageName === 'devices') renderDevices();
  if (pageName === 'services') renderServices();
  if (pageName === 'history') renderHistory();
  if (pageName === 'network') renderTopology();
}

function goToScan() {
  showPage('scan');
}

function toggleSidebar() {
  $('sidebar')?.classList.toggle('sidebar-open');
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  if ($('themeSelect')) {
    $('themeSelect').value =
      document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  }
}

function changeThemeFromSetting() {
  document.body.classList.toggle(
    'dark-theme',
    $('themeSelect')?.value === 'dark'
  );
}

function renderAll() {
  syncDepartmentAndLab();
  updateDashboard();
  renderDevices();
  renderServices();
  renderHistory();
  renderTopology();
}

function updateDashboard() {
  const total = devices.length;
  const online = devices.filter(d => d.status === 'online').length;
  const offline = total - online;
  const openPorts = devices.reduce((sum, d) => sum + d.openPorts.length, 0);

  const stats = {
    totalDevices: total,
    onlineDevices: online,
    offlineDevices: offline,
    activeServices: services.filter(s => s.enabled).length * 8 + 2,
    openPorts,
    onlineLegend: online,
    offlineLegend: offline
  };

  Object.entries(stats).forEach(([id, value]) => {
    if ($(id)) $(id).textContent = value;
  });

  const percent = total ? Math.round(online / total * 100) : 0;
  const donut = $('deviceDonut');

  if (donut) {
    donut.style.background =
      `conic-gradient(var(--green) 0 ${percent}%, #e2e8f0 ${percent}% 100%)`;
    const strong = donut.querySelector('strong');
    if (strong) strong.textContent = `${percent}%`;
  }

  const chart = $('serviceChart');

  if (chart) {
    chart.innerHTML = [
      ['HTTP', 36], ['HTTPS', 31], ['SSH', 22], ['DNS', 18], ['FTP', 12]
    ].map(([name, count]) => `
      <div class="bar-row">
        <span>${name}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${count / 40 * 100}%"></div>
        </div>
        <b>${count}</b>
      </div>
    `).join('');
  }

  renderDashboardDevices();
  renderRecentScans();
}

function deviceRow(d) {
  return `<tr>
    <td>
      <div class="device-cell">
        <span class="pc-icon">▣</span>
        <div>
          <strong>${escapeHTML(d.name)}</strong>
          <small>${escapeHTML(d.department)} · ${escapeHTML(d.lab)}</small>
        </div>
      </div>
    </td>
    <td>${escapeHTML(d.ip)}</td>
    <td><span class="status ${d.status}">● ${d.status.toUpperCase()}</span></td>
    <td>
      <div class="port-pills">
        ${d.openPorts.length
          ? d.openPorts.map(p => `<span class="port-pill">${p}</span>`).join('')
          : '—'}
      </div>
    </td>
    <td><span class="service-list">${escapeHTML(d.services.join(', ') || 'None')}</span></td>
    <td>${escapeHTML(d.lastSeen)}</td>
    <td><button class="action-btn" onclick="viewDevice(${d.id})">VIEW</button></td>
  </tr>`;
}

function renderDashboardDevices() {
  const table = $('dashboardDeviceTable');
  if (table) table.innerHTML = devices.slice(0, 6).map(deviceRow).join('');
}

function renderDevices() {
  const table = $('devicesTable');
  if (!table) return;

  const query = ($('deviceSearch')?.value || '').toLowerCase();
  const status = $('statusFilter')?.value || 'all';
  const service = $('serviceFilter')?.value || 'all';
  const sort = $('sortFilter')?.value || 'ip';

  let list = devices.filter(d =>
    (d.name.toLowerCase().includes(query) || d.ip.includes(query)) &&
    (status === 'all' || d.status === status) &&
    (service === 'all' || d.services.includes(service))
  );

  list.sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'status') return a.status.localeCompare(b.status);
    if (sort === 'ports') return b.openPorts.length - a.openPorts.length;
    return Number(a.ip.split('.').pop()) - Number(b.ip.split('.').pop());
  });

  table.innerHTML = list.length
    ? list.map(deviceRow).join('')
    : '<tr><td colspan="7">No matching devices found.</td></tr>';
}

function refreshDevices() {
  renderDevices();
  showToast('Device list refreshed (demo data).');
}

function refreshDashboard() {
  renderAll();
  showToast('Dashboard refreshed (demo data).');
}

function viewDevice(id) {
  const d = devices.find(item => item.id === Number(id));
  if (!d) return;

  selectedDeviceId = d.id;

  const fields = {
    detailDeviceName: d.name,
    detailDeviceSubtitle: `${d.department} / ${d.lab} · ${d.ip}`,
    detailName: d.name,
    detailIP: d.ip,
    detailDepartment: d.department,
    detailLab: d.lab,
    detailLastSeen: d.lastSeen,
    detailResponse: d.response,
    detailOpenPortCount: `${d.openPorts.length} OPEN`
  };

  Object.entries(fields).forEach(([id, value]) => {
    if ($(id)) $(id).textContent = value;
  });

  const state = $('detailStatus');
  if (state) {
    state.className = `status ${d.status}`;
    state.textContent = `● ${d.status.toUpperCase()}`;
  }

  const table = $('detailPortsTable');

  if (table) {
    table.innerHTML = d.ports.map(p => `
      <tr>
        <td>${p.port}</td><td>${p.protocol}</td><td>${p.service}</td>
        <td><span class="status ${p.status === 'Open' ? 'online' : 'offline'}">${p.status}</span></td>
      </tr>
    `).join('');
  }

  const history = $('deviceHistory');
  if (history) {
    history.innerHTML = `
      <div class="history-card">
        <strong>Latest check</strong>
        <p>${escapeHTML(d.lastSeen)}</p>
        <small>${d.openPorts.length} open port(s) · ${escapeHTML(d.status)}</small>
      </div>`;
  }

  showPage('device-details');
}

function scanSelectedDevice() {
  const d = devices.find(item => item.id === selectedDeviceId);
  if (!d) return showToast('Select a device first.');
  showToast(`Demo check completed for ${d.name}; no real network packets were sent.`);
}

function renderRecentScans() {
  const table = $('recentScanTable');
  if (!table) return;

  const rows = scanHistory.slice(0, 4);

  if (!rows.length) {
    table.innerHTML = `
      <tr><td>SC-1003</td><td>192.168.1.0/24</td><td>Today</td>
      <td>12 sec</td><td>40</td><td>72</td>
      <td><span class="status online">Completed (demo)</span></td></tr>`;
    return;
  }

  table.innerHTML = rows.map(s => `
    <tr>
      <td>${s.id}</td><td>${escapeHTML(s.network)}</td>
      <td>${escapeHTML(s.date)}</td><td>${s.duration}</td>
      <td>${s.devices}</td><td>${s.ports}</td>
      <td><span class="status online">${s.status}</span></td>
    </tr>`).join('');
}

function startScan() {
  if (scanRunning) return;

  const network = $('networkRange')?.value.trim() || '';

  const privateRange =
    /^(10\.(\d{1,3}\.){2}\d{1,3}|192\.168\.(\d{1,3})\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.(\d{1,3})\.\d{1,3})\/(\d|[12]\d|3[0-2])$/.test(network);

  if (!privateRange) {
    return showToast('Enter a private IPv4 CIDR range for the demo.');
  }

  const ports = [
    ...document.querySelectorAll(
      '.port-checkboxes input[type="checkbox"]:checked'
    )
  ].map(x => Number(x.value));

  const custom = ($('customPorts')?.value || '').trim();

  if (custom && !custom.split(',').every(p =>
    /^\s*\d{1,5}\s*$/.test(p) &&
    Number(p.trim()) >= 1 &&
    Number(p.trim()) <= 65535
  )) {
    return showToast('Custom ports must be numbers from 1 to 65535.');
  }

  if (!ports.length && !custom) {
    return showToast('Select at least one port to continue.');
  }

  scanRunning = true;
  scanCancelled = false;

  $('startScanBtn')?.classList.add('hidden');
  $('stopScanBtn')?.classList.remove('hidden');
  $('scanResult')?.classList.add('hidden');

  const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
  const labels = [
    'Discovering devices...',
    'Scanning selected ports...',
    'Detecting demo services...',
    'Processing simulated results...',
    'Demo scan completed'
  ];

  steps.forEach(id => $(id)?.classList.remove('completed', 'active'));

  let progress = 0;

  if ($('scanStatusText')) {
    $('scanStatusText').textContent = 'Starting demo scan...';
  }

  scanTimer = setInterval(() => {
    if (scanCancelled) {
      clearInterval(scanTimer);
      scanTimer = null;
      return;
    }

    progress = Math.min(progress + 20, 100);

    if ($('scanPercent')) $('scanPercent').textContent = `${progress}%`;
    if ($('progressFill')) $('progressFill').style.width = `${progress}%`;

    const index = Math.min(Math.floor((progress - 1) / 20), 4);

    steps.forEach((id, i) => {
      $(id)?.classList.toggle('active', i === index);
      $(id)?.classList.toggle('completed', i < index);
    });

    if ($('scanStatusText')) $('scanStatusText').textContent = labels[index];

    if (progress >= 100) {
      clearInterval(scanTimer);
      scanTimer = null;
      scanRunning = false;

      $('startScanBtn')?.classList.remove('hidden');
      $('stopScanBtn')?.classList.add('hidden');
      steps.forEach(id => $(id)?.classList.add('completed'));

      const online = devices.filter(d => d.status === 'online').length;
      const offline = devices.length - online;
      const portCount = ports.length + (custom ? custom.split(',').length : 0);

      const result = {
        id: `SC-${nextScanNumber++}`,
        network,
        date: new Date().toLocaleString(),
        duration: '5 sec',
        devices: devices.length,
        online,
        offline,
        ports: portCount * 10,
        status: 'Completed (demo)'
      };

      scanHistory.unshift(result);

      const fields = {
        resultDevices: result.devices,
        resultOnline: online,
        resultOffline: offline,
        resultPorts: result.ports,
        resultServices: services.filter(s => s.enabled).length,
        resultDuration: result.duration
      };

      Object.entries(fields).forEach(([id, value]) => {
        if ($(id)) $(id).textContent = value;
      });

      $('scanResult')?.classList.remove('hidden');
      if ($('lastScan')) $('lastScan').textContent = 'Just now';
      if ($('lastScanStatus')) $('lastScanStatus').textContent = 'Demo completed';

      updateDashboard();
      renderHistory();
      showToast('Demo scan completed. Results are simulated.');
    }
  }, 450);
}

function stopScan() {
  if (scanTimer) clearInterval(scanTimer);

  scanTimer = null;
  scanCancelled = true;
  scanRunning = false;

  $('startScanBtn')?.classList.remove('hidden');
  $('stopScanBtn')?.classList.add('hidden');

  if ($('scanStatusText')) $('scanStatusText').textContent = 'Scan stopped';
  showToast('Demo scan stopped.');
}

function renderServices() {
  const cards = $('serviceCards');
  const table = $('serviceTable');

  if (cards) {
    cards.innerHTML = services.map(s => `
      <div class="service-card panel">
        <div class="panel-header">
          <div><h3>${escapeHTML(s.name)}</h3><span>Port ${s.port} / ${s.protocol}</span></div>
          <span class="status ${s.available ? 'online' : 'offline'}">${s.available ? 'Available' : 'Unavailable'}</span>
        </div>
        <p>${s.enabled ? 'Monitoring enabled' : 'Monitoring disabled'}</p>
      </div>`).join('');
  }

  if (table) {
    table.innerHTML = services.map((s, i) => `
      <tr>
        <td>${escapeHTML(s.name)}</td><td>${s.port}</td><td>${s.protocol}</td>
        <td><span class="status ${s.enabled ? 'online' : 'offline'}">${s.enabled ? 'Enabled' : 'Disabled'}</span></td>
        <td><span class="status ${s.available ? 'online' : 'offline'}">${s.available ? 'Available' : 'Unavailable'}</span></td>
        <td>
          <button class="action-btn" onclick="toggleService(${i})">${s.enabled ? 'DISABLE' : 'ENABLE'}</button>
          <button class="action-btn" onclick="deleteService(${i})">DELETE</button>
        </td>
      </tr>`).join('');
  }
}

function openServiceModal() {
  $('serviceModal')?.classList.remove('hidden');
}

function addService() {
  const name = $('newServiceName')?.value.trim();
  const port = Number($('newServicePort')?.value);
  const protocol = $('newServiceProtocol')?.value || 'TCP';

  if (!name) return showToast('Enter a service name.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return showToast('Enter a valid port from 1 to 65535.');
  }
  if (services.some(s => s.port === port && s.protocol === protocol)) {
    return showToast('That port and protocol already exist.');
  }

  services.push({ name, port, protocol, enabled: true, available: false });

  if ($('newServiceName')) $('newServiceName').value = '';
  if ($('newServicePort')) $('newServicePort').value = '';

  closeModal('serviceModal');
  renderServices();
  updateDashboard();
  showToast('Service added to demo list.');
}

function toggleService(index) {
  if (!services[index]) return;
  services[index].enabled = !services[index].enabled;
  renderServices();
  updateDashboard();
}

function deleteService(index) {
  if (!services[index]) return;
  services.splice(index, 1);
  renderServices();
  updateDashboard();
  showToast('Service removed.');
}

function renderHistory() {
  const table = $('historyTable');
  if (!table) return;

  const data = scanHistory.length ? scanHistory : [
    {
      id: 'SC-1003', network: '192.168.1.0/24',
      date: 'Previous demo', devices: 40, ports: 72,
      duration: '12 sec', status: 'Completed (demo)'
    },
    {
      id: 'SC-1002', network: '192.168.1.0/24',
      date: 'Earlier demo', devices: 38, ports: 68,
      duration: '10 sec', status: 'Completed (demo)'
    }
  ];

  table.innerHTML = data.map(s => `
    <tr>
      <td>${escapeHTML(s.id)}</td><td>${escapeHTML(s.network)}</td>
      <td>${escapeHTML(s.date)}</td><td>${s.devices}</td><td>${s.ports}</td>
      <td>${escapeHTML(s.duration)}</td>
      <td><span class="status online">${escapeHTML(s.status)}</span></td>
      <td><button class="action-btn" onclick="viewScan('${escapeHTML(s.id)}')">VIEW</button></td>
    </tr>`).join('');

  ['previousScan', 'currentScan'].forEach(id => {
    const select = $(id);
    if (!select) return;

    const oldValue = select.value;
    select.innerHTML = data.map(s =>
      `<option value="${escapeHTML(s.id)}">${escapeHTML(s.id)} — ${escapeHTML(s.date)}</option>`
    ).join('');

    if ([...select.options].some(o => o.value === oldValue)) {
      select.value = oldValue;
    }
  });
}

function viewScan(id) {
  const s = scanHistory.find(x => x.id === id);

  showToast(s
    ? `${s.id}: ${s.devices} simulated devices, ${s.ports} simulated open ports.`
    : `${id}: sample demo record.`
  );
}

function openCompareModal() {
  renderHistory();
  $('compareModal')?.classList.remove('hidden');
}

function compareScans() {
  const aId = $('previousScan')?.value;
  const bId = $('currentScan')?.value;

  if (!aId || !bId || aId === bId) {
    return showToast('Choose two different scans to compare.');
  }

  const data = scanHistory.length ? scanHistory : [
    { id: 'SC-1003', devices: 40, ports: 72 },
    { id: 'SC-1002', devices: 38, ports: 68 }
  ];

  const a = data.find(s => s.id === aId);
  const b = data.find(s => s.id === bId);

  if (!a || !b) return showToast('Scan record not found.');

  const content = $('comparisonContent');

  if (content) {
    content.innerHTML = `
      <p><strong>${escapeHTML(a.id)}</strong> compared with <strong>${escapeHTML(b.id)}</strong></p>
      <p>Device count change: <strong>${b.devices - a.devices}</strong></p>
      <p>Open-port count change: <strong>${b.ports - a.ports}</strong></p>
      <small>Comparison uses demo records only.</small>`;
  }

  $('comparisonResult')?.classList.remove('hidden');
  closeModal('compareModal');
  showPage('history');
}

function exportAllScans() {
  const data = scanHistory.length ? scanHistory : [
    {
      id: 'SC-1003', network: '192.168.1.0/24',
      date: 'Sample', devices: 40, ports: 72,
      duration: '12 sec', status: 'Completed (demo)'
    }
  ];

  const columns = ['id', 'network', 'date', 'devices', 'ports', 'duration', 'status'];

  const csv = [
    columns.join(','),
    ...data.map(row => columns.map(k =>
      `"${String(row[k] ?? '').replace(/"/g, '""')}"`
    ).join(','))
  ].join('\r\n');

  downloadText('msec-scan-history.csv', csv, 'text/csv;charset=utf-8;');
}

function renderTopology() {
  const container = $('topologyDevices');
  if (!container) return;

  container.innerHTML = devices.slice(0, 12).map(d => `
    <div class="network-node computer">
      <div class="node-icon">🖥</div>
      <strong>${escapeHTML(d.name)}</strong>
      <span>${escapeHTML(d.ip)}</span>
      <span class="status ${d.status}">${d.status}</span>
    </div>`).join('');
}

function saveSettings() {
  const range = $('settingNetwork')?.value.trim();
  const ports = $('settingPorts')?.value.trim();

  if (range && !/^[\d./]+$/.test(range)) {
    return showToast('Check the default network range.');
  }

  if (ports && !ports.split(',').every(p =>
    /^\s*\d{1,5}\s*$/.test(p) &&
    Number(p.trim()) >= 1 &&
    Number(p.trim()) <= 65535
  )) {
    return showToast('Default ports must be numbers from 1 to 65535.');
  }

  showToast('Settings saved for this demo session.');
}

function closeModal(id) {
  $(id)?.classList.add('hidden');
}

function closeModalOutside(event, id) {
  if (event.target?.id === id) closeModal(id);
}

function showToast(message) {
  const container = $('toastContainer');

  if (!container) {
    console.log(message);
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;

  Object.assign(toast.style, {
    background: '#172033',
    color: '#fff',
    padding: '12px 16px',
    marginTop: '8px',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,.18)',
    fontSize: '13px',
    maxWidth: '360px'
  });

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

Object.assign(window, {
  togglePassword,
  logout,
  toggleSidebar,
  toggleTheme,
  refreshDashboard,
  goToScan,
  showPage,
  startScan,
  stopScan,
  renderDevices,
  refreshDevices,
  viewDevice,
  scanSelectedDevice,
  openServiceModal,
  addService,
  toggleService,
  deleteService,
  exportAllScans,
  openCompareModal,
  compareScans,
  closeModal,
  closeModalOutside,
  changeThemeFromSetting,
  saveSettings,
  viewScan
});

document.addEventListener('DOMContentLoaded', init);

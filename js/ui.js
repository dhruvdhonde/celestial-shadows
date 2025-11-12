import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

let fluxChart = null;
export function initCharts(){
  const ctx = document.getElementById('fluxChart').getContext('2d');
  fluxChart = new Chart(ctx, {
    type:'line',
    data:{ labels:[], datasets:[{ label:'Normalized Flux', data:[], borderColor:'#f6b100', tension:0.2, pointRadius:0 }]},
    options:{ animation:false, scales:{ x:{ display:false }, y:{ min:0, max:1 }}}
  });
}

export function pushFluxData(t, flux){
  if (!fluxChart) return;
  fluxChart.data.labels.push(t.toFixed(2));
  fluxChart.data.datasets[0].data.push(flux);
  if (fluxChart.data.labels.length > 300){
    fluxChart.data.labels.shift(); fluxChart.data.datasets[0].data.shift();
  }
  fluxChart.update('none');
}

export function updateDataPanel(simTime, angSun, angMoon, obsc, phase){
  document.getElementById('simTime').textContent = simTime.toFixed(2);
  document.getElementById('angSun').textContent = angSun.toFixed(3);
  document.getElementById('angMoon').textContent = angMoon.toFixed(3);
  document.getElementById('obsc').textContent = (obsc*100).toFixed(3) + '%';
  document.getElementById('phase').textContent = phase;
}

function switchTab(tab) {
  document.getElementById('sec-inicio').classList.add('hidden');
  document.getElementById('sec-mapa').classList.add('hidden');
  document.getElementById('sec-scanner').classList.add('hidden');

  if (tab === 'inicio') {
    document.getElementById('sec-inicio').classList.remove('hidden');
    stopScanner();
  } else if (tab === 'mapa') {
    document.getElementById('sec-mapa').classList.remove('hidden');
    stopScanner();
    initMap();
  } else if (tab === 'scanner') {
    document.getElementById('sec-scanner').classList.remove('hidden');
    startScanner();
  }
}
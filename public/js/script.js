document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('filterSidebar');
  const toggleBtn = document.getElementById('filterToggle');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  const exportBtn = document.getElementById('exportBtn');
  const codeModalEl = document.getElementById('codeModal');
  if (!exportBtn || !codeModalEl) return;
  const modal = new bootstrap.Modal(codeModalEl);

   exportBtn.addEventListener('click', async () => {
     const res = await fetch('/export/start', { method: 'POST' });
     if (res.ok) {
       modal.show();
     } else {
       alert('Erreur lors du lancement.');
     }
   });

   document.getElementById('confirmCode').addEventListener('click', async () => {
     const code = document.getElementById('smsCode').value.trim();
     if (!code) return;
     const res = await fetch('/export/finish', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code }),
     });
     const data = await res.json();
     if (data.success) {
       modal.hide();
       location.reload();
     } else {
       alert(data.error || 'Erreur');
     }
   });
 });

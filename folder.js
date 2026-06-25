console.log('[Gather] folder.js loaded');

/* ───────────────────────────────
   SUPABASE
─────────────────────────────── */
const SUPABASE_URL      = 'https://gbecjtxfdpzwhjeououn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_23Gk6zKm0z3QP8BcLW3q3A_Td2mIiUT';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-loaded');
});

/* ───────────────────────────────
   GET TAG FROM URL
─────────────────────────────── */
const params     = new URLSearchParams(window.location.search);
const currentTag = params.get('tag') || '';

console.log('[Gather] Tag:', currentTag);

window.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('folderTitle');
  if (titleEl && currentTag) {
    titleEl.textContent = currentTag
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
});

/* ───────────────────────────────
   EDIT MODAL ELEMENTS
─────────────────────────────── */
const modal         = document.getElementById('modalOverlay');
const closeModalBtn  = document.getElementById('closeModalBtn');
const form           = document.getElementById('resourceForm');
const pdfInput       = document.getElementById('pdfFile');
const fileNameText   = document.getElementById('fileName');
const removeFileBtn  = document.getElementById('removeFileBtn');

// Tracks which resource is currently being edited (its Supabase row id)
let editingResourceId = null;

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  editingResourceId = null;
});

pdfInput.addEventListener('change', () => {
  const file = pdfInput.files[0];
  if (file) {
    fileNameText.textContent = file.name;
    removeFileBtn.classList.remove('hidden');
  } else {
    fileNameText.textContent = '';
    removeFileBtn.classList.add('hidden');
  }
});

removeFileBtn.addEventListener('click', () => {
  pdfInput.value = '';
  fileNameText.textContent = '';
  removeFileBtn.classList.add('hidden');
});

/* ───────────────────────────────
   OPEN EDIT MODAL — prefill with resource data
─────────────────────────────── */
function openEditModal(resource) {
  editingResourceId = resource.id;

  document.getElementById('title').value          = resource.title || '';
  document.getElementById('url').value             = resource.url || '';
  document.getElementById('resourceType').value    = resource.resource_type || '';
  document.getElementById('intent').value          = resource.intent || '';
  document.getElementById('tags').value            = resource.tags || '';

  // date input needs YYYY-MM-DD
  document.getElementById('dateOfCreation').value =
    resource.date_of_creation ? resource.date_of_creation.split('T')[0] : '';

  // reset file upload state (editing doesn't re-prefill the file picker)
  pdfInput.value = '';
  fileNameText.textContent = '';
  removeFileBtn.classList.add('hidden');

  modal.classList.remove('hidden');
}

/* ───────────────────────────────
   CLOSE ANY OPEN CARD MENUS
─────────────────────────────── */
function closeAllCardMenus() {
  document.querySelectorAll('.card-menu').forEach(m => m.classList.add('hidden'));
}
document.addEventListener('click', closeAllCardMenus);

/* ───────────────────────────────
   RENDER CARD
─────────────────────────────── */
function createCard(resource) {

  const imageUrl = resource.screenshot || resource.image_url || '';

  const tagList = resource.tags
    ? resource.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const card = document.createElement('div');
  card.className = 'resource-card';
  if (resource.url) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // don't open the link if the click came from the menu
      if (e.target.closest('.card-menu-btn, .card-menu')) return;
      window.open(resource.url, '_blank');
    });
  }

  /* ── THREE-DOT MENU ── */
  const menuBtn = document.createElement('button');
  menuBtn.className = 'card-menu-btn';
  menuBtn.type = 'button';
  menuBtn.innerHTML = `<img src="./assets/three-dots.svg" alt="menu">`;

  const menu = document.createElement('div');
  menu.className = 'card-menu hidden';

  const editItem = document.createElement('button');
  editItem.type = 'button';
  editItem.className = 'card-menu-item';
  editItem.textContent = 'Edit';
  editItem.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllCardMenus();
    openEditModal(resource);
  });

  const deleteItem = document.createElement('button');
  deleteItem.type = 'button';
  deleteItem.className = 'card-menu-item card-menu-item-delete';
  deleteItem.textContent = 'Delete';
  deleteItem.addEventListener('click', async (e) => {
    e.stopPropagation();
    closeAllCardMenus();

    const confirmed = window.confirm(
      `Delete "${resource.title || 'this resource'}"? This can't be undone.`
    );
    if (!confirmed) return;

    const { error } = await supabaseClient
      .from('Resources')
      .delete()
      .eq('id', resource.id);

    if (error) {
      console.error('[Gather] Delete error:', error);
      alert('Could not delete resource: ' + error.message);
      return;
    }

    // remove the card from the page immediately
    card.remove();
  });

  menu.appendChild(editItem);
  menu.appendChild(deleteItem);

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains('hidden');
    closeAllCardMenus();
    if (!isOpen) menu.classList.remove('hidden');
  });

  // Image slot
  const imageDiv = document.createElement('div');
  imageDiv.className = imageUrl ? 'resource-image' : 'resource-image hidden';
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = resource.title || '';
    img.loading = 'lazy';
    img.onerror = () => { imageDiv.classList.add('hidden'); };
    imageDiv.appendChild(img);
  }

  // Type label
  const label = document.createElement('p');
  label.className = 'resource-label';
  label.textContent = resource.resource_type || 'Resource';

  // Published date
  const publishedDate = document.createElement('p');
  publishedDate.className = 'published-date';

  if (resource.date_of_creation) {
    const date  = new Date(resource.date_of_creation);
    const day   = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year  = date.getFullYear();

    function getOrdinal(n) {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    }

    const formattedDate = day === 1
      ? `${month} ${year}`
      : `${day}${getOrdinal(day)} ${month} ${year}`;

    publishedDate.textContent = `Published on: ${formattedDate}`;
  } else {
    publishedDate.innerHTML = '&nbsp;';
  }

  // Title
  const title = document.createElement('h2');
  title.className = 'resource-title';
  title.textContent = resource.title || 'Untitled';

  // Why I saved this
  const intentWrapper = document.createElement('div');
  intentWrapper.className = 'intent-wrapper';

  const intentLabel = document.createElement('p');
  intentLabel.className = 'intent-label';
  intentLabel.textContent = 'Why I saved this resource';

  const intentText = document.createElement('p');
  intentText.className = 'intent-text';
  intentText.textContent = resource.intent || '';

  intentWrapper.appendChild(intentLabel);
  intentWrapper.appendChild(intentText);

  // Tags
  const tagsDiv = document.createElement('div');
  tagsDiv.className = 'tags-container';
  tagList.forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = tag;
    tagsDiv.appendChild(pill);
  });

  card.appendChild(menuBtn);
  card.appendChild(menu);
  card.appendChild(imageDiv);
  card.appendChild(label);
  card.appendChild(publishedDate);
  card.appendChild(title);
  card.appendChild(intentWrapper);
  card.appendChild(tagsDiv);

  return card;
}

/* ───────────────────────────────
   LOAD RESOURCES
─────────────────────────────── */
async function loadResources() {
  const container = document.getElementById('resourcesContainer');
  if (!container) return;

  container.innerHTML = '<p class="state-msg">Loading...</p>';

  const { data, error } = await supabaseClient
    .from('Resources')
    .select('*');

  if (error) {
    console.error('[Gather] Supabase error:', error);
    container.innerHTML = '<p class="state-msg">Could not load resources.</p>';
    return;
  }

  const filtered = currentTag
    ? data.filter(r => r.tags && r.tags.toLowerCase().includes(currentTag.toLowerCase()))
    : data;

  container.innerHTML = '';

  if (!filtered.length) {
    container.innerHTML = '<p class="state-msg">No resources found for this tag.</p>';
    return;
  }

  for (let i = 0; i < filtered.length; i += 4) {
    const rowItems = filtered.slice(i, i + 4);

    const shelfRow = document.createElement('div');
    shelfRow.className = 'shelf-row';

    const grid = document.createElement('div');
    grid.className = 'resources-grid';
    rowItems.forEach(r => grid.appendChild(createCard(r)));

    const shelf = document.createElement('img');
    shelf.className = 'shelf-plank';
    shelf.src = './assets/shelf.png';
    shelf.alt = '';
    shelf.draggable = false;

    shelfRow.appendChild(grid);
    shelfRow.appendChild(shelf);
    container.appendChild(shelfRow);
  }
}

/* ───────────────────────────────
   SAVE (EDIT) RESOURCE
─────────────────────────────── */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title          = document.getElementById('title').value;
  const urlInput        = document.getElementById('url').value;
  const resourceType    = document.getElementById('resourceType').value;
  const intent          = document.getElementById('intent').value;
  const dateOfCreation  = document.getElementById('dateOfCreation').value;
  const tags            = document.getElementById('tags').value;

  let finalURL = urlInput;

  // optional PDF re-upload
  const file = pdfInput.files[0];
  if (file) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('PDFs')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      alert('PDF upload failed');
      return;
    }

    const { data: publicURLData } = supabaseClient.storage
      .from('PDFs')
      .getPublicUrl(fileName);

    finalURL = publicURLData.publicUrl;
  }

  if (!editingResourceId) {
    console.warn('[Gather] No resource selected for editing.');
    return;
  }

  const { error } = await supabaseClient
    .from('Resources')
    .update({
      title: title,
      resource_type: resourceType,
      intent: intent,
      date_of_creation: dateOfCreation || null,
      url: finalURL,
      tags: tags
    })
    .eq('id', editingResourceId);

  if (error) {
    console.error('SUPABASE ERROR:', error);
    alert(error.message);
    return;
  }

  alert('Resource updated successfully');

  form.reset();
  fileNameText.textContent = '';
  modal.classList.add('hidden');
  editingResourceId = null;

  loadResources();
});

/* ───────────────────────────────
   COLLECTIONS NAV TRANSITION
─────────────────────────────── */
const collectionsBtn = document.querySelector('.collections-button');
if (collectionsBtn) {
  collectionsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 300);
  });
}

loadResources();
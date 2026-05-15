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
   e.g. folder.html?tag=service+design
─────────────────────────────── */
const params     = new URLSearchParams(window.location.search);
const currentTag = params.get('tag') || '';

console.log('[Gather] Tag:', currentTag);

/* ───────────────────────────────
   SET PAGE TITLE
─────────────────────────────── */
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
   RENDER CARD
─────────────────────────────── */
function createCard(resource) {

  /* ── image ──
     Update 'screenshot' below to match your Supabase column name.
     If the column doesn't exist yet, the image slot is hidden.     */
  const imageUrl = resource.screenshot || resource.image_url || '';

  /* ── tags ──
     Your tags column is a comma-separated string, e.g. "design, research" */
  const tagList = resource.tags
    ? resource.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  // Card wrapper
  const card = document.createElement('div');
  card.className = 'resource-card';
  if (resource.url) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => window.open(resource.url, '_blank'));
  }

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
  label.textContent =
    resource.resource_type || 'Resource';

 // Title

const title =
    document.createElement('h2');

title.className =
    'resource-title';

title.textContent =
    resource.title || 'Untitled';

/* WHY I SAVED THIS */

const intentWrapper =
    document.createElement('div');

intentWrapper.className =
    'intent-wrapper';

const intentLabel =
    document.createElement('p');

intentLabel.className =
    'intent-label';

intentLabel.textContent =
    'Why I saved this resource';

const intentText =
    document.createElement('p');

intentText.className =
    'intent-text';

intentText.textContent =
    resource.intent || '';

intentWrapper.appendChild(intentLabel);

intentWrapper.appendChild(intentText);

/* TAGS */

const tagsDiv =
    document.createElement('div');

tagsDiv.className =
    'tags-container';

tagList.forEach(tag => {

    const pill =
        document.createElement('span');

    pill.className =
        'tag-pill';

    pill.textContent =
        tag;

    tagsDiv.appendChild(pill);

});

  card.appendChild(imageDiv);
  card.appendChild(label);
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

  // Loading state
  container.innerHTML = '<p class="state-msg">Loading...</p>';

  // Fetch all, filter client-side (tags is a string column)
  const { data, error } = await supabaseClient
    .from('Resources')
    .select('*');

  if (error) {
    console.error('[Gather] Supabase error:', error);
    container.innerHTML = '<p class="state-msg">Could not load resources.</p>';
    return;
  }

  console.log('[Gather] All rows:', data.length, '| Sample:', data[0]);

  // Filter by tag (case-insensitive substring match on comma-separated string)
  const filtered = currentTag
    ? data.filter(r => r.tags && r.tags.toLowerCase().includes(currentTag.toLowerCase()))
    : data;

  console.log('[Gather] Filtered:', filtered.length);

  container.innerHTML = '';

  if (!filtered.length) {
    container.innerHTML = '<p class="state-msg">No resources found for this tag.</p>';
    return;
  }

  // Group into rows of 4, each followed by a shelf plank
  for (let i = 0; i < filtered.length; i += 4) {
    const rowItems = filtered.slice(i, i + 4);

    const shelfRow = document.createElement('div');
    shelfRow.className = 'shelf-row';

    const grid = document.createElement('div');
    grid.className = 'resources-grid';
    rowItems.forEach(r => grid.appendChild(createCard(r)));

    const shelf = document.createElement('img');
    shelf.className = 'shelf-plank';
    shelf.src = './assets/shelf.png'; // ← update filename if yours differs
    shelf.alt = '';
    shelf.draggable = false;

    shelfRow.appendChild(grid);
    shelfRow.appendChild(shelf);
    container.appendChild(shelfRow);
  }
}

const collectionsBtn =
document.querySelector('.pill');

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
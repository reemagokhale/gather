/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    'https://gbecjtxfdpzwhjeououn.supabase.co';

const SUPABASE_ANON_KEY =
    'sb_publishable_23Gk6zKm0z3QP8BcLW3q3A_Td2mIiUT';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* =========================================
   ELEMENTS
========================================= */

const viewport =
    document.getElementById('viewport');

const canvas =
    document.getElementById('canvas');

/* =========================================
   PAGE TRANSITION
========================================= */

window.addEventListener(
    'DOMContentLoaded',
    () => {
        document.body.classList.add('page-loaded');
    }
);

/* =========================================
   PAN / DRAG STATE
========================================= */

let isDragging = false;

let startX = 0;
let startY = 0;

let currentX =
    window.innerWidth / 2 - 850;

let currentY =
    window.innerHeight / 2 - 450;

/* =========================================
   INITIAL POSITION
========================================= */

updateCanvas();

function updateCanvas() {

    canvas.style.transform =
        `translate(${currentX}px, ${currentY}px)`;

}

/* =========================================
   MOUSE DRAGGING
========================================= */

/* MOUSE DOWN */

viewport.addEventListener(
    'mousedown',
    (e) => {

        isDragging = true;

        viewport.classList.add('dragging');

        startX = e.clientX;
        startY = e.clientY;

    }
);

/* MOUSE MOVE */

window.addEventListener(
    'mousemove',
    (e) => {

        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        currentX += dx;
        currentY += dy;

        updateCanvas();

        startX = e.clientX;
        startY = e.clientY;

    }
);

/* MOUSE UP */

window.addEventListener(
    'mouseup',
    () => {

        isDragging = false;

        viewport.classList.remove('dragging');

    }
);

/* =========================================
   TRACKPAD / SCROLL PANNING
========================================= */

viewport.addEventListener(
    'wheel',
    (e) => {

        e.preventDefault();

        currentX -= e.deltaX * 0.9;
        currentY -= e.deltaY * 0.9;

        updateCanvas();

    },
    { passive: false }
);

/* =========================================
   PREVENT IMAGE DRAG
========================================= */

window.addEventListener(
    'dragstart',
    (e) => {
        e.preventDefault();
    }
);

/* =========================================
   MODAL
========================================= */

const addButton =
    document.getElementById('openModalBtn');

const modal =
    document.getElementById('modalOverlay');

const closeButton =
    document.getElementById('closeModalBtn');

/* OPEN */

addButton.addEventListener(
    'click',
    () => {

        modal.classList.remove('hidden');

    }
);

/* CLOSE */

closeButton.addEventListener(
    'click',
    () => {

        modal.classList.add('hidden');

    }
);

/* =========================================
   LOAD TAGS AS FOLDERS
========================================= */

async function loadFolders() {

    const { data, error } =
        await supabaseClient
            .from('Resources')
            .select('tags');

    if (error) {

        console.error(error);

        return;

    }

    /* ALL TAGS */

    let allTags = [];

    data.forEach(resource => {

        if (!resource.tags) return;

        const splitTags =
            resource.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);

        allTags.push(...splitTags);

    });

    /* UNIQUE TAGS */

    const uniqueTags =
        [...new Set(allTags)];

    console.log(uniqueTags);

    generateFolders(uniqueTags);

}

/* =========================================
   GENERATE FOLDERS
========================================= */

function generateFolders(tags) {

    tags.forEach((tag, index) => {

        const folder =
            document.createElement('div');

        folder.classList.add('folder');

        /* HORIZONTAL ORGANIC LAYOUT */

const columns = 6;

const spacingX = 260;
const spacingY = 220;

const centerOffsetX = 150;
const centerOffsetY = 250;

const x =
    centerOffsetX +
    (index % columns) * spacingX +
    (Math.random() * 120 - 60);

const y =
    centerOffsetY +
    Math.floor(index / columns) * spacingY +
    (Math.random() * 140 - 70);

        folder.style.left = `${x}px`;
        folder.style.top = `${y}px`;



        /* IMAGE */

        const img =
            document.createElement('img');

        img.src = './assets/folder.png';

        img.classList.add('folder-img');

        /* NAME */

        const name =
            document.createElement('div');

        name.classList.add('folder-name');

        name.textContent = tag;

        /* APPEND */

        folder.appendChild(img);
        folder.appendChild(name);

        /* NAVIGATION */

        folder.addEventListener(
            'click',
            () => {

                document.body.classList.add('page-exit');

                setTimeout(() => {

                    window.location.href =
                        `folder.html?tag=${encodeURIComponent(tag)}`;

                }, 300);

            }
        );

        canvas.appendChild(folder);

    });

}

/* =========================================
   LOAD
========================================= */

loadFolders();

/* =========================================
   OPTIONAL DEBUG FUNCTION
========================================= */

async function openFolder(tag) {

    const { data, error } =
        await supabaseClient
            .from('Resources')
            .select('*');

    if (error) {

        console.error(error);

        return;

    }

    const filteredResources =
        data.filter(resource => {

            if (!resource.tags) return false;

            return resource.tags
                .toLowerCase()
                .includes(tag.toLowerCase());

        });

    console.log(filteredResources);

}

/* =========================================
   ADD RESOURCE FORM
========================================= */

const form =
    document.getElementById('resourceForm');

const pdfInput =
    document.getElementById('pdfFile');

const fileNameText =
    document.getElementById('fileName');

const removeFileBtn =
    document.getElementById('removeFileBtn');

/* =========================================
   SHOW FILE NAME
========================================= */

pdfInput.addEventListener(
    'change',
    () => {

        const file =
            pdfInput.files[0];

        if (file) {

            fileNameText.textContent =
                file.name;

            removeFileBtn.classList.remove(
                'hidden'
            );

        } else {

            fileNameText.textContent = '';

            removeFileBtn.classList.add(
                'hidden'
            );
        }

    }
);

/* =========================================
   REMOVE PDF
========================================= */

removeFileBtn.addEventListener(
    'click',
    () => {

        pdfInput.value = '';

        fileNameText.textContent = '';

        removeFileBtn.classList.add(
            'hidden'
        );

    }
);

fileNameText.textContent = '';

removeFileBtn.classList.add(
    'hidden'
);

/* =========================================
   SAVE RESOURCE
========================================= */

form.addEventListener(
    'submit',
    async (e) => {

        e.preventDefault();

        const title =
            document.getElementById('title').value;

        const urlInput =
            document.getElementById('url').value;

        const type =
            document.getElementById('type').value;

        const tags =
            document.getElementById('tags').value;

        let finalURL = urlInput;

        /* =====================================
           PDF UPLOAD
        ===================================== */

        const file =
            pdfInput.files[0];

        if (file) {

            const fileName =
                `${Date.now()}-${file.name}`;

            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient.storage
                    .from('PDFs')
                    .upload(fileName, file);

            if (uploadError) {

                console.error(uploadError);

                alert('PDF upload failed');

                return;
            }

            const {
                data: publicURLData
            } =
                supabaseClient.storage
                    .from('PDFs')
                    .getPublicUrl(fileName);

            finalURL =
                publicURLData.publicUrl;
        }

        /* =====================================
           SAVE TO DATABASE
        ===================================== */

        const { error } =
            await supabaseClient
                .from('Resources')
                .insert([
                    {
                        title,
                        url: finalURL,
                        type,
                        tags
                    }
                ]);

        if (error) {

            console.error(error);

            alert('Failed to save resource');

            return;
        }

        /* SUCCESS */

        alert('Resource added successfully');

        form.reset();

        fileNameText.textContent =
            'No PDF selected';

        modal.classList.add('hidden');

        /* =====================================
           REFRESH FOLDERS
        ===================================== */

        canvas.innerHTML = '';

        loadFolders();

    }
);
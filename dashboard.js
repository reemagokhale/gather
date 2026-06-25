(async () => {

    const {
        data: { session }
    } =
    await supabaseClient.auth.getSession();

    if (!session) {

        window.location.href =
            "admin.html";

        return;

    }

})();

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "admin.html";

        }
    );

}

/* =========================================
   ELEMENTS
========================================= */

const viewport =
    document.getElementById("viewport");

const canvas =
    document.getElementById("canvas");


/* =========================================
   PAGE TRANSITION
========================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {
        document.body.classList.add("page-loaded");
    }
);


/* =========================================
   PAN / DRAG
========================================= */

let isDragging = false;

let startX = 0;
let startY = 0;

let currentX =
    window.innerWidth / 2 - 850;

let currentY =
    window.innerHeight / 2 - 450;

updateCanvas();

function updateCanvas() {

    canvas.style.transform =
        `translate(${currentX}px, ${currentY}px)`;

}


/* =========================================
   MOUSE DRAGGING
========================================= */

viewport.addEventListener(
    "mousedown",
    e => {

        isDragging = true;

        viewport.classList.add("dragging");

        startX = e.clientX;
        startY = e.clientY;

    }
);


window.addEventListener(
    "mousemove",
    e => {

        if (!isDragging) return;

        currentX += e.clientX - startX;
        currentY += e.clientY - startY;

        startX = e.clientX;
        startY = e.clientY;

        updateCanvas();

    }
);


window.addEventListener(
    "mouseup",
    () => {

        isDragging = false;

        viewport.classList.remove("dragging");

    }
);


/* =========================================
   TRACKPAD
========================================= */

viewport.addEventListener(
    "wheel",
    e => {

        e.preventDefault();

        currentX -= e.deltaX * .9;
        currentY -= e.deltaY * .9;

        updateCanvas();

    },
    { passive:false }
);


/* =========================================
   PREVENT IMAGE DRAG
========================================= */

window.addEventListener(
    "dragstart",
    e => e.preventDefault()
);


/* =========================================
   LOAD FOLDERS
========================================= */

async function loadFolders() {

    const { data, error } =
        await supabaseClient
            .from(GATHER.table)
            .select("tags");

    if (error) {

        console.error(error);

        return;

    }

    let allTags = [];

    data.forEach(resource => {

        if (!resource.tags) return;

        allTags.push(

            ...resource.tags
                .split(",")
                .map(t => t.trim())
                .filter(Boolean)

        );

    });

    const uniqueTags =
        [...new Set(allTags)];

    generateFolders(uniqueTags);

}


/* =========================================
   GENERATE
========================================= */

function generateFolders(tags) {

    canvas.innerHTML = "";

    tags.forEach((tag,index)=>{

        const folder =
            document.createElement("div");

        folder.className =
            "folder";

        const columns = 6;

        const spacingX = 260;
        const spacingY = 220;

        const x =
            150 +
            (index % columns) * spacingX +
            (Math.random()*120-60);

        const y =
            250 +
            Math.floor(index/columns)*spacingY +
            (Math.random()*140-70);

        folder.style.left =
            `${x}px`;

        folder.style.top =
            `${y}px`;

        const img =
            document.createElement("img");

        img.src =
            "./assets/folder.png";

        img.className =
            "folder-img";

        const name =
            document.createElement("div");

        name.className =
            "folder-name";

        name.textContent =
            tag;

        folder.appendChild(img);
        folder.appendChild(name);

        folder.addEventListener(
            "click",
            ()=>{

                document.body.classList.add("page-exit");

                setTimeout(()=>{

                    window.location.href =
    `dashboard-folder.html?tag=${encodeURIComponent(tag)}`;

                },300);

            }
        );

        canvas.appendChild(folder);

    });

}

/* =========================================
   ADD RESOURCE MODAL
========================================= */

const addButton      = document.getElementById("openModalBtn");
const modal           = document.getElementById("modalOverlay");
const closeModalBtn   = document.getElementById("closeModalBtn");
const form            = document.getElementById("resourceForm");
const pdfInput        = document.getElementById("pdfFile");
const fileNameText    = document.getElementById("fileName");
const removeFileBtn   = document.getElementById("removeFileBtn");

/* OPEN */
addButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

/* CLOSE */
closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    form.reset();
    fileNameText.textContent = "";
    removeFileBtn.classList.add("hidden");
});

/* SHOW SELECTED FILE NAME */
pdfInput.addEventListener("change", () => {
    const file = pdfInput.files[0];
    if (file) {
        fileNameText.textContent = file.name;
        removeFileBtn.classList.remove("hidden");
    } else {
        fileNameText.textContent = "";
        removeFileBtn.classList.add("hidden");
    }
});

/* REMOVE SELECTED FILE */
removeFileBtn.addEventListener("click", () => {
    pdfInput.value = "";
    fileNameText.textContent = "";
    removeFileBtn.classList.add("hidden");
});

/* =========================================
   SAVE RESOURCE
========================================= */

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title         = document.getElementById("title").value;
    const urlInput       = document.getElementById("url").value;
    const resourceType   = document.getElementById("resourceType").value;
    const intent         = document.getElementById("intent").value;
    const dateOfCreation = document.getElementById("dateOfCreation").value;
    const tags           = document.getElementById("tags").value;

    let finalURL = urlInput;

    /* PDF UPLOAD (optional) */
    const file = pdfInput.files[0];
    if (file) {

        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabaseClient.storage
            .from(GATHER.pdfBucket || "PDFs")
            .upload(fileName, file);

        if (uploadError) {
            console.error("PDF UPLOAD ERROR:", uploadError);
            alert("PDF upload failed: " + uploadError.message);
            return;
        }

        const { data: publicURLData } = supabaseClient.storage
            .from(GATHER.pdfBucket || "PDFs")
            .getPublicUrl(fileName);

        finalURL = publicURLData.publicUrl;
    }

    /* SAVE TO DATABASE */
    const { error } = await supabaseClient
        .from(GATHER.table)
        .insert([{
            title: title,
            resource_type: resourceType,
            intent: intent,
            date_of_creation: dateOfCreation || null,
            url: finalURL,
            tags: tags
        }]);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        alert(error.message);
        return;
    }

    alert("Resource added successfully");

    form.reset();
    fileNameText.textContent = "";
    removeFileBtn.classList.add("hidden");
    modal.classList.add("hidden");

    /* REFRESH FOLDERS */
    loadFolders();

});


/* =========================================
   START
========================================= */

loadFolders();
console.log("[Gather] folder.js loaded");

/* =========================================
   PAGE LOAD
========================================= */

window.addEventListener("DOMContentLoaded", () => {

    document.body.classList.add("page-loaded");

});


/* =========================================
   GET CURRENT TAG
========================================= */

const params =
    new URLSearchParams(window.location.search);

const currentTag =
    params.get("tag") || "";


/* =========================================
   PAGE TITLE
========================================= */

window.addEventListener("DOMContentLoaded", () => {

    const title =
        document.getElementById("folderTitle");

    if (!title) return;

    title.textContent =
        currentTag
            .split(" ")
            .map(word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
            )
            .join(" ");

});


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString)
        return "";

    const date =
        new Date(dateString);

    const day =
        date.getDate();

    const month =
        date.toLocaleString(
            "en-GB",
            {
                month: "long"
            }
        );

    const year =
        date.getFullYear();

    if (day === 1) {

        return `${month} ${year}`;

    }

    function ordinal(n) {

        if (n > 3 && n < 21)
            return "th";

        switch (n % 10) {

            case 1:
                return "st";

            case 2:
                return "nd";

            case 3:
                return "rd";

            default:
                return "th";

        }

    }

    return `${day}${ordinal(day)} ${month} ${year}`;

}


/* =========================================
   CREATE CARD
========================================= */

function createCard(resource) {

    const card =
        document.createElement("div");

    card.className =
        "resource-card";

    if (resource.url) {

        card.style.cursor =
            "pointer";

        card.addEventListener(
            "click",
            () => {

                window.open(
                    resource.url,
                    "_blank"
                );

            }
        );

    }

    /* IMAGE */

    const imageDiv =
        document.createElement("div");

    imageDiv.className =
        "resource-image";

    const image =
        resource.screenshot ||
        resource.image_url;

    if (image) {

        const img =
            document.createElement("img");

        img.src =
            image;

        img.loading =
            "lazy";

        img.onerror =
            () =>
            imageDiv.classList.add("hidden");

        imageDiv.appendChild(img);

    } else {

        imageDiv.classList.add("hidden");

    }

    /* TYPE */

    const label =
        document.createElement("p");

    label.className =
        "resource-label";

    label.textContent =
        resource.resource_type ||
        "Resource";

    /* DATE */

    const published =
        document.createElement("p");

    published.className =
        "published-date";

    if (resource.date_of_creation) {

        published.textContent =
            `Published on: ${formatDate(resource.date_of_creation)}`;

    } else {

        published.innerHTML =
            "&nbsp;";

    }

    /* TITLE */

    const title =
        document.createElement("h2");

    title.className =
        "resource-title";

    title.textContent =
        resource.title ||
        "Untitled";

    /* INTENT */

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "intent-wrapper";

    const intentLabel =
        document.createElement("p");

    intentLabel.className =
        "intent-label";

    intentLabel.textContent =
        "Why I saved this resource";

    const intent =
        document.createElement("p");

    intent.className =
        "intent-text";

    intent.textContent =
        resource.intent || "";

    wrapper.appendChild(intentLabel);
    wrapper.appendChild(intent);

    /* TAGS */

    const tags =
        document.createElement("div");

    tags.className =
        "tags-container";

    if (resource.tags) {

        resource.tags
            .split(",")

            .map(tag => tag.trim())

            .filter(Boolean)

            .forEach(tag => {

                const pill =
                    document.createElement("span");

                pill.className =
                    "tag-pill";

                pill.textContent =
                    tag;

                tags.appendChild(pill);

            });

    }

    card.appendChild(imageDiv);
    card.appendChild(label);
    card.appendChild(published);
    card.appendChild(title);
    card.appendChild(wrapper);
    card.appendChild(tags);

    return card;

}


/* =========================================
   LOAD RESOURCES
========================================= */

async function loadResources() {

    const container =
        document.getElementById(
            "resourcesContainer"
        );

    if (!container)
        return;

    container.innerHTML =
        '<p class="state-msg">Loading...</p>';

    const {
        data,
        error
    } =
    await supabaseClient
        .from(GATHER.table)
        .select("*");

    if (error) {

        console.error(error);

        container.innerHTML =
            '<p class="state-msg">Could not load resources.</p>';

        return;

    }

    const resources =
        data.filter(resource => {

            if (!resource.tags)
                return false;

            return resource.tags
                .toLowerCase()
                .includes(currentTag.toLowerCase());

        });

    container.innerHTML = "";

    if (!resources.length) {

        container.innerHTML =
            '<p class="state-msg">No resources found.</p>';

        return;

    }

    for (let i = 0; i < resources.length; i += 4) {

        const shelfRow =
            document.createElement("div");

        shelfRow.className =
            "shelf-row";

        const grid =
            document.createElement("div");

        grid.className =
            "resources-grid";

        resources
            .slice(i, i + 4)
            .forEach(resource => {

                grid.appendChild(
                    createCard(resource)
                );

            });

        const shelf =
            document.createElement("img");

        shelf.className =
            "shelf-plank";

        shelf.src =
            "./assets/shelf.png";

        shelf.draggable =
            false;

        shelfRow.appendChild(grid);
        shelfRow.appendChild(shelf);

        container.appendChild(shelfRow);

    }

}


/* =========================================
   COLLECTIONS BUTTON
========================================= */

const collections =
    document.querySelector(
        ".collections-button"
    );

if (collections) {

    collections.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            document.body.classList.add(
                "page-exit"
            );

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 300);

        }
    );

}


/* =========================================
   START
========================================= */

loadResources();
/* =========================================
   GATHER CONFIG
========================================= */

const GATHER = {

    /* DATABASE */

    table: "Resources",

    pdfBucket: "PDFs",


    /* RESOURCE TYPES */

    resourceTypes: [

        "Article",
        "Blog",
        "Publication",
        "Research paper",
        "Report",
        "Book",
        "Case study",
        "Portfolio",
        "Organisation",
        "Community",
        "Conference",
        "Framework",
        "Toolkit",
        "Repository",
        "Video",
        "Podcast"

    ],


    /* INTENTS */

    intents: [

        "Inspiration",
        "Consumption",
        "Application",
        "Career / Practice"

    ],


    /* UI TEXT */

    publishedPrefix:
        "Published on:",

    intentHeading:
        "Why I saved this resource",

    defaultType:
        "Resource",

    untitled:
        "Untitled"

};
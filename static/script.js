// ============================================================
// VYAPAARVOICE - VOICE INVENTORY MANAGEMENT
// ============================================================

// ------------------------------------------------------------
// HTML ELEMENTS
// ------------------------------------------------------------

const voiceButton = document.getElementById("voiceButton");
const voiceResult = document.getElementById("voiceResult");
const languageSelect = document.getElementById("languageSelect");


// ------------------------------------------------------------
// SPEECH RECOGNITION
// ------------------------------------------------------------

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (!SpeechRecognition) {

    if (voiceButton) {
        voiceButton.innerText = "❌ Voice Not Supported";
        voiceButton.disabled = true;
    }

    if (voiceResult) {
        voiceResult.innerText =
            "Your browser does not support voice recognition.";
    }

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;


    // --------------------------------------------------------
    // SPEAKING BUTTON
    // --------------------------------------------------------

    if (voiceButton) {

        voiceButton.addEventListener("click", function () {

            try {

                // Get selected language
                if (languageSelect) {
                    recognition.lang = languageSelect.value;
                } else {
                    recognition.lang = "en-IN";
                }

                console.log(
                    "Recognition language:",
                    recognition.lang
                );

                voiceResult.innerText =
                    "🎤 Listening... Speak now";

                voiceButton.innerText =
                    "🛑 Listening...";

                recognition.start();

            } catch (error) {

                console.log(error);

                voiceResult.innerText =
                    "❌ Microphone could not start. Please try again.";

                voiceButton.innerText =
                    "🎤 Speak";
            }
        });
    }


    // --------------------------------------------------------
    // WHEN VOICE IS RECEIVED
    // --------------------------------------------------------

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        console.log("Voice command:", text);

        voiceResult.innerText =
            "🗣️ You said: " + text;

        processVoiceCommand(text);
    };


    // --------------------------------------------------------
    // VOICE ERROR
    // --------------------------------------------------------

    recognition.onerror = function (event) {

        console.log("Speech error:", event.error);

        if (event.error === "not-allowed") {

            voiceResult.innerText =
                "❌ Microphone permission denied. Please allow microphone access.";

        } else if (event.error === "no-speech") {

            voiceResult.innerText =
                "❌ No speech detected. Please try again.";

        } else {

            voiceResult.innerText =
                "❌ Voice error: " + event.error;
        }

        if (voiceButton) {
            voiceButton.innerText = "🎤 Speak";
        }
    };


    // --------------------------------------------------------
    // VOICE ENDED
    // --------------------------------------------------------

    recognition.onend = function () {

        if (voiceButton) {
            voiceButton.innerText = "🎤 Speak";
        }

        console.log("Voice recognition ended");
    };
}


// ============================================================
// NUMBER WORD CONVERSION
// ============================================================

function convertNumberWords(text) {

    const numbers = {

        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,

        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,

        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90,

        hundred: 100
    };

    const words =
        text.toLowerCase().split(/\s+/);

    return words.map(function (word) {

        if (numbers[word] !== undefined) {
            return numbers[word];
        }

        return word;

    }).join(" ");
}


// ============================================================
// UNIT NORMALIZATION
// ============================================================

function normalizeUnits(text) {

    return text

        .replace(/\bkgs?\b/gi, "kg")

        .replace(/\bkilograms?\b/gi, "kg")

        .replace(/\bltrs?\b/gi, "litres")

        .replace(/\bliters?\b/gi, "litres")

        .replace(/\blitres?\b/gi, "litres")

        .replace(/\bpcs?\b/gi, "pieces")

        .replace(/\bpieces?\b/gi, "pieces")

        .replace(/\bdozen\b/gi, "dozens")

        .replace(/\bbox(es)?\b/gi, "boxes")

        .replace(/\bcarton(s)?\b/gi, "cartons")

        .replace(/\bbag(s)?\b/gi, "bags")

        .replace(/\bunit(s)?\b/gi, "units");
}


// ============================================================
// MAIN VOICE COMMAND PROCESSOR
// ============================================================

function processVoiceCommand(originalText) {

    let command =
        originalText.toLowerCase().trim();

    command =
        convertNumberWords(command);

    command =
        normalizeUnits(command);

    console.log(
        "Processed command:",
        command
    );


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (
        command.includes("how many") ||
        command.includes("how much") ||
        command.includes("stock") ||
        command.includes("available") ||
        command.includes("availability") ||
        command.includes("have")
    ) {

        searchProduct(command, originalText);
        return;
    }


    // --------------------------------------------------------
    // DELETE / REMOVE
    // --------------------------------------------------------

    if (
        command.includes("remove") ||
        command.includes("delete") ||
        command.includes("take out")
    ) {

        deleteStock(command, originalText);
        return;
    }


    // --------------------------------------------------------
    // SELL
    // --------------------------------------------------------

    if (
        command.includes("sell") ||
        command.includes("sold") ||
        command.includes("sale") ||
        command.includes("cell")
    ) {

        sellStock(command, originalText);
        return;
    }


    // --------------------------------------------------------
    // ADD MORE STOCK
    // --------------------------------------------------------

    if (
        command.includes("add more") ||
        command.includes("more") ||
        command.includes("increase") ||
        command.includes("restock")
    ) {

        updateStock(command, originalText);
        return;
    }


    // --------------------------------------------------------
    // ADD NEW PRODUCT
    // --------------------------------------------------------

    addProduct(command, originalText);
}


// ============================================================
// SEARCH PRODUCT
// ============================================================

function searchProduct(command, originalText) {

    let product = command;

    product = product.replace(/\bhow\b/gi, "");
    product = product.replace(/\bmany\b/gi, "");
    product = product.replace(/\bmuch\b/gi, "");
    product = product.replace(/\bdo\b/gi, "");
    product = product.replace(/\bi\b/gi, "");
    product = product.replace(/\bhave\b/gi, "");
    product = product.replace(/\bis\b/gi, "");
    product = product.replace(/\bthe\b/gi, "");
    product = product.replace(/\bstock\b/gi, "");
    product = product.replace(/\bavailable\b/gi, "");
    product = product.replace(/\bavailability\b/gi, "");

    product = product
        .replace(/\s+/g, " ")
        .trim();

    if (!product) {

        voiceResult.innerText =
            "❌ Product name not detected.";

        return;
    }

    voiceResult.innerText =
        "🔎 Checking stock..." +
        "\n\n📦 Product: " +
        product;

    fetch("/voice-search", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            product: product
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            voiceResult.innerText =
                "📦 Product: " +
                data.product +
                "\n\n" +
                "🔢 Stock: " +
                data.quantity +
                " " +
                (data.unit || "pieces");

        } else {

            voiceResult.innerText =
                "❌ " +
                data.message;
        }

    })

    .catch(error => {

        console.log(error);

        voiceResult.innerText =
            "❌ Server error while checking stock.";
    });
}


// ============================================================
// ADD NEW PRODUCT
// ============================================================

function addProduct(command, originalText) {

    // IMPORTANT:
    // Convert number words again
    command = convertNumberWords(command);

    command = normalizeUnits(command);

    console.log(
        "ADD command:",
        command
    );


    // --------------------------------------------------------
    // DETECT QUANTITY
    // --------------------------------------------------------

    const quantityMatch =
        command.match(/\b(\d+)\b/);

    if (!quantityMatch) {

        voiceResult.innerText =
            "❌ Quantity not detected." +
            "\n\nYou said: " +
            originalText +
            "\n\nTry:" +
            "\nAdd 5 kg rice" +
            "\nAdd 10 notebooks";

        return;
    }


    const quantity =
        parseInt(quantityMatch[1]);


    // --------------------------------------------------------
    // GET PRODUCT NAME
    // --------------------------------------------------------

    let product = command;


    product = product.replace(
        /\badd\b/gi,
        ""
    );

    product = product.replace(
        /\bnew\b/gi,
        ""
    );


    // Remove quantity
    product = product.replace(
        new RegExp(
            "\\b" + quantity + "\\b",
            "i"
        ),
        ""
    );


    // --------------------------------------------------------
    // DETECT UNIT
    // --------------------------------------------------------

    let unit = "pieces";

    if (/\bkg\b/i.test(command)) {

        unit = "kg";

    } else if (/\bbags\b/i.test(command)) {

        unit = "bags";

    } else if (/\bcartons\b/i.test(command)) {

        unit = "cartons";

    } else if (/\bboxes\b/i.test(command)) {

        unit = "boxes";

    } else if (/\bdozens\b/i.test(command)) {

        unit = "dozens";

    } else if (/\blitres\b/i.test(command)) {

        unit = "litres";
    }


    // Remove units

    product = product.replace(/\bkg\b/gi, "");
    product = product.replace(/\bbags\b/gi, "");
    product = product.replace(/\bcartons\b/gi, "");
    product = product.replace(/\bboxes\b/gi, "");
    product = product.replace(/\bdozens\b/gi, "");
    product = product.replace(/\blitres\b/gi, "");
    product = product.replace(/\bpieces\b/gi, "");
    product = product.replace(/\bunits\b/gi, "");


    // --------------------------------------------------------
    // REMOVE PRICE
    // --------------------------------------------------------

    product = product.replace(
        /\bat\s+\d+(?:\.\d+)?/gi,
        ""
    );

    product = product.replace(
        /\bfor\s+\d+(?:\.\d+)?/gi,
        ""
    );

    product = product.replace(
        /\d+(?:\.\d+)?\s*rupees?/gi,
        ""
    );

    product = product.replace(
        /\brupees?/gi,
        ""
    );

    product = product.replace(
        /\beach\b/gi,
        ""
    );

    product = product.replace(
        /\bthe\b/gi,
        ""
    );


    product = product
        .replace(/\s+/g, " ")
        .trim();


    if (!product) {

        voiceResult.innerText =
            "❌ Product name not detected.";

        return;
    }


    // --------------------------------------------------------
    // DETECT PRICE
    // --------------------------------------------------------

    let price = 0;

    const priceMatch =
        command.match(
            /(?:at|for)\s+(\d+(?:\.\d+)?)/
        );

    if (priceMatch) {

        price =
            parseFloat(priceMatch[1]);
    }


    // --------------------------------------------------------
    // SHOW PROCESSING
    // --------------------------------------------------------

    voiceResult.innerText =
        "🔄 Adding product..." +
        "\n\n" +
        "📦 Product: " +
        product +
        "\n" +
        "🔢 Quantity: " +
        quantity +
        " " +
        unit +
        "\n" +
        "💰 Price: ₹" +
        price;


    // --------------------------------------------------------
    // SEND TO FLASK
    // --------------------------------------------------------

    fetch("/voice-add", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            product: product,

            quantity: quantity,

            price: price,

            unit: unit
        })

    })

    .then(response => response.json())

    .then(data => {

        console.log(
            "ADD response:",
            data
        );

        if (data.success) {

            voiceResult.innerText =
                "✅ Product added successfully!" +
                "\n\n" +
                "📦 " +
                data.product +
                "\n" +
                "🔢 Quantity: " +
                data.quantity +
                " " +
                (data.unit || unit);

            setTimeout(function () {

                location.reload();

            }, 1200);

        } else {

            voiceResult.innerText =
                "❌ " +
                data.message;
        }

    })

    .catch(error => {

        console.log(error);

        voiceResult.innerText =
            "❌ Server error while adding product.";
    });
}


// ============================================================
// UPDATE STOCK
// ============================================================

function updateStock(command, originalText) {

    command = convertNumberWords(command);
    command = normalizeUnits(command);

    const quantityMatch =
        command.match(/\b(\d+)\b/);

    if (!quantityMatch) {

        voiceResult.innerText =
            "❌ Quantity not detected.";

        return;
    }

    const quantity =
        parseInt(quantityMatch[1]);

    let product = command;

    product = product.replace(/\badd\b/gi, "");
    product = product.replace(/\bmore\b/gi, "");
    product = product.replace(/\bincrease\b/gi, "");
    product = product.replace(/\brestock\b/gi, "");

    product = product.replace(
        new RegExp(
            "\\b" + quantity + "\\b",
            "i"
        ),
        ""
    );

    product = product.replace(/\bkg\b/gi, "");
    product = product.replace(/\bbags?\b/gi, "");
    product = product.replace(/\bcartons?\b/gi, "");
    product = product.replace(/\bboxes?\b/gi, "");
    product = product.replace(/\bdozens?\b/gi, "");
    product = product.replace(/\blitres?\b/gi, "");
    product = product.replace(/\bpieces?\b/gi, "");
    product = product.replace(/\bunits?\b/gi, "");

    product = product
        .replace(/\s+/g, " ")
        .trim();

    if (!product) {

        voiceResult.innerText =
            "❌ Product name not detected.";

        return;
    }

    voiceResult.innerText =
        "🔄 Updating stock..." +
        "\n\n" +
        "📦 Product: " +
        product +
        "\n" +
        "➕ Adding: " +
        quantity;

    fetch("/voice-update", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            product: product,

            quantity: quantity
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            voiceResult.innerText =
                "✅ Stock updated!" +
                "\n\n" +
                "📦 " +
                data.product +
                "\n" +
                "📊 New stock: " +
                data.quantity;

            setTimeout(function () {

                location.reload();

            }, 1200);

        } else {

            voiceResult.innerText =
                "❌ " +
                data.message;
        }

    })

    .catch(error => {

        console.log(error);

        voiceResult.innerText =
            "❌ Server error while updating stock.";
    });
}


// ============================================================
// SELL STOCK
// ============================================================

function sellStock(command, originalText) {

    command = convertNumberWords(command);
    command = normalizeUnits(command);

    const quantityMatch =
        command.match(/\b(\d+)\b/);

    if (!quantityMatch) {

        voiceResult.innerText =
            "❌ Quantity not detected." +
            "\n\nYou said: " +
            originalText +
            "\n\nExample:" +
            "\nSell 2 kg rice";

        return;
    }

    const quantity =
        parseInt(quantityMatch[1]);

    let product = command;

    product = product.replace(/\bsell\b/gi, "");
    product = product.replace(/\bcell\b/gi, "");
    product = product.replace(/\bsold\b/gi, "");
    product = product.replace(/\bsale\b/gi, "");

    product = product.replace(
        new RegExp(
            "\\b" + quantity + "\\b",
            "i"
        ),
        ""
    );

    product = product.replace(/\bkg\b/gi, "");
    product = product.replace(/\bbags?\b/gi, "");
    product = product.replace(/\bcartons?\b/gi, "");
    product = product.replace(/\bboxes?\b/gi, "");
    product = product.replace(/\bdozens?\b/gi, "");
    product = product.replace(/\blitres?\b/gi, "");
    product = product.replace(/\bpieces?\b/gi, "");
    product = product.replace(/\bunits?\b/gi, "");

    product = product.replace(/\bthe\b/gi, "");
    product = product.replace(/\bof\b/gi, "");
    product = product.replace(/\bitems?\b/gi, "");

    product = product
        .replace(/\s+/g, " ")
        .trim();

    if (!product) {

        voiceResult.innerText =
            "❌ Product name not detected." +
            "\n\nTry: Sell 2 notebooks";

        return;
    }

    let unit = "pieces";

    if (command.includes("kg")) {
        unit = "kg";
    } else if (command.includes("bags")) {
        unit = "bags";
    } else if (command.includes("cartons")) {
        unit = "cartons";
    } else if (command.includes("boxes")) {
        unit = "boxes";
    } else if (command.includes("dozens")) {
        unit = "dozens";
    } else if (command.includes("litres")) {
        unit = "litres";
    }

    voiceResult.innerText =
        "🔄 Processing sale..." +
        "\n\n" +
        "📦 Product: " +
        product +
        "\n" +
        "🔢 Quantity: " +
        quantity +
        " " +
        unit;

    fetch("/voice-sell", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            product: product,

            quantity: quantity,

            unit: unit
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            voiceResult.innerText =
                "✅ Sale completed!" +
                "\n\n" +
                "📦 Product: " +
                data.product +
                "\n" +
                "🔢 Sold: " +
                data.sold +
                "\n" +
                "💰 Total: ₹" +
                data.total +
                "\n" +
                "📊 Remaining: " +
                data.quantity +
                " " +
                (data.unit || unit);

            setTimeout(function () {

                location.reload();

            }, 1500);

        } else {

            voiceResult.innerText =
                "❌ " +
                data.message;
        }

    })

    .catch(error => {

        console.log(error);

        voiceResult.innerText =
            "❌ Server error while selling product.";
    });
}


// ============================================================
// REMOVE STOCK
// ============================================================

function deleteStock(command, originalText) {

    command = convertNumberWords(command);
    command = normalizeUnits(command);

    const quantityMatch =
        command.match(/\b(\d+)\b/);

    if (!quantityMatch) {

        voiceResult.innerText =
            "❌ Quantity not detected." +
            "\n\nYou said: " +
            originalText +
            "\n\nExample:" +
            "\nRemove 2 kg rice";

        return;
    }

    const quantity =
        parseInt(quantityMatch[1]);

    let product = command;

    product = product.replace(/\bremove\b/gi, "");
    product = product.replace(/\bdelete\b/gi, "");
    product = product.replace(/\btake out\b/gi, "");

    product = product.replace(
        new RegExp(
            "\\b" + quantity + "\\b",
            "i"
        ),
        ""
    );

    product = product.replace(/\bkg\b/gi, "");
    product = product.replace(/\bbags?\b/gi, "");
    product = product.replace(/\bcartons?\b/gi, "");
    product = product.replace(/\bboxes?\b/gi, "");
    product = product.replace(/\bdozens?\b/gi, "");
    product = product.replace(/\blitres?\b/gi, "");
    product = product.replace(/\bpieces?\b/gi, "");
    product = product.replace(/\bunits?\b/gi, "");

    product = product.replace(/\bthe\b/gi, "");
    product = product.replace(/\bof\b/gi, "");

    product = product
        .replace(/\s+/g, " ")
        .trim();

    if (!product) {

        voiceResult.innerText =
            "❌ Product name not detected." +
            "\n\nTry: Remove 2 notebooks";

        return;
    }

    let unit = "pieces";

    if (command.includes("kg")) {
        unit = "kg";
    } else if (command.includes("bags")) {
        unit = "bags";
    } else if (command.includes("cartons")) {
        unit = "cartons";
    } else if (command.includes("boxes")) {
        unit = "boxes";
    } else if (command.includes("dozens")) {
        unit = "dozens";
    } else if (command.includes("litres")) {
        unit = "litres";
    }

    voiceResult.innerText =
        "🔄 Removing stock..." +
        "\n\n" +
        "📦 Product: " +
        product +
        "\n" +
        "🔢 Quantity: " +
        quantity +
        " " +
        unit;

    fetch("/voice-delete", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            product: product,

            quantity: quantity,

            unit: unit
        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            voiceResult.innerText =
                "✅ Stock removed!" +
                "\n\n" +
                "📦 Product: " +
                data.product +
                "\n" +
                "➖ Removed: " +
                data.deleted +
                "\n" +
                "📊 Remaining: " +
                data.quantity;

            setTimeout(function () {

                location.reload();

            }, 1500);

        } else {

            voiceResult.innerText =
                "❌ " +
                data.message;
        }

    })

    .catch(error => {

        console.log(error);

        voiceResult.innerText =
            "❌ Server error while removing stock.";
    });
}
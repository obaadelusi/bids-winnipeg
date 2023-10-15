/********************
    
    Name: Obafunsho Adelusi
    Date: October 14, 2023
    Description: Open API 

*********************/

/******************************
    function:     debugMessage
    description:  used for testing
************************************/
function debugMessage(message) {
    console.log(message);
}

/**
 * Gets JSON data from api.
 * @param {string} apiUrl The api url
 * @returns Data from the api.
 */
async function fetchData(apiUrl) {
    debugMessage("***async function fetchData");

    if (apiUrl.length == 0) {
        debugMessage("Enter a valid api url");
    }

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        return data;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Returns where string.
 * @returns WHERE query string.
 */
function getWhere() {
    debugMessage("***function getWhere");

    const openStatus = document.getElementById("chkStatusOpen").value,
        closedStatus = document.getElementById("chkStatusClosed").value;

    let whereClause = `$where=(lower(status) LIKE lower('%${openStatus}%') OR lower(status) LIKE lower('%${closedStatus}%')) `;

    const year = document.getElementById("inputYear").value.trim();
    debugMessage(`year = ${year}`);
    if (!(year == null || year.length == 0 || isNaN(year))) {
        whereClause += `AND year=${year} `;
    }

    const description = document.getElementById("inputDescription").value.trim();
    debugMessage(`description = ${description}`);
    if (!(description == null || description.length == 0)) {
        whereClause += `AND lower(description) LIKE lower('%${description}%') `;
    }

    const bidNumber = document.getElementById("inputBidNumber").value;
    debugMessage(`bidNumber = ${bidNumber}`);
    if (!(bidNumber == null || bidNumber.length == 0)) {
        whereClause += `AND lower(bid_opportunity_number)=lower('${bidNumber}') `;
    }

    const officerName = document.getElementById("inputOfficerName").value;
    debugMessage(`officerName = ${officerName}`);
    if (!(officerName == null || officerName.length == 0)) {
        whereClause += `AND lower(contract_officer) LIKE lower('%${officerName}%') `;
    }

    const transactionType = document.getElementById("inputTransactionType").value;
    debugMessage(`transactionType = ${transactionType}`);
    if (!(transactionType == null || transactionType.length == 0)) {
        whereClause += `AND lower(transaction_type) LIKE lower('%${transactionType}%') `;
    }

    const taCetaEl = document.getElementById("chkTaCeta");
    if (!taCetaEl.checked) {
        whereClause += `AND lower(trade_agreement_ceta) LIKE lower('%${taCetaEl.value}%')`;
    }

    const taCftaEl = document.getElementById("chkTaCfta");
    if (!taCftaEl.checked) {
        whereClause += `AND lower(trade_agreement_cfta) LIKE lower('%${taCftaEl.value}%')`;
    }

    const taNwptaEl = document.getElementById("chkTaNwpta");
    if (!taNwptaEl.checked) {
        whereClause += `AND lower(trade_agreement_nwpta) LIKE lower('%${taNwptaEl.value}%')`;
    }

    debugMessage(`whereClause = ${whereClause}`);

    return whereClause;
}

/**
 * Returns order by string.
 * @returns ORDER BY query string.
 */
function getOrderBy() {
    debugMessage("***function getOrderBy");

    let orderByVal = document.getElementById("orderBy").value;
    debugMessage(`orderByVal = ${orderByVal}`);

    let orderBy = "";

    if (orderByVal.includes("year")) {
        orderBy += "year";
    }
    if (orderByVal.includes("status")) {
        orderBy += "status";
    }
    if (orderByVal.includes("Asc")) {
        orderBy += " ASC";
    }
    if (orderByVal.includes("Desc")) {
        orderBy += " DESC";
    }
    return `$order=${orderBy}`;
}

/**
 * Composes url for the json website.
 * @returns Api url
 */
function getURL() {
    debugMessage("**function getURL");

    const limit = `$limit=${document.getElementById("inputLimit").value}`;

    debugMessage(`limit = ${limit}`);

    const url = `https://data.winnipeg.ca/resource/rijt-92n4.json?${getWhere()}&${getOrderBy()}&${limit}`;

    debugMessage(`url = ${url}`);

    return url;
}

/**
 * Displays the specified data on the HTML page.
 * @param {Array.<Object>} data The specified data.
 */
function displayResults(data) {
    debugMessage("***function displayResult");

    const tbody = document.getElementById("output");
    tbody.innerHTML = "";

    if (data.length == 0) {
        document.getElementById("table-caption").innerText = "❌ Nothing was found.";
    } else {
        document.getElementById("numberOfResults").innerHTML = `Displaying top ${data.length} results`;
        document.getElementById("table-caption").innerText = "Bid opportunities search results";
    }

    for (let i = 0; i < data.length; i++) {
        let row = tbody.insertRow(tbody.rows.length);
        let bid = data[i];
        row.insertCell(0).innerHTML = i + 1;
        row.insertCell(1).innerHTML = `<b class="text-light-emphasis">${bid.bid_opportunity_number}</b>`;
        row.insertCell(2).innerHTML = `<span class="${bid.status.toLowerCase() == "open" && "badge bg-success"}">${bid.status}`;
        row.insertCell(3).innerHTML = `${bid.description}. <button class='btn btn-link btn-sm' data-bs-toggle="modal" data-bs-target="#bidModal" onclick="setModalContent('${bid.bid_opportunity_number}')" id="modalButton-${bid.bid_opportunity_number}">More info</button>`;
        row.insertCell(4).innerHTML = bid.year;
        row.insertCell(5).innerHTML = bid.contract_officer || "<i>none</i>";
        row.insertCell(6).innerHTML = new Date(bid.submission_deadline).toDateString();
    }
}

let bidDataGlobal;

function setModalContent(bidNum) {
    const bidListGroup = document.getElementById("bidListGroup");
    bidListGroup.innerHTML = "";

    bidDataGlobal.forEach((bid) => {
        if (bid.bid_opportunity_number == bidNum) {
            const bidModalLabel = document.getElementById("bidModalLabel");
            if (bid.status.toLowerCase() == "open") {
                bidModalLabel.classList.add("text-success");
            } else {
                bidModalLabel.classList.remove("text-success");
            }
            bidModalLabel.innerHTML = `#${bid.bid_opportunity_number}`;

            document.getElementById("bidModalDescription").innerHTML = bid.description;

            const li1 = document.createElement("li");
            li1.classList.add("list-group-item");
            li1.innerHTML = `<span class="fw-bold">Status: </span> <span class="${bid.status.toLowerCase() == "open" && "badge bg-success"}">${bid.status}</span><br> Submission deadline: ${bid.submission_deadline ? new Date(bid.submission_deadline).toDateString() : "none"}`;

            const li2 = document.createElement("li");
            li2.classList.add("list-group-item");
            li2.innerHTML = `<span class="fw-bold">Documents: </span> <br> <a href="${bid.documents_url ? bid.documents_url.url : "#"}" target="_blank">Documents link</a>&nbsp; • &nbsp;<a href="${bid.merx_url ? bid.merx_url.url : ""}" target="_blank">${bid.merx_url ? "Merx Docs" : ""}</a>`;

            const li3 = document.createElement("li");
            li3.classList.add("list-group-item");
            li3.innerHTML = `<span class="fw-bold">Addendum count: </span> ${bid.addendum_count}<br> Last addendum comment: <i>${bid.latest_addendum_comment || "none"}</i><br> Last addendum issue date: <i>${bid.latest_addendum_issue_date ? new Date(bid.latest_addendum_issue_date).toDateString() : "none"}</i>`;

            const li4 = document.createElement("li");
            li4.classList.add("list-group-item");
            li4.innerHTML = `<span class="fw-bold">Contract officer: </span> ${bid.contract_officer || "<i>none</i>"} <br> Phone: ${bid.contract_officer_phone || "<i>none</i>"} <br> Email: ${bid.contract_officer_email || "<i>none</i>"}`;

            const li5 = document.createElement("li");
            li5.classList.add("list-group-item");
            li5.innerHTML = `<span class="fw-bold">Contract administrator: </span> ${bid.contract_administrator || "<i>none</i>"} <br> Phone: ${bid.contract_administrator_phone || "<i>none</i>"}`;

            const li6 = document.createElement("li");
            li6.classList.add("list-group-item");
            li6.innerHTML = `<span class="fw-bold">Trade agreements: </span> <br> <b data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Comprehensive Economic and Trade Agreement">CETA: </b>${bid.trade_agreement_ceta || "<i>none</i>"}&nbsp; / &nbsp;<b data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Canadian Free Trade Agreement">CFTA: </b>${bid.trade_agreement_cfta || "<i>none</i>"}&nbsp; / &nbsp;<b data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="New West Partnership Trade Agreement">NWPTA: </b>${bid.trade_agreement_nwpta || "<i>none</i>"}`;

            const li7 = document.createElement("li");
            li7.classList.add("list-group-item");
            li7.innerHTML = `<span class="fw-bold">Scope: </span> <br>  ${bid.scope || "<i>none</i>"}`;

            bidListGroup.append(li1, li2, li3, li4, li5, li6, li7);
        }

        // Enable tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
    });
}

/**
 * Initializes the application functions.
 */
function load() {
    // Submit button event setup
    const buttonSearchEl = document.getElementById("buttonSearch"),
        spinner = document.getElementById("spinner");

    buttonSearchEl.addEventListener("click", (e) => {
        e.preventDefault();
        const apiUrl = encodeURI(getURL());

        fetchData(apiUrl).then((data) => {
            console.log(data);
            spinner.classList.remove("invisible");
            setTimeout(() => {
                spinner.classList.add("invisible");
            }, 600);

            bidDataGlobal = data;
            displayResults(data);
        });
    });
}

document.addEventListener("DOMContentLoaded", load);

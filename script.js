"use strict";

let cards = [];

const searchInput = document.getElementById("searchInput");
const colorFilter = document.getElementById("colorFilter");
const typeFilter = document.getElementById("typeFilter");
const levelFilter = document.getElementById("levelFilter");
const cardList = document.getElementById("cardList");
const cardCount = document.getElementById("cardCount");

const cardModal = document.getElementById("cardModal");
const modalCloseButton = document.getElementById("modalCloseButton");
const modalCardImage = document.getElementById("modalCardImage");
const modalCardNumber = document.getElementById("modalCardNumber");
const modalCardName = document.getElementById("modalCardName");
const modalCardTags = document.getElementById("modalCardTags");
const modalPlayCost = document.getElementById("modalPlayCost");
const modalDp = document.getElementById("modalDp");
const modalForm = document.getElementById("modalForm");
const modalAttribute = document.getElementById("modalAttribute");
const modalRarity = document.getElementById("modalRarity");
const modalSet = document.getElementById("modalSet");
const modalDigivolutionCosts = document.getElementById(
    "modalDigivolutionCosts"
);
const modalTraits = document.getElementById("modalTraits");
const modalEffect = document.getElementById("modalEffect");
const modalInheritedEffect = document.getElementById(
    "modalInheritedEffect"
);
const modalSecurityEffect = document.getElementById(
    "modalSecurityEffect"
);

function showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
    });

    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
        console.error(`ページが見つかりません: ${pageId}`);
        return;
    }

    targetPage.classList.add("active");
}

async function loadCards() {
    try {
        const response = await fetch("./data/cards.json");

        if (!response.ok) {
            throw new Error(`カードデータの取得に失敗しました: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("cards.jsonの形式が正しくありません。");
        }

        cards = data;
        renderCards(cards);
    } catch (error) {
        console.error(error);

        cardList.innerHTML = `
            <p class="empty-message">
                カードデータを読み込めませんでした。<br>
                Live ServerまたはXAMPP経由で開いてください。
            </p>
        `;
    }
}

function renderCards(cardData) {
    cardCount.textContent = `${cardData.length}件`;

    if (cardData.length === 0) {
        cardList.innerHTML = `
            <p class="empty-message">
                条件に一致するカードがありません。
            </p>
        `;
        return;
    }

    cardList.innerHTML = cardData
        .map((card) => createCardHtml(card))
        .join("");
}

function createCardHtml(card) {
    const imageHtml = card.image
        ? `
            <img
                src="./images/cards/${escapeHtml(card.image)}"
                alt="${escapeHtml(card.name)}"
                loading="lazy"
                onerror="this.parentElement.innerHTML='<span class=&quot;card-placeholder&quot;>🃏</span>'"
            >
        `
        : `<span class="card-placeholder">🃏</span>`;

    const colorTags = Array.isArray(card.colors)
        ? card.colors
            .map((color) => `<span class="card-tag">${escapeHtml(color)}</span>`)
            .join("")
        : "";

    const levelText =
        card.level !== null && card.level !== undefined
            ? `Lv.${card.level}`
            : "レベルなし";

    const dpText =
        card.dp !== null && card.dp !== undefined
            ? `${card.dp.toLocaleString()} DP`
            : "DPなし";

    return `
            <article
                class="digimon-card"
                data-card-id="${escapeHtml(card.id)}"
                tabindex="0"
                role="button"
                aria-label="${escapeHtml(card.name)}の詳細を開く"
            >            
            <div class="card-image">
                ${imageHtml}
            </div>

            <div class="card-info">
                <p class="card-number">${escapeHtml(card.id)}</p>
                <h2 class="card-name">${escapeHtml(card.name)}</h2>

                <div class="card-tags">
                    ${colorTags}
                    <span class="card-tag">${escapeHtml(card.cardType)}</span>
                    <span class="card-tag">${levelText}</span>
                </div>

                <div class="card-stats">
                    <span>登場コスト：${card.playCost ?? "-"}</span>
                    <span>${dpText}</span>
                    <span>レアリティ：${escapeHtml(card.rarity || "-")}</span>
                    <span>収録：${escapeHtml(card.set || "-")}</span>
                </div>
            </div>
        </article>
    `;
}

function filterCards() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedColor = colorFilter.value;
    const selectedType = typeFilter.value;
    const selectedLevel = levelFilter.value;

    const filteredCards = cards.filter((card) => {
        const matchesKeyword =
            card.name.toLowerCase().includes(keyword) ||
            card.id.toLowerCase().includes(keyword);

        const matchesColor =
            selectedColor === "" ||
            (Array.isArray(card.colors) &&
                card.colors.includes(selectedColor));

        const matchesType =
            selectedType === "" ||
            card.cardType === selectedType;

        const matchesLevel =
            selectedLevel === "" ||
            String(card.level) === selectedLevel;

        return (
            matchesKeyword &&
            matchesColor &&
            matchesType &&
            matchesLevel
        );
    });

    renderCards(filteredCards);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", filterCards);
colorFilter.addEventListener("change", filterCards);
typeFilter.addEventListener("change", filterCards);
levelFilter.addEventListener("change", filterCards);

loadCards();

function openCardModal(cardId) {
    const card = cards.find((item) => item.id === cardId);

    if (!card) {
        console.error(`カードが見つかりません: ${cardId}`);
        return;
    }

    modalCardNumber.textContent = card.id || "-";
    modalCardName.textContent = card.name || "カード名なし";

    modalPlayCost.textContent = card.playCost ?? "-";

    modalDp.textContent =
        card.dp !== null && card.dp !== undefined
            ? `${Number(card.dp).toLocaleString()} DP`
            : "-";

    modalForm.textContent = card.form || "-";
    modalAttribute.textContent = card.attribute || "-";
    modalRarity.textContent = card.rarity || "-";
    modalSet.textContent = card.set || "-";

    modalTraits.textContent =
        Array.isArray(card.traits) && card.traits.length > 0
            ? card.traits.join(" / ")
            : "記載なし";

    modalEffect.textContent =
        card.effect && card.effect.trim() !== ""
            ? card.effect
            : "効果なし";

    modalInheritedEffect.textContent =
        card.inheritedEffect && card.inheritedEffect.trim() !== ""
            ? card.inheritedEffect
            : "進化元効果なし";

    modalSecurityEffect.textContent =
        card.securityEffect && card.securityEffect.trim() !== ""
            ? card.securityEffect
            : "セキュリティ効果なし";

    const colors = Array.isArray(card.colors) ? card.colors : [];

    const levelTag =
        card.level !== null && card.level !== undefined
            ? `<span class="card-tag">Lv.${escapeHtml(card.level)}</span>`
            : "";

    modalCardTags.innerHTML = `
        ${colors
            .map(
                (color) =>
                    `<span class="card-tag">${escapeHtml(color)}</span>`
            )
            .join("")}
        <span class="card-tag">${escapeHtml(card.cardType || "-")}</span>
        ${levelTag}
    `;

    if (card.image) {
        modalCardImage.innerHTML = `
            <img
                src="./images/cards/${escapeHtml(card.image)}"
                alt="${escapeHtml(card.name)}"
                onerror="this.parentElement.innerHTML='<span class=&quot;card-placeholder&quot;>🃏</span>'"
            >
        `;
    } else {
        modalCardImage.innerHTML =
            `<span class="card-placeholder">🃏</span>`;
    }

    const costs = Array.isArray(card.digivolutionCosts)
        ? card.digivolutionCosts
        : [];

    if (costs.length === 0) {
        modalDigivolutionCosts.innerHTML = "<p>進化条件なし</p>";
    } else {
        modalDigivolutionCosts.innerHTML = costs
            .map(
                (cost) => `
                    <span class="digivolution-cost">
                        ${escapeHtml(cost.color || "-")}
                        Lv.${escapeHtml(cost.level ?? "-")}
                        から
                        コスト${escapeHtml(cost.cost ?? "-")}
                    </span>
                `
            )
            .join("");
    }

    cardModal.classList.add("open");
    cardModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    modalCloseButton.focus();
}

function closeCardModal() {
    cardModal.classList.remove("open");
    cardModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

cardList.addEventListener("click", (event) => {
    const cardElement = event.target.closest(".digimon-card");

    if (!cardElement) {
        return;
    }

    openCardModal(cardElement.dataset.cardId);
});

cardList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const cardElement = event.target.closest(".digimon-card");

    if (!cardElement) {
        return;
    }

    event.preventDefault();
    openCardModal(cardElement.dataset.cardId);
});

modalCloseButton.addEventListener("click", closeCardModal);

document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeCardModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cardModal.classList.contains("open")) {
        closeCardModal();
    }
});
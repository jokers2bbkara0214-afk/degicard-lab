"use strict";

let cards = [];

const searchInput = document.getElementById("searchInput");
const colorFilter = document.getElementById("colorFilter");
const typeFilter = document.getElementById("typeFilter");
const levelFilter = document.getElementById("levelFilter");
const cardList = document.getElementById("cardList");
const cardCount = document.getElementById("cardCount");

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
        <article class="digimon-card">
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
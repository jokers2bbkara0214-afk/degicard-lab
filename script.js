"use strict";

const MAIN_DECK_LIMIT = 50;
const DEFAULT_CARD_LIMIT = 4;
const STORAGE_KEY = "digicardLabDeck";

let cards = [];
let deck = loadDeckFromStorage();
let activeModalCardId = null;
let toastTimer = null;

const searchInput = document.getElementById("searchInput");
const colorFilter = document.getElementById("colorFilter");
const typeFilter = document.getElementById("typeFilter");
const levelFilter = document.getElementById("levelFilter");
const cardList = document.getElementById("cardList");
const cardCount = document.getElementById("cardCount");

const deckList = document.getElementById("deckList");
const deckSearchInput = document.getElementById("deckSearchInput");
const deckSortSelect = document.getElementById("deckSortSelect");
const clearDeckButton = document.getElementById("clearDeckButton");

const deckTotalCount = document.getElementById("deckTotalCount");
const uniqueCardCount = document.getElementById("uniqueCardCount");
const digimonCount = document.getElementById("digimonCount");
const supportCount = document.getElementById("supportCount");
const deckProgressBar = document.getElementById("deckProgressBar");
const deckStatusMessage = document.getElementById("deckStatusMessage");

const sidebarDeckCount =
    document.getElementById("sidebarDeckCount");

const homeDeckCount =
    document.getElementById("homeDeckCount");

const homeDeckProgress =
    document.getElementById("homeDeckProgress");

const homeDeckMessage =
    document.getElementById("homeDeckMessage");

const toast = document.getElementById("toast");

const cardModal = document.getElementById("cardModal");
const modalCloseButton =
    document.getElementById("modalCloseButton");

const modalCardImage =
    document.getElementById("modalCardImage");

const modalCardNumber =
    document.getElementById("modalCardNumber");

const modalCardName =
    document.getElementById("modalCardName");

const modalCardTags =
    document.getElementById("modalCardTags");

const modalPlayCost =
    document.getElementById("modalPlayCost");

const modalDp =
    document.getElementById("modalDp");

const modalForm =
    document.getElementById("modalForm");

const modalAttribute =
    document.getElementById("modalAttribute");

const modalRarity =
    document.getElementById("modalRarity");

const modalSet =
    document.getElementById("modalSet");

const modalDigivolutionCosts =
    document.getElementById("modalDigivolutionCosts");

const modalTraits =
    document.getElementById("modalTraits");

const modalEffect =
    document.getElementById("modalEffect");

const modalInheritedEffect =
    document.getElementById("modalInheritedEffect");

const modalSecurityEffect =
    document.getElementById("modalSecurityEffect");

const modalAddButton =
    document.getElementById("modalAddButton");

const modalRemoveButton =
    document.getElementById("modalRemoveButton");

const modalDeckQuantity =
    document.getElementById("modalDeckQuantity");

/* ページ切り替え */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-button").forEach((button) => {
        button.classList.remove("active");
    });

    const targetPage = document.getElementById(pageId);

    const targetButton = document.querySelector(
        `.nav-button[data-page="${pageId}"]`
    );

    if (!targetPage) {
        console.error(`ページが見つかりません: ${pageId}`);
        return;
    }

    targetPage.classList.add("active");

    if (targetButton) {
        targetButton.classList.add("active");
    }

    if (pageId === "deck") {
        renderDeck();
    }
}

/* カード読込 */

async function loadCards() {
    try {
        const response = await fetch("./data/cards.json");

        if (!response.ok) {
            throw new Error(
                `カードデータ取得エラー: ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "cards.jsonの形式が正しくありません。"
            );
        }

        cards = data;

        removeUnknownCardsFromDeck();
        renderCards(cards);
        updateAllDeckDisplays();
    } catch (error) {
        console.error(error);

        cardList.innerHTML = `
            <p class="empty-message">
                カードデータを読み込めませんでした。<br>
                XAMPP経由で開いてください。
            </p>
        `;
    }
}

/* カード図鑑 */

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
    const imageHtml = createCardImageHtml(
        card,
        "card-placeholder"
    );

    const colorTags = Array.isArray(card.colors)
        ? card.colors
            .map(
                (color) =>
                    `<span class="card-tag">${escapeHtml(color)}</span>`
            )
            .join("")
        : "";

    const levelText = hasValue(card.level)
        ? `Lv.${card.level}`
        : "レベルなし";

    const dpText = hasValue(card.dp)
        ? `${Number(card.dp).toLocaleString()} DP`
        : "DPなし";

    const deckQuantity = getDeckQuantity(card.id);

    return `
        <article
            class="digimon-card"
            data-card-id="${escapeHtml(card.id)}"
            tabindex="0"
            role="button"
            aria-label="${escapeHtml(card.name)}の詳細を開く"
        >
            <button
                class="card-add-button"
                type="button"
                data-add-card="${escapeHtml(card.id)}"
                aria-label="${escapeHtml(card.name)}をデッキに追加"
            >
                ＋
            </button>

            ${
                deckQuantity > 0
                    ? `
                        <span class="card-deck-count">
                            ${deckQuantity}枚
                        </span>
                    `
                    : ""
            }

            <div class="card-image">
                ${imageHtml}
            </div>

            <div class="card-info">
                <p class="card-number">
                    ${escapeHtml(card.id)}
                </p>

                <h2 class="card-name">
                    ${escapeHtml(card.name)}
                </h2>

                <div class="card-tags">
                    ${colorTags}

                    <span class="card-tag">
                        ${escapeHtml(card.cardType)}
                    </span>

                    <span class="card-tag">
                        ${levelText}
                    </span>
                </div>

                <div class="card-stats">
                    <span>
                        登場コスト：${card.playCost ?? "-"}
                    </span>

                    <span>${dpText}</span>

                    <span>
                        レアリティ：${escapeHtml(card.rarity || "-")}
                    </span>

                    <span>
                        収録：${escapeHtml(card.set || "-")}
                    </span>
                </div>
            </div>
        </article>
    `;
}

function filterCards() {
    const keyword =
        searchInput.value.trim().toLowerCase();

    const selectedColor = colorFilter.value;
    const selectedType = typeFilter.value;
    const selectedLevel = levelFilter.value;

    const filteredCards = cards.filter((card) => {
        const name = String(card.name || "").toLowerCase();
        const id = String(card.id || "").toLowerCase();

        const matchesKeyword =
            name.includes(keyword) ||
            id.includes(keyword);

        const matchesColor =
            selectedColor === "" ||
            (
                Array.isArray(card.colors) &&
                card.colors.includes(selectedColor)
            );

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

/* デッキ操作 */

function addCardToDeck(cardId) {
    const card = findCard(cardId);

    if (!card) {
        showToast(
            "カードが見つかりませんでした。",
            true
        );
        return;
    }

    if (card.isDigiEgg || card.cardType === "デジタマ") {
        showToast(
            "デジタマデッキは次の段階で実装します。",
            true
        );
        return;
    }

    const total = getDeckTotal();

    if (total >= MAIN_DECK_LIMIT) {
        showToast(
            "メインデッキは50枚までです。",
            true
        );
        return;
    }

    const currentQuantity = getDeckQuantity(cardId);

    const cardLimit = Number(
        card.deckLimit ?? DEFAULT_CARD_LIMIT
    );

    if (currentQuantity >= cardLimit) {
        showToast(
            `${card.name}は${cardLimit}枚までです。`,
            true
        );
        return;
    }

    deck[cardId] = currentQuantity + 1;

    saveDeck();
    updateAllDeckDisplays();

    showToast(
        `${card.name}をデッキに追加しました。`
    );
}

function removeOneCardFromDeck(cardId) {
    const currentQuantity = getDeckQuantity(cardId);

    if (currentQuantity <= 0) {
        return;
    }

    if (currentQuantity === 1) {
        delete deck[cardId];
    } else {
        deck[cardId] = currentQuantity - 1;
    }

    saveDeck();
    updateAllDeckDisplays();
}

function removeCardCompletely(cardId) {
    const card = findCard(cardId);

    if (!deck[cardId]) {
        return;
    }

    delete deck[cardId];

    saveDeck();
    updateAllDeckDisplays();

    showToast(
        `${card?.name || "カード"}をデッキから削除しました。`
    );
}

function clearDeck() {
    if (getDeckTotal() === 0) {
        showToast("デッキはすでに空です。");
        return;
    }

    const confirmed = window.confirm(
        "デッキのカードをすべて削除しますか？"
    );

    if (!confirmed) {
        return;
    }

    deck = {};

    saveDeck();
    updateAllDeckDisplays();

    showToast("デッキを空にしました。");
}

/* デッキ表示 */

function renderDeck() {
    const keyword =
        deckSearchInput.value.trim().toLowerCase();

    const sortType = deckSortSelect.value;

    let deckCards = Object.entries(deck)
        .map(([cardId, quantity]) => {
            const card = findCard(cardId);

            if (!card) {
                return null;
            }

            return {
                card,
                quantity
            };
        })
        .filter(Boolean)
        .filter(({ card }) => {
            const name =
                String(card.name || "").toLowerCase();

            const id =
                String(card.id || "").toLowerCase();

            return (
                name.includes(keyword) ||
                id.includes(keyword)
            );
        });

    deckCards = sortDeckCards(deckCards, sortType);

    if (deckCards.length === 0) {
        deckList.innerHTML = `
            <p class="empty-message">
                ${
                    getDeckTotal() === 0
                        ? "まだカードが追加されていません。<br>カード図鑑から追加してみましょう。"
                        : "検索条件に一致するカードがありません。"
                }
            </p>
        `;
        return;
    }

    deckList.innerHTML = deckCards
        .map(({ card, quantity }) =>
            createDeckItemHtml(card, quantity)
        )
        .join("");
}

function createDeckItemHtml(card, quantity) {
    const imageHtml = createCardImageHtml(
        card,
        "card-placeholder"
    );

    const colors = Array.isArray(card.colors)
        ? card.colors.join(" / ")
        : "-";

    const levelText = hasValue(card.level)
        ? `Lv.${card.level}`
        : "レベルなし";

    return `
        <article class="deck-item">
            <div class="deck-item-image">
                ${imageHtml}
            </div>

            <div class="deck-item-info">
                <p>${escapeHtml(card.id)}</p>

                <h3>${escapeHtml(card.name)}</h3>

                <p>
                    ${escapeHtml(colors)}
                    ・
                    ${escapeHtml(card.cardType)}
                    ・
                    ${levelText}
                </p>
            </div>

            <div class="deck-item-tags">
                <span class="card-tag">
                    登場コスト ${card.playCost ?? "-"}
                </span>

                <span class="card-tag">
                    ${
                        hasValue(card.dp)
                            ? `${Number(card.dp).toLocaleString()} DP`
                            : "DPなし"
                    }
                </span>

                <span class="card-tag">
                    上限 ${card.deckLimit ?? DEFAULT_CARD_LIMIT}枚
                </span>
            </div>

            <div class="quantity-control">

                <button
                    class="quantity-button"
                    type="button"
                    data-decrease-card="${escapeHtml(card.id)}"
                    aria-label="${escapeHtml(card.name)}を1枚減らす"
                >
                    −
                </button>

                <strong>${quantity}枚</strong>

                <button
                    class="quantity-button"
                    type="button"
                    data-increase-card="${escapeHtml(card.id)}"
                    aria-label="${escapeHtml(card.name)}を1枚増やす"
                >
                    ＋
                </button>

                <button
                    class="remove-card-button"
                    type="button"
                    data-remove-card="${escapeHtml(card.id)}"
                >
                    削除
                </button>

            </div>
        </article>
    `;
}

function sortDeckCards(deckCards, sortType) {
    return [...deckCards].sort((a, b) => {
        if (sortType === "name") {
            return a.card.name.localeCompare(
                b.card.name,
                "ja"
            );
        }

        if (sortType === "count") {
            return (
                b.quantity - a.quantity ||
                a.card.name.localeCompare(
                    b.card.name,
                    "ja"
                )
            );
        }

        if (sortType === "number") {
            return a.card.id.localeCompare(
                b.card.id
            );
        }

        const levelA = hasValue(a.card.level)
            ? Number(a.card.level)
            : 99;

        const levelB = hasValue(b.card.level)
            ? Number(b.card.level)
            : 99;

        return (
            levelA - levelB ||
            a.card.name.localeCompare(
                b.card.name,
                "ja"
            )
        );
    });
}

/* デッキ集計 */

function updateAllDeckDisplays() {
    const total = getDeckTotal();

    const percentage = Math.min(
        (total / MAIN_DECK_LIMIT) * 100,
        100
    );

    const uniqueCount =
        Object.keys(deck).length;

    const digimonTotal =
        getDeckTypeCount("デジモン");

    const supportTotal =
        total - digimonTotal;

    sidebarDeckCount.textContent = total;

    homeDeckCount.textContent =
        `${total} / ${MAIN_DECK_LIMIT}`;

    deckTotalCount.textContent =
        `${total} / ${MAIN_DECK_LIMIT}`;

    homeDeckProgress.style.width =
        `${percentage}%`;

    deckProgressBar.style.width =
        `${percentage}%`;

    uniqueCardCount.textContent =
        `${uniqueCount}種類`;

    digimonCount.textContent =
        `${digimonTotal}枚`;

    supportCount.textContent =
        `${supportTotal}枚`;

    if (total === 0) {
        homeDeckMessage.textContent =
            "カードを追加してみましょう";

        deckStatusMessage.textContent =
            "あと50枚追加できます";
    } else if (total < MAIN_DECK_LIMIT) {
        const remaining =
            MAIN_DECK_LIMIT - total;

        homeDeckMessage.textContent =
            `あと${remaining}枚で完成`;

        deckStatusMessage.textContent =
            `あと${remaining}枚追加できます`;
    } else {
        homeDeckMessage.textContent =
            "50枚のデッキが完成しました";

        deckStatusMessage.textContent =
            "メインデッキが完成しました";
    }

    filterCards();
    renderDeck();
    updateModalDeckQuantity();
}

function getDeckTotal() {
    return Object.values(deck).reduce(
        (total, quantity) =>
            total + Number(quantity),
        0
    );
}

function getDeckQuantity(cardId) {
    return Number(deck[cardId] || 0);
}

function getDeckTypeCount(cardType) {
    return Object.entries(deck).reduce(
        (total, [cardId, quantity]) => {
            const card = findCard(cardId);

            if (card?.cardType === cardType) {
                return total + Number(quantity);
            }

            return total;
        },
        0
    );
}

/* モーダル */

function openCardModal(cardId) {
    const card = findCard(cardId);

    if (!card) {
        console.error(
            `カードが見つかりません: ${cardId}`
        );
        return;
    }

    activeModalCardId = cardId;

    modalCardNumber.textContent =
        card.id || "-";

    modalCardName.textContent =
        card.name || "カード名なし";

    modalPlayCost.textContent =
        card.playCost ?? "-";

    modalDp.textContent = hasValue(card.dp)
        ? `${Number(card.dp).toLocaleString()} DP`
        : "-";

    modalForm.textContent =
        card.form || "-";

    modalAttribute.textContent =
        card.attribute || "-";

    modalRarity.textContent =
        card.rarity || "-";

    modalSet.textContent =
        card.set || "-";

    modalTraits.textContent =
        Array.isArray(card.traits) &&
        card.traits.length > 0
            ? card.traits.join(" / ")
            : "記載なし";

    modalEffect.textContent =
        card.effect?.trim()
            ? card.effect
            : "効果なし";

    modalInheritedEffect.textContent =
        card.inheritedEffect?.trim()
            ? card.inheritedEffect
            : "進化元効果なし";

    modalSecurityEffect.textContent =
        card.securityEffect?.trim()
            ? card.securityEffect
            : "セキュリティ効果なし";

    const colors =
        Array.isArray(card.colors)
            ? card.colors
            : [];

    const levelTag = hasValue(card.level)
        ? `
            <span class="card-tag">
                Lv.${escapeHtml(card.level)}
            </span>
        `
        : "";

    modalCardTags.innerHTML = `
        ${colors
            .map(
                (color) =>
                    `<span class="card-tag">${escapeHtml(color)}</span>`
            )
            .join("")}

        <span class="card-tag">
            ${escapeHtml(card.cardType || "-")}
        </span>

        ${levelTag}
    `;

    modalCardImage.innerHTML =
        createCardImageHtml(
            card,
            "card-placeholder"
        );

    const costs =
        Array.isArray(card.digivolutionCosts)
            ? card.digivolutionCosts
            : [];

    if (costs.length === 0) {
        modalDigivolutionCosts.innerHTML =
            "<p>進化条件なし</p>";
    } else {
        modalDigivolutionCosts.innerHTML =
            costs
                .map(
                    (cost) => `
                        <span class="digivolution-cost">
                            ${escapeHtml(cost.color || "-")}
                            Lv.${escapeHtml(cost.level ?? "-")}
                            から コスト${escapeHtml(cost.cost ?? "-")}
                        </span>
                    `
                )
                .join("");
    }

    updateModalDeckQuantity();

    cardModal.classList.add("open");
    cardModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    modalCloseButton.focus();
}

function closeCardModal() {
    cardModal.classList.remove("open");

    cardModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    activeModalCardId = null;
}

function updateModalDeckQuantity() {
    if (!activeModalCardId) {
        return;
    }

    const quantity =
        getDeckQuantity(activeModalCardId);

    modalDeckQuantity.textContent =
        `${quantity}枚`;

    modalRemoveButton.disabled =
        quantity <= 0;
}

/* 保存 */

function saveDeck() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(deck)
    );
}

function loadDeckFromStorage() {
    try {
        const savedDeck =
            localStorage.getItem(STORAGE_KEY);

        if (!savedDeck) {
            return {};
        }

        const parsedDeck =
            JSON.parse(savedDeck);

        if (
            !parsedDeck ||
            typeof parsedDeck !== "object" ||
            Array.isArray(parsedDeck)
        ) {
            return {};
        }

        return parsedDeck;
    } catch (error) {
        console.error(
            "デッキ保存データの読込に失敗しました。",
            error
        );

        return {};
    }
}

function removeUnknownCardsFromDeck() {
    Object.keys(deck).forEach((cardId) => {
        if (!findCard(cardId)) {
            delete deck[cardId];
        }
    });

    saveDeck();
}

/* 共通 */

function findCard(cardId) {
    return cards.find(
        (card) => card.id === cardId
    );
}

function createCardImageHtml(
    card,
    placeholderClass
) {
    if (!card.image) {
        return `
            <span class="${placeholderClass}">
                🃏
            </span>
        `;
    }

    return `
        <img
            src="./images/cards/${escapeHtml(card.image)}"
            alt="${escapeHtml(card.name)}"
            loading="lazy"
            onerror="
                this.parentElement.innerHTML =
                '<span class=&quot;${placeholderClass}&quot;>🃏</span>'
            "
        >
    `;
}

function hasValue(value) {
    return (
        value !== null &&
        value !== undefined &&
        value !== ""
    );
}

function showToast(message, isError = false) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.toggle(
        "error",
        isError
    );

    toast.classList.add("show");

    toastTimer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* イベント */

searchInput.addEventListener(
    "input",
    filterCards
);

colorFilter.addEventListener(
    "change",
    filterCards
);

typeFilter.addEventListener(
    "change",
    filterCards
);

levelFilter.addEventListener(
    "change",
    filterCards
);

deckSearchInput.addEventListener(
    "input",
    renderDeck
);

deckSortSelect.addEventListener(
    "change",
    renderDeck
);

clearDeckButton.addEventListener(
    "click",
    clearDeck
);

cardList.addEventListener(
    "click",
    (event) => {
        const addButton =
            event.target.closest(
                "[data-add-card]"
            );

        if (addButton) {
            event.stopPropagation();

            addCardToDeck(
                addButton.dataset.addCard
            );

            return;
        }

        const cardElement =
            event.target.closest(
                ".digimon-card"
            );

        if (!cardElement) {
            return;
        }

        openCardModal(
            cardElement.dataset.cardId
        );
    }
);

cardList.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        const cardElement =
            event.target.closest(
                ".digimon-card"
            );

        if (!cardElement) {
            return;
        }

        event.preventDefault();

        openCardModal(
            cardElement.dataset.cardId
        );
    }
);

deckList.addEventListener(
    "click",
    (event) => {
        const increaseButton =
            event.target.closest(
                "[data-increase-card]"
            );

        if (increaseButton) {
            addCardToDeck(
                increaseButton.dataset.increaseCard
            );

            return;
        }

        const decreaseButton =
            event.target.closest(
                "[data-decrease-card]"
            );

        if (decreaseButton) {
            removeOneCardFromDeck(
                decreaseButton.dataset.decreaseCard
            );

            return;
        }

        const removeButton =
            event.target.closest(
                "[data-remove-card]"
            );

        if (removeButton) {
            removeCardCompletely(
                removeButton.dataset.removeCard
            );
        }
    }
);

modalAddButton.addEventListener(
    "click",
    () => {
        if (activeModalCardId) {
            addCardToDeck(
                activeModalCardId
            );
        }
    }
);

modalRemoveButton.addEventListener(
    "click",
    () => {
        if (activeModalCardId) {
            removeOneCardFromDeck(
                activeModalCardId
            );
        }
    }
);

modalCloseButton.addEventListener(
    "click",
    closeCardModal
);

document
    .querySelectorAll("[data-close-modal]")
    .forEach((element) => {
        element.addEventListener(
            "click",
            closeCardModal
        );
    });

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            cardModal.classList.contains("open")
        ) {
            closeCardModal();
        }
    }
);

/* 起動 */

loadCards();